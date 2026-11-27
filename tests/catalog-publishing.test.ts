import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, type RulesTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import { deleteApp as deleteAdminApp } from 'firebase-admin/app';
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app';
import { connectFirestoreEmulator, disableNetwork, doc, Firestore, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { CatalogPublisher, emulatorProject, openPublishingEmulator } from '../scripts/catalogPublishing';
import { embeddedCatalog, CatalogSnapshot } from '../src/data/catalog';
import { MAX_CATALOG_PAYLOAD_BYTES, publicationHeadPath, releasePath } from '../src/data/catalogPublication';
import { loadBestCatalog } from '../src/data/catalogService';
import { FirestoreContentRepository } from '../src/firebase/firestoreContentRepository';
import { retiredEvents, eventsForPersonalHistory } from '../src/data/retiredEvents';
import { resolveHiddenItems } from '../src/hiddenItems';
import { resolveSavedEntries } from '../src/saved';
import { CLASSICS_COLLECTION_ID } from '../src/ankara101';

const city = 'ankara';
const base = embeddedCatalog().catalogVersion;
const [baseDay, baseRevision] = base.split('.');
const releaseVersion = (revision: number) => baseDay + '.' + (Number(baseRevision) + revision - 1);
const at = new Date('2026-11-22T12:00:00Z');
const dayMs = 86_400_000;
let admin: ReturnType<typeof openPublishingEmulator>;
let environment: RulesTestEnvironment;
let publisher: CatalogPublisher;
let reader: FirestoreContentRepository;
let client: Firestore;
const apps: FirebaseApp[] = [];

before(async () => {
  admin = openPublishingEmulator();
  const port = Number(process.env.FIRESTORE_EMULATOR_HOST!.split(':')[1]);
  environment = await initializeTestEnvironment({ projectId: emulatorProject, firestore: { host: '127.0.0.1', port } });
  publisher = new CatalogPublisher(admin.db, () => at);
  const app = initializeApp({ projectId: emulatorProject, apiKey: 'emulator-only' });
  apps.push(app);
  client = getFirestore(app);
  connectFirestoreEmulator(client, '127.0.0.1', port, { mockUserToken: { sub: 'catalog-reader' } });
  reader = new FirestoreContentRepository(client);
});
beforeEach(async () => { await environment.clearFirestore(); });
after(async () => {
  await Promise.all(apps.map(app => deleteApp(app)));
  await environment?.cleanup();
  if (admin) await deleteAdminApp(admin.app);
});

function fixture(version: string, note: string, reference = at) {
  const snapshot = structuredClone(embeddedCatalog());
  snapshot.catalogVersion = version;
  snapshot.fetchedAt = reference.toISOString();
  // Use the shipped inventory and stable IDs with a deterministic rehearsal clock.
  snapshot.events = snapshot.events.map((event, index) => {
    const start = reference.getTime() + (8 + index) * dayMs;
    return { ...event, startsAt: new Date(start).toISOString(), verifiedAt: reference.toISOString().slice(0, 10),
      ...(event.endsAt && { endsAt: new Date(start + 7_200_000).toISOString() }) };
  });
  snapshot.ideas[0].note = note;
  snapshot.places[0].note = note;
  return snapshot;
}
function storage() {
  const values = new Map<string, string>();
  return { getItem: async (k: string) => values.get(k) ?? null, setItem: async (k: string, v: string) => { values.set(k, v); } };
}
async function approved(previous: string, snapshot: CatalogSnapshot) {
  const id = await publisher.stage(previous, snapshot);
  await publisher.reviewCandidate(id, true);
  return id;
}

const legacyPath = 'catalogMeta/ankara';
const legacyVersion = '2026-08-09.2';

async function seedSchemaOneLegacy() {
  const catalog = embeddedCatalog();
  const saved = [catalog.experiences[0].id];
  const dismissed = [catalog.places[0].id];
  const documents = new Map<string, Record<string, unknown>>([
    [legacyPath, { cityId: city, schemaVersion: 1, catalogVersion: legacyVersion, updatedAt: '2026-08-09T12:00:00Z' }],
    [`cities/${city}`, { id: city, legacyMarker: 'synthetic schema 1 city' }],
    [`places/${dismissed[0]}`, { id: dismissed[0], cityId: city, legacyMarker: 'synthetic schema 1 place' }],
    [`experiences/${saved[0]}`, { id: saved[0], cityId: city, legacyMarker: 'synthetic schema 1 Plan' }],
    ['ideas/idea-schema1-archive-only', { id: 'idea-schema1-archive-only', legacyMarker: 'archive only' }],
    ['users/schema1-cutover-fixture', { schemaVersion: 1, deviceMigrationVersion: 1, saved, dismissed, interests: [] }],
  ]);
  const batch = admin.db.batch();
  for (const [path, document] of documents) batch.create(admin.db.doc(path), document);
  await batch.commit();
  return { documents, saved, dismissed };
}

test('schema-1 legacy CLI fails closed by default and the shipped reader falls back', async () => {
  await seedSchemaOneLegacy();
  assert.equal((await admin.db.doc(publicationHeadPath(city)).get()).exists, false);
  const status = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/publishCatalog.ts', 'status'], { encoding: 'utf8' });
  assert.equal(status.status, 1, status.stderr);
  assert.equal(status.stderr.trim(), 'Invalid legacy metadata.');
  const id = await publisher.stage(base, fixture(releaseVersion(2), 'schema-1 baseline reproduction'));
  await assert.rejects(publisher.reviewCandidate(id, true), { message: 'Invalid legacy metadata.' });
  const disk = storage();
  const before = await loadBestCatalog(city, reader, disk);
  assert.equal(before.source, 'embedded');
  assert.deepEqual(before.snapshot, embeddedCatalog());
  assert.equal(before.remoteError, 'Remote catalog metadata is unavailable, invalid or incompatible.');
  assert.equal((await loadBestCatalog(city, undefined, disk)).source, 'embedded');
  assert.equal((await admin.db.doc(publicationHeadPath(city)).get()).exists, false);
  console.info('publisher status exit:', status.status, status.stderr.trim());
  console.info('reader before publication:', before.source, before.snapshot.catalogVersion, before.remoteError);
});

test('explicit schema-1 cutover keeps legacy and history, adopts A and B, then restores A under a newer version', async () => {
  const { documents, saved, dismissed } = await seedSchemaOneLegacy();
  const headRef = admin.db.doc(publicationHeadPath(city));
  const good = fixture(releaseVersion(2), 'Synthetic cutover A');
  const directory = mkdtempSync(join(tmpdir(), 'gezek-schema-one-'));
  const file = join(directory, 'snapshot.json');
  const cli = (...args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'scripts/publishCatalog.ts', ...args], { encoding: 'utf8' });
  let id: string;
  try {
    const status = cli('status', '--expect-schema-1', legacyVersion);
    assert.equal(status.status, 0, status.stderr);
    assert.match(status.stdout, /bootstrap: 'embedded'/);
    writeFileSync(file, JSON.stringify(good));
    const stage = cli('stage', base, file, '--expect-schema-1', legacyVersion);
    assert.equal(stage.status, 0, stage.stderr);
    id = stage.stdout.trim();
  } finally { rmSync(directory, { recursive: true, force: true }); }
  assert.match(id, /^[0-9a-f]{64}$/);
  assert.equal(await publisher.stage(base, good, legacyVersion), id);
  assert.notEqual(await publisher.stage(base, good), id);
  await assert.rejects(publisher.publish(id), /explicit digest approval/);
  await publisher.reviewCandidate(id, true);

  await admin.db.doc(legacyPath).update({ catalogVersion: '2026-08-09.3' });
  await assert.rejects(publisher.publish(id), /does not match the expected Ankara schema-1 version/);
  assert.equal((await headRef.get()).exists, false);
  assert.equal((await admin.db.doc(releasePath(city, base)).get()).exists, false);
  assert.equal((await admin.db.doc(releasePath(city, good.catalogVersion)).get()).exists, false);
  await admin.db.doc(legacyPath).set(documents.get(legacyPath)!);

  const assertHistory = (snapshot: CatalogSnapshot) => {
    const items = [...snapshot.places, ...snapshot.experiences, ...snapshot.ideas, ...eventsForPersonalHistory(snapshot.events, city)];
    assert.deepEqual(resolveSavedEntries(saved, items, snapshot.guides, []).map(row => row.id), saved);
    assert.deepEqual(resolveHiddenItems(items, dismissed).map(row => row.id), dismissed);
  };
  const disk = storage();
  const before = await loadBestCatalog(city, reader, disk);
  assert.equal(before.source, 'embedded');
  assertHistory(before.snapshot);
  const competing = fixture(releaseVersion(4), 'Competing first publication');
  const competingId = await publisher.stage(base, competing, legacyVersion);
  await publisher.reviewCandidate(competingId, true);
  assert.equal(await publisher.publish(id), 'published');
  const firstHead = (await headRef.get()).data();
  assert.equal(firstHead?.goodVersion, base);
  const baseline = (await admin.db.doc(releasePath(city, base)).get()).data();
  assert.deepEqual(baseline, { source: 'embedded', payload: JSON.stringify(embeddedCatalog()) });
  await assert.rejects(publisher.publish(competingId), /requires an absent publication head/);
  assert.equal(await publisher.publish(id), 'already published');
  assert.deepEqual((await headRef.get()).data(), firstHead);
  assert.equal((await admin.db.doc(releasePath(city, competing.catalogVersion)).get()).exists, false);

  const adopted = await loadBestCatalog(city, reader, disk);
  assert.equal(adopted.source, 'remote', adopted.remoteError ?? 'expected cutover remote');
  assert.deepEqual(adopted.snapshot, good);
  const offlineApp = initializeApp({ projectId: emulatorProject, apiKey: 'emulator-only' }, 'schema1-offline-reader');
  apps.push(offlineApp);
  const offlineClient = getFirestore(offlineApp);
  const port = Number(process.env.FIRESTORE_EMULATOR_HOST!.split(':')[1]);
  connectFirestoreEmulator(offlineClient, '127.0.0.1', port, { mockUserToken: { sub: 'catalog-reader' } });
  await disableNetwork(offlineClient);
  const offlineReader = new FirestoreContentRepository(offlineClient);
  const offline = await loadBestCatalog(city, offlineReader, disk);
  assert.equal(offline.source, 'cache');
  assert.ok(offline.remoteError);
  assert.deepEqual(offline.snapshot, good);
  assertHistory(offline.snapshot);
  await publisher.confirmGood(good.catalogVersion);

  const bad = fixture(releaseVersion(9), 'Synthetic cutover B');
  const badId = await approved(good.catalogVersion, bad);
  assert.equal(await publisher.publish(badId), 'published');
  assert.deepEqual((await loadBestCatalog(city, reader, disk)).snapshot, bad);
  const secondHead = (await headRef.get()).data();
  assert.equal(await publisher.publish(id), 'already published');
  assert.deepEqual((await headRef.get()).data(), secondHead);
  const restoreVersion = releaseVersion(10);
  assert.equal(await publisher.rollback(bad.catalogVersion, good.catalogVersion, restoreVersion), 'restored');
  const restoredHead = (await headRef.get()).data();
  assert.equal(restoredHead?.catalogVersion, restoreVersion);
  assert.equal(restoredHead?.goodVersion, good.catalogVersion);
  assert.equal(await publisher.rollback(bad.catalogVersion, good.catalogVersion, restoreVersion), 'already restored');
  assert.equal(await publisher.publish(badId), 'already published');
  assert.deepEqual((await headRef.get()).data(), restoredHead);
  const restoredRelease = (await admin.db.doc(releasePath(city, restoreVersion)).get()).data();
  assert.equal(restoredRelease?.rollbackFrom, bad.catalogVersion);
  assert.equal(restoredRelease?.restoredFrom, good.catalogVersion);
  const restored = await loadBestCatalog(city, reader, disk);
  assert.equal(restored.source, 'remote', restored.remoteError ?? 'expected restored remote');
  assert.deepEqual(restored.snapshot, { ...good, catalogVersion: restoreVersion });
  assert.deepEqual((await loadBestCatalog(city, offlineReader, disk)).snapshot, restored.snapshot);
  assertHistory(restored.snapshot);

  for (const [path, expected] of documents) assert.deepEqual((await admin.db.doc(path).get()).data(), expected, path);
  console.info(`schema-1 cutover: embedded ${base} -> remote/cache ${good.catalogVersion} -> remote ${bad.catalogVersion} -> restored remote/cache ${restoreVersion}`);
});

