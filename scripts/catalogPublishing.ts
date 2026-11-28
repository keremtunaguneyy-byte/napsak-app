import { initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore, Transaction } from 'firebase-admin/firestore';
import { embeddedCatalog } from '../src/data/catalog';
import { FIRESTORE_READ_LIMITS, publicationHeadPath, releasePath } from '../src/data/catalogPublication';
import { parseCatalogMeta } from '../src/data/catalogValidation';
import { compareCatalogVersions, isCatalogVersion } from '../src/data/catalogVersion';
import { candidateDigest, checkSize, parsePayload, payloadDigest, requireNewer, requireSavedHiddenContinuity, validateCandidate, validateRollback } from './catalogPublishingValidation';

const city = 'ankara';
const embedded = embeddedCatalog(city);
export const emulatorProject = 'demo-napsak';

export function openPublishingEmulator() {
  const address = process.env.FIRESTORE_EMULATOR_HOST ?? '';
  const match = /^127\.0\.0\.1:([1-9]\d{0,4})$/.exec(address);
  if (!match || Number(match[1]) > 65535) throw Error('FIRESTORE_EMULATOR_HOST must be 127.0.0.1:<port>.');
  const app = initializeApp({ projectId: emulatorProject }, 'catalog-publisher');
  const db = getFirestore(app);
  db.settings({ host: address, ssl: false });
  return { app, db };
}

type Candidate = {
  base: string;
  payload: string;
  approved: boolean;
  expectedSchema1Version?: string;
  rollbackPayload?: string;
  requirePublishedHead?: true;
};

export class CatalogPublisher {
  constructor(private readonly db: Firestore, private readonly now = () => new Date()) {}

  private readonly headPath = publicationHeadPath(city);
  private release(version: string) {
    if (!isCatalogVersion(version)) throw Error('Invalid release version.');
    return this.db.doc(releasePath(city, version));
  }
  private candidate(id: string) {
    if (!/^[0-9a-f]{64}$/.test(id)) throw Error('Use the complete candidate SHA-256.');
    return this.db.doc('catalogCandidates/' + id);
  }

  async stage(base: string, value: unknown, expectedSchema1Version?: string, rollbackValue?: unknown, requirePublishedHead = false) {
    if (!isCatalogVersion(base)) throw Error('Invalid expected base version.');
    if (expectedSchema1Version !== undefined && !isCatalogVersion(expectedSchema1Version)) throw Error('Invalid expected schema-1 version.');
    if ((expectedSchema1Version === undefined) !== (rollbackValue === undefined)) {
      throw Error('Schema-1 cutover requires both an expected legacy version and an explicit rollback snapshot.');
    }
    if (requirePublishedHead && expectedSchema1Version !== undefined) throw Error('Choose either a subsequent release or a schema-1 cutover.');
    const payload = JSON.stringify(value);
    checkSize(payload);
    const rollbackPayload = rollbackValue === undefined ? undefined : JSON.stringify(rollbackValue);
    if (rollbackPayload !== undefined) checkSize(rollbackPayload);
    const id = candidateDigest(base, payload, expectedSchema1Version, rollbackPayload, requirePublishedHead);
    const ref = this.candidate(id);
    await this.db.runTransaction(async tx => {
      if ((await tx.get(ref)).exists) return;
      if (requirePublishedHead) {
        const head = await this.readHead(tx, undefined, true);
        if (head.version !== base) throw Error('Active version changed. Stage and approve against the current base.');
      }
      tx.create(ref, { base, payload, approved: false, ...(expectedSchema1Version !== undefined && { expectedSchema1Version }),
        ...(requirePublishedHead && { requirePublishedHead: true }) });
      // Each payload keeps the existing per-document size limit independently.
      if (rollbackPayload !== undefined) tx.create(ref.collection('cutover').doc('rollback'), { payload: rollbackPayload });
    });
    return id;
  }

  private async readCandidate(tx: Transaction, id: string): Promise<Candidate> {
    const ref = this.candidate(id);
    const data = (await tx.get(ref)).data();
    if (!data || !isCatalogVersion(data.base) || typeof data.payload !== 'string'
      || (data.expectedSchema1Version !== undefined && !isCatalogVersion(data.expectedSchema1Version))
      || (data.requirePublishedHead !== undefined && (data.requirePublishedHead !== true || data.expectedSchema1Version !== undefined))) {
      throw Error('Missing candidate or digest mismatch.');
    }
    const rollbackPayload = data.expectedSchema1Version === undefined ? undefined
      : (await tx.get(ref.collection('cutover').doc('rollback'))).data()?.payload;
    if ((rollbackPayload !== undefined && typeof rollbackPayload !== 'string')
      || candidateDigest(data.base, data.payload, data.expectedSchema1Version, rollbackPayload, data.requirePublishedHead) !== id) {
      throw Error('Missing candidate or digest mismatch.');
    }
    return { base: data.base, payload: data.payload, approved: data.approved === true,
      expectedSchema1Version: data.expectedSchema1Version, rollbackPayload, requirePublishedHead: data.requirePublishedHead };
  }

