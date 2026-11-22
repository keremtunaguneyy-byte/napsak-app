import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, type RulesTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import { deleteApp as deleteAdminApp } from 'firebase-admin/app';
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app';
import { connectFirestoreEmulator, disableNetwork, doc, Firestore, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { CatalogPublisher, emulatorProject, openPublishingEmulator } from '../scripts/catalogPublishing';
import { embeddedCatalog, CatalogSnapshot } from '../src/data/catalog';
import { publicationHeadPath, releasePath } from '../src/data/catalogPublication';
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

function fixture(version: string, note: string) {
  const snapshot = structuredClone(embeddedCatalog());
  snapshot.catalogVersion = version;
  snapshot.fetchedAt = at.toISOString();
  // Use the shipped inventory and stable IDs with a deterministic rehearsal clock.
  snapshot.events = snapshot.events.map((event, index) => {
    const start = at.getTime() + (8 + index) * dayMs;
    return { ...event, startsAt: new Date(start).toISOString(), verifiedAt: at.toISOString().slice(0, 10),
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