test('schema-1 cutover refuses wrong metadata, version floors, digest edits and unsafe initial rollback', async () => {
  const { documents } = await seedSchemaOneLegacy();
  const legacy = admin.db.doc(legacyPath);
  const metadata = documents.get(legacyPath)!;
  const version = releaseVersion(2);
  const snapshot = fixture(version, 'Synthetic candidate gate');
  const checkRejected = async (candidate: CatalogSnapshot, expected: string, error: RegExp, candidateBase = base) => {
    const id = await publisher.stage(candidateBase, candidate, expected);
    await assert.rejects(publisher.reviewCandidate(id, true), error);
    await assert.rejects(publisher.publish(id), /explicit digest approval/);
    assert.equal((await admin.db.doc(publicationHeadPath(city)).get()).exists, false);
    assert.equal((await admin.db.doc(releasePath(city, candidate.catalogVersion)).get()).exists, false);
  };
  await assert.rejects(publisher.stage(base, snapshot, '2026-08-09.0'), /Invalid expected schema-1 version/);
  await checkRejected(snapshot, '2026-08-09.3', /does not match/);
  for (const change of [{ cityId: 'other' }, { schemaVersion: 2 }, { schemaVersion: 3 }, { updatedAt: null }]) {
    await legacy.set({ ...metadata, ...change });
    await checkRejected(snapshot, legacyVersion, /does not match/);
  }
  await legacy.delete();
  await checkRejected(snapshot, legacyVersion, /does not match/);
  await legacy.set(metadata);
  await checkRejected(snapshot, legacyVersion, /Active version changed/, legacyVersion);
  await checkRejected(fixture(base, 'equal to embedded'), legacyVersion, /must be newer/);
  await legacy.update({ catalogVersion: version });
  await checkRejected(snapshot, version, /must be newer/);
  await legacy.set(metadata);

  const newDestination = structuredClone(snapshot);
  newDestination.ideas.push({ ...newDestination.ideas[0], id: 'idea-schema1-cutover-new' });
  await checkRejected(newDestination, legacyVersion, /Rollback would lose Saved\/Hidden destinations/);
  const oversized = structuredClone(snapshot);
  oversized.ideas[0].note += 'é'.repeat(MAX_CATALOG_PAYLOAD_BYTES);
  await assert.rejects(publisher.stage(base, oversized, legacyVersion), /byte limit/);
  assert.equal((await admin.db.doc(publicationHeadPath(city)).get()).exists, false);

  const id = await publisher.stage(base, snapshot, legacyVersion);
  await publisher.reviewCandidate(id, true);
  await admin.db.doc('catalogCandidates/' + id).update({ expectedSchema1Version: '2026-08-09.3' });
  await assert.rejects(publisher.publish(id), /digest mismatch/);
  assert.equal((await admin.db.doc(publicationHeadPath(city)).get()).exists, false);
});