  private async readHead(tx: Transaction, expectedSchema1Version?: string, requirePublishedHead = false) {
    const head = (await tx.get(this.db.doc(this.headPath))).data();
    if (head) {
      if (expectedSchema1Version !== undefined) throw Error('Schema-1 cutover requires an absent publication head.');
      const meta = parseCatalogMeta(head);
      if (!meta || meta.cityId !== city || meta.schemaVersion !== embedded.schemaVersion || !isCatalogVersion(head.goodVersion)) {
        throw Error('Invalid publication head.');
      }
      return { version: meta.catalogVersion, goodVersion: head.goodVersion, bootstrap: false as const };
    }
    if (requirePublishedHead) throw Error('A subsequent release requires an existing Ankara publication head.');
    const legacy = (await tx.get(this.db.doc('catalogMeta/' + city))).data();
    const meta = parseCatalogMeta(legacy);
    if (expectedSchema1Version !== undefined) {
      if (!isCatalogVersion(expectedSchema1Version)) throw Error('Invalid expected schema-1 version.');
      if (meta?.cityId !== city || meta.schemaVersion !== 1 || meta.catalogVersion !== expectedSchema1Version) {
        throw Error('Legacy metadata does not match the expected Ankara schema-1 version.');
      }
      return { version: embedded.catalogVersion, goodVersion: embedded.catalogVersion,
        bootstrap: 'embedded' as const, expectedSchema1Version };
    }
    if (legacy) {
      if (!meta || meta.cityId !== city || meta.schemaVersion !== embedded.schemaVersion) throw Error('Invalid legacy metadata.');
      if (compareCatalogVersions(meta.catalogVersion, embedded.catalogVersion) !== -1) {
        return { version: meta.catalogVersion, goodVersion: meta.catalogVersion, bootstrap: 'legacy' as const };
      }
    }
    return { version: embedded.catalogVersion, goodVersion: embedded.catalogVersion, bootstrap: 'embedded' as const };
  }

  // Capture the exact legacy inventory in the activation transaction, including global Ideas.
  private async readLegacy(tx: Transaction, version: string) {
    const inventory = async (name: string, maximum: number) => {
      const collection = this.db.collection(name);
      const query = name === 'ideas' ? collection : collection.where('cityId', '==', city);
      const rows = await tx.get(query.limit(maximum + 1));
      if (rows.size > maximum) throw Error('Oversized legacy collection: ' + name);
      return rows.docs.map(row => {
        const value = row.data();
        if (value.id !== row.id) throw Error('Legacy document ID mismatch: ' + row.ref.path);
        return value;
      }).sort((a, b) => a.id.localeCompare(b.id));
    };
    const [owner, places, experiences, events, ideas, guides] = await Promise.all([
      tx.get(this.db.doc('cities/' + city)), inventory('places', FIRESTORE_READ_LIMITS.placesPerCity),
      inventory('experiences', FIRESTORE_READ_LIMITS.experiencesPerCity), inventory('events', FIRESTORE_READ_LIMITS.eventsPerCity),
      inventory('ideas', FIRESTORE_READ_LIMITS.globalIdeas), inventory('guides', FIRESTORE_READ_LIMITS.guidesPerCity),
    ]);
    return parsePayload(JSON.stringify({ cityId: city, schemaVersion: embedded.schemaVersion, catalogVersion: version,
      fetchedAt: this.now().toISOString(), cities: [owner.data()], places, experiences, events, ideas, guides }));
  }

  status(expectedSchema1Version?: string) {
    return this.db.runTransaction(tx => this.readHead(tx, expectedSchema1Version));
  }

  private async readRelease(tx: Transaction, version: string) {
    const data = (await tx.get(this.release(version))).data();
    if (typeof data?.payload !== 'string') throw Error('Missing release: ' + version);
    if (data.source === 'explicit-cutover' && payloadDigest(data.payload) !== data.rollbackDigest) throw Error('Rollback snapshot digest mismatch.');
    const snapshot = parsePayload(data.payload);
    if (snapshot.catalogVersion !== version) throw Error('Release identity mismatch.');
    return snapshot;
  }