test('schema-1 cutover stops if the embedded rollback target has expired', async () => {
  await seedSchemaOneLegacy();
  const later = new Date('2026-11-29T09:00:00Z');
  const laterPublisher = new CatalogPublisher(admin.db, () => later);
  const candidate = fixture(releaseVersion(2), 'Fresh candidate with an expired fallback', later);
  const id = await laterPublisher.stage(base, candidate, legacyVersion);
  // The same payload validates on the ordinary embedded path. This refusal is
  // specifically about the incompatible-legacy cutover's initial fallback.
  const regular = await laterPublisher.stage(base, candidate);
  const legacy = admin.db.doc(legacyPath);
  const original = (await legacy.get()).data()!;
  await legacy.delete();
  await laterPublisher.reviewCandidate(regular);
  await legacy.create(original);
  await assert.rejects(laterPublisher.reviewCandidate(id, true), { message: 'Event timing or health failed: stale_verification' });
  assert.equal((await admin.db.doc(publicationHeadPath(city)).get()).exists, false);
});

test('publishing CLI refuses a missing or non-loopback emulator host', () => {
  for (const host of ['', 'localhost:8186', '192.0.2.1:8186', '127.0.0.1:65536']) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/publishCatalog.ts', 'status'], {
      env: { ...process.env, FIRESTORE_EMULATOR_HOST: host }, encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.equal(result.stderr.trim(), 'FIRESTORE_EMULATOR_HOST must be 127.0.0.1:<port>.');
  }
});

test('approved release loads, interrupted commit is atomic, same digest can be retried', async () => {
  const good = fixture(releaseVersion(2), 'Good A');
  const id = await approved(base, good);
  const baseline = admin.db.doc(releasePath(city, base));
  // Force a genuine create-precondition failure in the transaction that also creates A and switches the head.
  await baseline.create({ sentinel: true });
  await assert.rejects(publisher.publish(id), /already exists|ALREADY_EXISTS/i);
  assert.equal((await admin.db.doc(publicationHeadPath(city)).get()).exists, false);
  assert.equal((await admin.db.doc(releasePath(city, good.catalogVersion)).get()).exists, false);
  assert.equal((await loadBestCatalog(city, reader, storage())).source, 'embedded');
  await baseline.delete();
  assert.equal(await publisher.publish(id), 'published');
  assert.equal(await publisher.stage(base, good), id);
  assert.equal(await publisher.publish(id), 'already published');
  const loaded = await loadBestCatalog(city, reader, storage());
  assert.equal(loaded.source, 'remote', loaded.remoteError ?? 'expected remote');
  assert.deepEqual(loaded.snapshot, good);
});

test('invalid, unapproved and edited-after-approval candidates leave active release intact', async () => {
  const active = fixture(releaseVersion(2), 'current');
  await publisher.publish(await approved(base, active));
  const next = fixture(releaseVersion(3), 'proposal');
  const id = await publisher.stage(active.catalogVersion, next);
  await assert.rejects(publisher.publish(id), /approval/);
  const invalid: [string, (c: CatalogSnapshot) => void, RegExp][] = [
    ['dangling stop', c => { c.experiences[0].points[0].placeId = 'missing'; }, /Invalid Ankara/],
    ['changed saved destination', c => { c.ideas[0].id = CLASSICS_COLLECTION_ID; }, /Saved destination collision/],
    ['retired ID', c => { c.events.push({ ...retiredEvents[0] }); }, /retired Event ID/],
    ['unhandled removal', c => { c.ideas.pop(); }, /Removing ideas/],
    ['Guide binding', c => { c.guides[0].id = 'unapproved'; c.guides.push(active.guides[0]); }, /Guide approval/],
    ['invalid occurrence', c => { c.events[0].startsAt = 'unknown'; }, /Event timing/],
  ];
  for (const [label, mutate, error] of invalid) {
    const change = structuredClone(next);
    mutate(change);
    const candidate = await publisher.stage(active.catalogVersion, change);
    await assert.rejects(publisher.reviewCandidate(candidate, true), error, label);
    await assert.rejects(publisher.publish(candidate), /approval/, label);
  }
  await publisher.reviewCandidate(id, true);
  await admin.db.doc('catalogCandidates/' + id).update({ payload: JSON.stringify({ ...next, ideas: active.ideas }) });
  await assert.rejects(publisher.publish(id), /digest mismatch/);
  assert.deepEqual((await loadBestCatalog(city, reader, storage())).snapshot, active);
});