  private async review(tx: Transaction, candidate: Candidate) {
    const head = await this.readHead(tx, candidate.expectedSchema1Version, candidate.requirePublishedHead);
    if (head.version !== candidate.base) throw Error('Active version changed. Stage and approve against the current base.');
    const previous = head.bootstrap === 'legacy' ? await this.readLegacy(tx, head.version)
      : head.bootstrap === 'embedded' ? embedded : await this.readRelease(tx, head.version);
    const now = this.now();
    const snapshot = validateCandidate(candidate.payload, previous, now);
    requireNewer(snapshot.catalogVersion, embedded.catalogVersion);
    if (candidate.expectedSchema1Version === undefined) return { head, previous, snapshot };
    if (candidate.rollbackPayload === undefined) throw Error('Restage schema-1 cutover with an explicit rollback snapshot.');
    const rollbackPayload = candidate.rollbackPayload;
    const rollback = validateCandidate(rollbackPayload, previous, now);
    requireNewer(rollback.catalogVersion, candidate.expectedSchema1Version);
    requireNewer(snapshot.catalogVersion, rollback.catalogVersion);
    requireSavedHiddenContinuity(previous, snapshot, 'Cutover');
    requireSavedHiddenContinuity(previous, rollback, 'Cutover');
    validateRollback(rollbackPayload, snapshot, now);
    return { head, previous, snapshot, rollback: { version: rollback.catalogVersion, payload: rollbackPayload, digest: payloadDigest(rollbackPayload) } };
  }

  async reviewCandidate(id: string, approve = false) {
    return this.db.runTransaction(async tx => {
      const candidate = await this.readCandidate(tx, id);
      const { snapshot, rollback } = await this.review(tx, candidate);
      if (approve) tx.update(this.candidate(id), { approved: true });
      return { digest: id, base: candidate.base, version: snapshot.catalogVersion, approved: approve || candidate.approved,
        ...(rollback && { rollbackVersion: rollback.version, rollbackDigest: rollback.digest }) };
    });
  }

  private setHead(tx: Transaction, version: string, goodVersion: string) {
    tx.set(this.db.doc(this.headPath), { cityId: city, schemaVersion: embedded.schemaVersion,
      catalogVersion: version, goodVersion, updatedAt: this.now().toISOString() });
  }

  async publish(id: string) {
    return this.db.runTransaction(async tx => {
      const candidate = await this.readCandidate(tx, id);
      if (!candidate.approved) throw Error('Candidate requires explicit digest approval.');
      const { catalogVersion } = parsePayload(candidate.payload);
      const ref = this.release(catalogVersion);
      const existing = (await tx.get(ref)).data();
      if (existing?.candidate === id) return 'already published';
      if (existing) throw Error('Release version already used.');
      const { head, previous, rollback } = await this.review(tx, candidate);
      if (rollback) tx.create(this.release(rollback.version), {
        payload: rollback.payload, source: 'explicit-cutover', cutoverCandidate: id, rollbackDigest: rollback.digest,
      });
      else if (head.bootstrap) tx.create(this.release(head.version), { payload: JSON.stringify(previous), source: head.bootstrap });
      tx.create(ref, { candidate: id, payload: candidate.payload,
        ...(rollback && { rollbackVersion: rollback.version, rollbackDigest: rollback.digest }) });
      this.setHead(tx, catalogVersion, rollback?.version ?? head.goodVersion);
      return 'published';
    });
  }

  async confirmGood(version: string) {
    return this.db.runTransaction(async tx => {
      const head = await this.readHead(tx);
      if (head.bootstrap || head.version !== version) throw Error('Only the current published version can be confirmed good.');
      await this.readRelease(tx, version);
      this.setHead(tx, version, version);
      return { goodVersion: version };
    });
  }

  async rollback(from: string, good: string, version: string) {
    requireNewer(version, from);
    requireNewer(version, embedded.catalogVersion);
    return this.db.runTransaction(async tx => {
      const ref = this.release(version);
      const existing = (await tx.get(ref)).data();
      if (existing?.rollbackFrom === from && existing?.restoredFrom === good) return 'already restored';
      if (existing) throw Error('Release version already used.');
      const head = await this.readHead(tx);
      if (head.bootstrap || head.version !== from || head.goodVersion !== good || from === good) {
        throw Error('Rollback requires the current bad version and its confirmed known-good version.');
      }
      const active = await this.readRelease(tx, from);
      const snapshot = await this.readRelease(tx, good);
      const now = this.now();
      const payload = JSON.stringify({ ...snapshot, catalogVersion: version, fetchedAt: now.toISOString() });
      validateRollback(payload, active, now);
      tx.create(ref, { rollbackFrom: from, restoredFrom: good, payload });
      this.setHead(tx, version, good);
      return 'restored';
    });
  }
}