test('two writers on one base get one winner and an in-flight reader completes the pinned old snapshot', async () => {
  const first = fixture(releaseVersion(2), 'original');
  await publisher.publish(await approved(base, first));
  const pinned = await reader.getCatalogMeta(city);
  assert.ok(pinned);
  const versions = [fixture(releaseVersion(3), 'one'), fixture(releaseVersion(4), 'two')];
  const ids = await Promise.all(versions.map(c => approved(first.catalogVersion, c)));
  const results = await Promise.allSettled(ids.map(id => publisher.publish(id)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.match(String(results.find(r => r.status === 'rejected')?.reason), /Active version changed/);
  assert.deepEqual(await reader.getCatalog(city, pinned), first);
  const winner = results.findIndex(r => r.status === 'fulfilled');
  assert.deepEqual((await loadBestCatalog(city, reader, storage())).snapshot, versions[winner]);
  assert.equal((await admin.db.doc(releasePath(city, versions[1 - winner].catalogVersion)).get()).exists, false);
});

test('forward rollback replaces a persisted bad catalog, restores offline and resolves Saved/Hidden history', async () => {
  const good = fixture(releaseVersion(2), 'accepted');
  await publisher.publish(await approved(base, good));
  await publisher.confirmGood(good.catalogVersion);
  const bad = fixture(releaseVersion(9), 'editorial mistake');
  const id = await approved(good.catalogVersion, bad);
  await publisher.publish(id);
  const disk = storage();
  assert.deepEqual((await loadBestCatalog(city, reader, disk)).snapshot, bad);
  const offline = await loadBestCatalog(city, undefined, disk);
  assert.equal(offline.source, 'cache');
  assert.deepEqual(offline.snapshot, bad);
  const version = releaseVersion(10);
  await assert.rejects(publisher.rollback(bad.catalogVersion, base, version), /known-good/);
  await assert.rejects(publisher.rollback(bad.catalogVersion, good.catalogVersion, good.catalogVersion), /newer/);
  assert.equal(await publisher.rollback(bad.catalogVersion, good.catalogVersion, version), 'restored');
  assert.equal(await publisher.rollback(bad.catalogVersion, good.catalogVersion, version), 'already restored');
  assert.equal(await publisher.publish(id), 'already published');
  const refreshed = await loadBestCatalog(city, reader, disk);
  assert.equal(refreshed.source, 'remote', refreshed.remoteError ?? 'expected remote');
  assert.deepEqual(refreshed.snapshot, { ...good, catalogVersion: version, fetchedAt: at.toISOString() });
  // A fresh SDK instance has no in-memory Firestore documents. Force an actual
  // transport failure and let the app read the snapshot persisted before restart.
  const offlineApp = initializeApp({ projectId: emulatorProject, apiKey: 'emulator-only' }, 'offline-reader');
  apps.push(offlineApp);
  const offlineClient = getFirestore(offlineApp);
  const port = Number(process.env.FIRESTORE_EMULATOR_HOST!.split(':')[1]);
  connectFirestoreEmulator(offlineClient, '127.0.0.1', port, { mockUserToken: { sub: 'catalog-reader' } });
  await disableNetwork(offlineClient);
  const restart = await loadBestCatalog(city, new FirestoreContentRepository(offlineClient), disk);
  assert.equal(restart.source, 'cache');
  assert.ok(restart.remoteError);
  assert.deepEqual(restart.snapshot, refreshed.snapshot);
  const s = restart.snapshot;
  const personal = [...s.places, ...s.ideas, ...s.experiences, ...eventsForPersonalHistory(s.events, city)];
  const saved = [good.ideas[0].id, retiredEvents[0].id];
  const hidden = [good.events[0].id, retiredEvents[1].id];
  assert.deepEqual(resolveSavedEntries(saved, personal, s.guides, []).map(row => row.id), [...saved].reverse());
  assert.deepEqual(resolveHiddenItems(personal, hidden).map(row => row.id), hidden);
  assert.ok(retiredEvents.every(old => !s.events.some(e => e.id === old.id)));
});

test('rollback cannot strand a destination introduced by a later release', async () => {
  const good = fixture(releaseVersion(2), 'accepted');
  await publisher.publish(await approved(base, good));
  await publisher.confirmGood(good.catalogVersion);
  const later = fixture(releaseVersion(3), 'later');
  const idea = { ...later.ideas[0], id: 'idea-emulator-new-destination' };
  later.ideas.push(idea);
  await publisher.publish(await approved(good.catalogVersion, later));

  const head = await publisher.status();
  const version = releaseVersion(4);
  await assert.rejects(publisher.rollback(later.catalogVersion, good.catalogVersion, version),
    /Rollback would lose Saved\/Hidden destinations: idea-emulator-new-destination/);
  assert.deepEqual(await publisher.status(), head);
  assert.equal((await admin.db.doc(releasePath(city, version)).get()).exists, false);
  const loaded = await loadBestCatalog(city, reader, storage());
  assert.equal(loaded.source, 'remote');
  assert.deepEqual(loaded.snapshot, later);
  assert.deepEqual(resolveSavedEntries([idea.id], loaded.snapshot.ideas, loaded.snapshot.guides, []),
    [{ type: 'catalog', id: idea.id, item: idea }]);
  assert.deepEqual(resolveHiddenItems(loaded.snapshot.ideas, [idea.id]),
    [{ kind: 'idea', id: idea.id, item: idea }]);
});

for (const eventGate of ['stale_verification', 'insufficient_upcoming_events'] as const) {
  test('rollback rechecks Event health at restore time: ' + eventGate, async () => {
    const good = fixture(releaseVersion(2), 'accepted');
    if (eventGate === 'insufficient_upcoming_events') {
      // The first six expire while every verifiedAt is still fresh and four
      // later Events still meet the horizon gate.
      for (const event of good.events.slice(0, -4)) {
        event.startsAt = new Date(at.getTime() + dayMs).toISOString();
        delete event.endsAt;
      }
    }
    await publisher.publish(await approved(base, good));
    await publisher.confirmGood(good.catalogVersion);
    const later = fixture(releaseVersion(3), 'later');
    await publisher.publish(await approved(good.catalogVersion, later));

    const head = await publisher.status();
    const version = releaseVersion(4);
    const elapsed = eventGate === 'stale_verification' ? 7 : 2;
    const atRollback = new CatalogPublisher(admin.db, () => new Date(at.getTime() + elapsed * dayMs));
    await assert.rejects(atRollback.rollback(later.catalogVersion, good.catalogVersion, version),
      { message: 'Event timing or health failed: ' + eventGate });
    assert.deepEqual(await publisher.status(), head);
    assert.equal((await admin.db.doc(releasePath(city, version)).get()).exists, false);
    const pinned = { cityId: city, catalogVersion: good.catalogVersion, schemaVersion: good.schemaVersion,
      updatedAt: at.toISOString(), publishedRelease: true } as const;
    assert.deepEqual((await reader.getCatalog(city, pinned)).events, good.events);
  });
}

test('publisher and client share the inclusive UTF-8 payload limit on the first cutover', async () => {
  await seedSchemaOneLegacy();
  const exact = fixture(releaseVersion(2), 'boundary');
  const glyphs = 'é€😀';
  const remaining = MAX_CATALOG_PAYLOAD_BYTES - Buffer.byteLength(JSON.stringify(exact), 'utf8');
  const glyphBytes = Buffer.byteLength(glyphs, 'utf8');
  exact.ideas[0].note += glyphs.repeat(Math.floor(remaining / glyphBytes)) + 'a'.repeat(remaining % glyphBytes);
  const payload = JSON.stringify(exact);
  assert.equal(Buffer.byteLength(payload, 'utf8'), MAX_CATALOG_PAYLOAD_BYTES);
  const id = await publisher.stage(base, exact, legacyVersion);
  await publisher.reviewCandidate(id, true);
  await publisher.publish(id);
  const disk = storage();
  assert.deepEqual((await loadBestCatalog(city, reader, disk)).snapshot, exact);

  const oversized = structuredClone(exact);
  oversized.catalogVersion = releaseVersion(3);
  oversized.ideas[0].note += 'a';
  const oversizedPayload = JSON.stringify(oversized);
  assert.equal(Buffer.byteLength(oversizedPayload, 'utf8'), MAX_CATALOG_PAYLOAD_BYTES + 1);
  assert.ok(oversizedPayload.length < MAX_CATALOG_PAYLOAD_BYTES);
  await assert.rejects(publisher.stage(exact.catalogVersion, oversized), /byte limit/);

  // Bypass the operator to exercise the client check against an oversized
  // release that still fits in a Firestore document.
  const batch = admin.db.batch();
  batch.create(admin.db.doc(releasePath(city, oversized.catalogVersion)), { payload: oversizedPayload });
  batch.update(admin.db.doc(publicationHeadPath(city)), { catalogVersion: oversized.catalogVersion });
  await batch.commit();
  const fallback = await loadBestCatalog(city, reader, disk);
  assert.equal(fallback.source, 'cache');
  assert.match(fallback.remoteError ?? '', /oversized catalog release/);
  assert.deepEqual(fallback.snapshot, exact);
});

test('client cannot approve, write releases, flip head or read staging, and anonymous reads are denied', async () => {
  const id = await approved(base, fixture(releaseVersion(2), 'approved'));
  await publisher.publish(id);
  const paths = ['catalogCandidates/' + id, publicationHeadPath(city), releasePath(city, releaseVersion(2))];
  await assertFails(getDoc(doc(client, paths[0])));
  for (const path of paths) {
    await assertFails(setDoc(doc(client, path), { approved: true }));
    await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), path)));
  }
});

test('legacy reader and first rollback use the actual seeded content even when newer than embedded', async () => {
  const old = fixture(releaseVersion(11), 'legacy-only edit');
  const legacy = { cityId: city, schemaVersion: 3, catalogVersion: old.catalogVersion, updatedAt: at.toISOString() };
  const batch = admin.db.batch();
  for (const family of ['cities', 'places', 'experiences', 'events', 'ideas', 'guides'] as const) {
    for (const item of old[family]) batch.set(admin.db.doc(family + '/' + item.id), JSON.parse(JSON.stringify(item)));
  }
  batch.set(admin.db.doc('catalogMeta/' + city), legacy);
  await batch.commit();
  const disk = storage();
  const original = await loadBestCatalog(city, reader, disk);
  assert.equal(original.source, 'remote', original.remoteError ?? 'expected legacy remote');
  assert.equal(original.snapshot.catalogVersion, old.catalogVersion);
  const next = fixture(releaseVersion(12), 'new release');
  await publisher.publish(await approved(old.catalogVersion, next));
  assert.deepEqual((await loadBestCatalog(city, reader, disk)).snapshot, next);
  const version = releaseVersion(13);
  await publisher.rollback(next.catalogVersion, old.catalogVersion, version);
  assert.deepEqual((await loadBestCatalog(city, reader, disk)).snapshot,
    { ...original.snapshot, catalogVersion: version, fetchedAt: at.toISOString() });
  assert.deepEqual((await admin.db.doc('catalogMeta/' + city).get()).data(), legacy);
});
