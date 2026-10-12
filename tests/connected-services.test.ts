import assert from 'node:assert/strict';
import test from 'node:test';
import type { Auth } from '@firebase/auth';
import { ensureAnonymousUser } from '../src/firebase/auth';
import { catalogCacheKey, CatalogSnapshot, embeddedCatalog, EMBEDDED_CATALOG_VERSION } from '../src/data/catalog';
import { loadCachedCatalog, saveCachedCatalog } from '../src/data/catalogCache';
import { compareCatalogVersions, isCatalogVersion } from '../src/data/catalogVersion';
import { parseCatalogMeta, parseCatalogSnapshot } from '../src/data/catalogValidation';
import { loadBestCatalog } from '../src/data/catalogService';
import type { ContentRepository } from '../src/data/contentRepository';
import { resolveObservabilitySettings } from '../src/observabilityPolicy';
import { runUserDataDeletion } from '../src/userDataDeletion';
import {
  blockDeletedUserSync,
  clearQueuedUserSync,
  enqueueUserSync,
  flushUserSync,
  isDeletedUserSyncBlocked,
  LEGACY_USER_SYNC_QUEUE_KEY,
  migrateLocalUserStateOnce,
  USER_SYNC_QUEUE_KEY,
  UserSyncStorage,
} from '../src/firebase/userSync';
import { createRemoteUserState, UserRepository } from '../src/firebase/userRepository';
import { emptyPreferences, serializePreferences } from '../src/persistence';

function memoryStore(data = new Map<string, string>()): { data: Map<string, string>; store: UserSyncStorage } {
  return {
    data,
    store: {
      getItem: async key => data.get(key) ?? null,
      setItem: async (key, value) => { data.set(key, value); },
      removeItem: async key => { data.delete(key); },
    },
  };
}

function recordingRepository(
  writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }>,
  save?: UserRepository['save'],
): UserRepository {
  return {
    load: async () => undefined,
    save: save ?? (async (uid, state) => { writes.push({ uid, state }); }),
    delete: async () => undefined,
  };
}

test('Auth failure and a stalled Auth state resolve within a bounded wait', async () => {
  const failed = { authStateReady: () => Promise.reject(new Error('offline')), currentUser: null } as unknown as Auth;
  await assert.rejects(ensureAnonymousUser(failed, 10), /offline/);
  const stalled = { authStateReady: () => new Promise<void>(() => {}), currentUser: null } as unknown as Auth;
  await assert.rejects(ensureAnonymousUser(stalled, 10), /timed out/);
});

test('failed or malformed remote catalog preserves the embedded catalog', async () => {
  const unavailable = {
    getCatalogMeta: async () => { throw new Error('network unavailable'); },
    getCatalog: async () => { throw new Error('unexpected'); },
  } as ContentRepository;
  const offline = await loadBestCatalog('ankara', unavailable);
  assert.equal(offline.source, 'embedded');
  assert.ok(offline.snapshot.places.length > 0);
  assert.match(offline.remoteError ?? '', /network unavailable/);

  const malformed = {
    getCatalogMeta: async () => ({ cityId: 'ankara', schemaVersion: 3, catalogVersion: '2026-10-13.1', updatedAt: '2026-09-22T00:00:00.000Z' }),
    getCatalog: async () => { throw new Error('corrupted remote catalog'); },
  } as ContentRepository;
  const fallback = await loadBestCatalog('ankara', malformed);
  assert.equal(fallback.source, 'embedded');
  assert.ok(fallback.snapshot.places.length > 0);
  assert.match(fallback.remoteError ?? '', /corrupted remote catalog/);
});

test('deleted UID is blocked before remote deletion and Auth failure remains explicit', async () => {
  const order: string[] = [];
  const result = await runUserDataDeletion({
    blockRemoteUserSync: async () => { order.push('block'); },
    deleteRemoteUserState: async () => { order.push('remote'); },
    clearLocalUserState: async () => { order.push('local_queue_and_preferences'); },
    deleteAnonymousAccount: async () => { order.push('auth'); throw new Error('Auth unavailable'); },
  });
  assert.deepEqual(order, ['block', 'remote', 'local_queue_and_preferences', 'auth']);
  assert.deepEqual(result, {
    remoteUserStateDeleted: true,
    anonymousAccountDeleted: false,
    anonymousAccountDeletionFailed: true,
  });
});

test('deletion clears the pending sync snapshot and blocks stale UID writes', async () => {
  const { data, store } = memoryStore();
  await enqueueUserSync('old-uid', { ...emptyPreferences, saved: ['place-1'] }, store);
  await blockDeletedUserSync('old-uid', store);
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  const repository = recordingRepository(writes);
  assert.equal(await flushUserSync('old-uid', repository, store), false);
  assert.equal(writes.length, 0);
  await clearQueuedUserSync(store);
  assert.equal(await isDeletedUserSyncBlocked('old-uid', store), true);
  assert.equal(await flushUserSync('new-uid', repository, store), true);
  assert.equal(writes.length, 0);
  assert.equal(data.has(USER_SYNC_QUEUE_KEY), false);
  assert.equal(data.has(LEGACY_USER_SYNC_QUEUE_KEY), false);
});

test('owned queue uploads only for its authenticated owner', async () => {
  const { store } = memoryStore();
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  await enqueueUserSync('owner-uid', { ...emptyPreferences, saved: ['place-1'], interests: ['Kahve'] }, store);
  assert.equal(await flushUserSync('owner-uid', recordingRepository(writes), store), true);
  assert.deepEqual(writes, [{
    uid: 'owner-uid',
    state: {
      schemaVersion: 1,
      saved: ['place-1'],
      dismissed: [],
      interests: ['Kahve'],
      deviceMigrationVersion: 1,
    },
  }]);
});

test('overlapping local state keeps dismissal precedence in a flushable owned queue', async () => {
  const { data, store } = memoryStore();
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  await enqueueUserSync('owner-uid', {
    ...emptyPreferences,
    saved: ['saved-place', 'overlap-place'],
    dismissed: ['overlap-place', 'hidden-place'],
  }, store);

  const queued = JSON.parse(data.get(USER_SYNC_QUEUE_KEY) ?? '{}');
  assert.deepEqual(queued.payload.saved, ['saved-place']);
  assert.deepEqual(queued.payload.dismissed, ['overlap-place', 'hidden-place']);
  assert.equal(await flushUserSync('owner-uid', recordingRepository(writes), store), true);
  assert.deepEqual(writes[0].state.saved, ['saved-place']);
  assert.deepEqual(writes[0].state.dismissed, ['overlap-place', 'hidden-place']);
  assert.equal(data.has(USER_SYNC_QUEUE_KEY), false);
});

test('queue owned by a different UID is discarded without upload', async () => {
  const { data, store } = memoryStore();
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  await enqueueUserSync('old-uid', { ...emptyPreferences, saved: ['old-place'] }, store);
  assert.equal(await flushUserSync('new-uid', recordingRepository(writes), store), false);
  assert.equal(writes.length, 0);
  assert.equal(data.has(USER_SYNC_QUEUE_KEY), false);
});

test('legacy unowned queue is discarded and never attached to the current UID', async () => {
  const { data, store } = memoryStore();
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  data.set(LEGACY_USER_SYNC_QUEUE_KEY, serializePreferences({ ...emptyPreferences, saved: ['legacy-place'] }));
  assert.equal(await flushUserSync('current-uid', recordingRepository(writes), store), true);
  assert.equal(writes.length, 0);
  assert.equal(data.has(LEGACY_USER_SYNC_QUEUE_KEY), false);
});

test('owner-known migration uses current local state instead of an unowned legacy snapshot', async () => {
  const { store } = memoryStore(new Map([[LEGACY_USER_SYNC_QUEUE_KEY, serializePreferences({
    ...emptyPreferences,
    saved: ['legacy-place'],
  })]]));
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  await migrateLocalUserStateOnce(
    'current-uid',
    recordingRepository(writes),
    { ...emptyPreferences, saved: ['current-local-place'] },
    store,
  );
  assert.deepEqual(writes.map(write => write.state.saved), [['current-local-place']]);
});

test('malformed queue ownership and payload metadata fail closed', async () => {
  const malformed = [
    { queueSchemaVersion: 2, ownerUid: '', payload: createRemoteUserState(emptyPreferences) },
    { queueSchemaVersion: 2, ownerUid: 'owner-uid', payload: { ...createRemoteUserState(emptyPreferences), mood: 'Sakin' } },
    { queueSchemaVersion: 99, ownerUid: 'owner-uid', payload: createRemoteUserState(emptyPreferences) },
  ];
  for (const value of malformed) {
    const { data, store } = memoryStore(new Map([[USER_SYNC_QUEUE_KEY, JSON.stringify(value)]]));
    const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
    assert.equal(await flushUserSync('owner-uid', recordingRepository(writes), store), false);
    assert.equal(writes.length, 0);
    assert.equal(data.has(USER_SYNC_QUEUE_KEY), false);
  }
});

test('a stale old-user write cannot reach a replacement anonymous UID', async () => {
  const { store } = memoryStore();
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  const repository = recordingRepository(writes);
  await enqueueUserSync('deleted-anonymous-uid', { ...emptyPreferences, dismissed: ['event-1'] }, store);
  await blockDeletedUserSync('deleted-anonymous-uid', store);
  assert.equal(await flushUserSync('deleted-anonymous-uid', repository, store), false);
  assert.equal(await flushUserSync('replacement-anonymous-uid', repository, store), false);
  assert.equal(writes.length, 0);
});

test('queue ownership survives app restart and replays for the same UID', async () => {
  const persisted = new Map<string, string>();
  await enqueueUserSync('owner-uid', { ...emptyPreferences, saved: ['place-1'] }, memoryStore(persisted).store);
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  assert.equal(await flushUserSync('owner-uid', recordingRepository(writes), memoryStore(persisted).store), true);
  assert.equal(writes.length, 1);
});

test('offline queue remains retryable and reconnects for the same UID', async () => {
  const { data, store } = memoryStore();
  await enqueueUserSync('owner-uid', { ...emptyPreferences, saved: ['place-1'] }, store);
  const offline = recordingRepository([], async () => { throw new Error('offline'); });
  await assert.rejects(flushUserSync('owner-uid', offline, store), /offline/);
  assert.equal(data.has(USER_SYNC_QUEUE_KEY), true);
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  assert.equal(await flushUserSync('owner-uid', recordingRepository(writes), store), true);
  assert.equal(writes.length, 1);
});

test('compare-before-remove preserves a newer owned snapshot queued during upload', async () => {
  const { data, store } = memoryStore();
  await enqueueUserSync('owner-uid', { ...emptyPreferences, saved: ['old-place'] }, store);
  const writes: Array<{ uid: string; state: ReturnType<typeof createRemoteUserState> }> = [];
  const repository = recordingRepository(writes, async (uid, state) => {
    writes.push({ uid, state });
    await enqueueUserSync('owner-uid', { ...emptyPreferences, saved: ['new-place'] }, store);
  });
  assert.equal(await flushUserSync('owner-uid', repository, store), true);
  assert.equal(data.has(USER_SYNC_QUEUE_KEY), true);
  assert.deepEqual(writes[0].state.saved, ['old-place']);
  assert.equal(await flushUserSync('owner-uid', recordingRepository(writes), store), true);
  assert.deepEqual(writes[1].state.saved, ['new-place']);
  assert.equal(data.has(USER_SYNC_QUEUE_KEY), false);
});

test('queued remote payload remains minimized to the Firestore allowlist', async () => {
  const { data, store } = memoryStore();
  await enqueueUserSync('owner-uid', {
    ...emptyPreferences,
    saved: ['place-1'],
    mood: 'Sakin',
    budget: '₺₺',
    groupSize: 'Tek',
    duration: '1–2 saat',
    contextConfirmedAt: '2026-09-24T08:00:00.000Z',
    onboardingCompleted: true,
  }, store);
  const queued = JSON.parse(data.get(USER_SYNC_QUEUE_KEY) ?? '{}');
  assert.deepEqual(Object.keys(queued).sort(), ['ownerUid', 'payload', 'queueSchemaVersion']);
  assert.deepEqual(Object.keys(queued.payload).sort(), [
    'deviceMigrationVersion',
    'dismissed',
    'interests',
    'saved',
    'schemaVersion',
  ]);
  assert.equal('mood' in queued.payload, false);
  assert.equal('budget' in queued.payload, false);
  assert.equal('groupSize' in queued.payload, false);
  assert.equal('duration' in queued.payload, false);
  assert.equal('contextConfirmedAt' in queued.payload, false);
  assert.equal('onboardingCompleted' in queued.payload, false);
});

test('beta observability label remains distinct from production', () => {
  const dsn = 'https://publickey@o123.ingest.sentry.io/456';
  assert.deepEqual(resolveObservabilitySettings({
    EXPO_PUBLIC_APP_ENV: 'development', EXPO_PUBLIC_SERVICE_TIER: 'beta', EXPO_PUBLIC_SENTRY_DSN: dsn,
  }), { environment: 'beta', mode: 'sentry', dsn });
  assert.equal(resolveObservabilitySettings({
    EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_SERVICE_TIER: 'production', EXPO_PUBLIC_SENTRY_DSN: dsn,
  }).environment, 'production');
  assert.throws(() => resolveObservabilitySettings({
    EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_SERVICE_TIER: 'beta', EXPO_PUBLIC_SENTRY_DSN: dsn,
  }), /development runtime/);
});


const snapshotAt = (catalogVersion: string): CatalogSnapshot => ({
  ...embeddedCatalog('ankara'), catalogVersion, fetchedAt: '2026-10-12T20:00:00.000Z',
});
const remoteCatalog = (snapshot: CatalogSnapshot): ContentRepository => ({
  getCatalogMeta: async () => ({
    cityId: snapshot.cityId, schemaVersion: snapshot.schemaVersion,
    catalogVersion: snapshot.catalogVersion, updatedAt: snapshot.fetchedAt,
  }),
  getCatalog: async () => snapshot,
});

function catalogStore(snapshot?: unknown) {
  return memoryStore(snapshot === undefined ? new Map() : new Map([
    [catalogCacheKey('ankara'), JSON.stringify(snapshot)],
  ]));
}

test('catalog versions compare calendar dates and numeric revisions, rejecting malformed values', () => {
  for (const [left, right, expected] of [
    ['2026-10-12.1', '2026-09-21.99', 1],
    ['2026-10-12.10', '2026-10-12.2', 1],
    ['2026-10-12.2', '2026-10-12.10', -1],
    ['2026-10-12.1', '2026-10-12.1', 0],
    ['2024-02-29.1', '2024-03-01.1', -1],
  ] as const) {
    assert.equal(compareCatalogVersions(left, right), expected);
    assert.equal(compareCatalogVersions(right, left), expected === 0 ? 0 : -expected);
  }
  for (const value of ['', 'broken', '2026-2-01.1', '2026-02-30.1', '2025-02-29.1',
    '2026-13-01.1', '0000-01-01.1', '2026-10-12.0', '2026-10-12.01',
    '2026-10-12.-1', '2026-10-12.1.0', '2026-10-12.9007199254740992',
    ' 2026-10-12.1', '2026-10-12.1\n']) {
    assert.equal(isCatalogVersion(value), false, value);
    assert.equal(compareCatalogVersions(value, EMBEDDED_CATALOG_VERSION), undefined, value);
    assert.equal(compareCatalogVersions(EMBEDDED_CATALOG_VERSION, value), undefined, value);
  }
  assert.equal(isCatalogVersion(null), false);
});

test('new embedded catalog wins over older valid cache without deleting existing app data', async () => {
  const old = snapshotAt('2026-09-21.1');
  old.events = [{ ...old.events[0], id: 'upgrade-expired-event', startsAt: '2026-09-22T10:00:00+03:00' }];
  assert.ok(parseCatalogSnapshot(old));
  const { data, store } = catalogStore(old);
  data.set('unrelated-user-preferences', 'preserved');
  const result = await loadBestCatalog('ankara', remoteCatalog(old), store);
  assert.equal(result.source, 'embedded');
  assert.equal(result.snapshot.catalogVersion, '2026-10-12.1');
  assert.equal(result.snapshot.fetchedAt, '2026-10-12T19:16:13.000Z');
  assert.equal(result.snapshot.events.length, 9);
  assert.deepEqual(result.snapshot.events, embeddedCatalog().events);
  assert.ok(result.snapshot.events.every(event => Date.parse(event.startsAt) > Date.parse('2026-10-12T23:59:59+03:00')));
  assert.equal(data.get('unrelated-user-preferences'), 'preserved');
  assert.equal(JSON.parse(data.get(catalogCacheKey('ankara'))!).catalogVersion, old.catalogVersion);
  assert.equal((await loadBestCatalog('ankara', undefined, store)).source, 'embedded');
});

test('equal-version cache reuse avoids remote collection reads and cache writes', async () => {
  const cached = snapshotAt(EMBEDDED_CATALOG_VERSION);
  const { data, store } = catalogStore(cached);
  const before = data.get(catalogCacheKey('ankara'));
  const remote = remoteCatalog(cached);
  remote.getCatalog = async () => { throw new Error('must not refresh equal version'); };
  const result = await loadBestCatalog('ankara', remote, store);
  assert.equal(result.source, 'cache');
  assert.equal(result.snapshot.fetchedAt, cached.fetchedAt);
  assert.equal(result.remoteError, undefined);
  assert.equal(data.get(catalogCacheKey('ankara')), before);
});

test('newer compatible cache wins over embedded and older remote metadata is not fetched', async () => {
  const cached = snapshotAt('2026-10-13.2');
  const { store } = catalogStore(cached);
  for (const version of ['2026-09-21.1', EMBEDDED_CATALOG_VERSION, '2026-10-13.1', cached.catalogVersion]) {
    const remote = remoteCatalog(snapshotAt(version));
    remote.getCatalog = async () => { throw new Error('must not fetch older/equal remote'); };
    const result = await loadBestCatalog('ankara', remote, store);
    assert.equal(result.source, 'cache');
    assert.equal(result.snapshot.catalogVersion, cached.catalogVersion);
    assert.equal(result.remoteError, undefined);
  }
  assert.equal((await loadBestCatalog('ankara', undefined, store)).snapshot.catalogVersion, cached.catalogVersion);
});

test('newer compatible remote wins, is cached and is reused offline', async () => {
  const { store } = catalogStore(snapshotAt('2026-09-21.1'));
  const newer = snapshotAt('2026-10-13.10');
  const result = await loadBestCatalog('ankara', remoteCatalog(newer), store);
  assert.equal(result.source, 'remote');
  assert.deepEqual(result.snapshot, newer);
  assert.deepEqual(await loadCachedCatalog('ankara', store), newer);
  const offline = await loadBestCatalog('ankara', undefined, store);
  assert.equal(offline.source, 'cache');
  assert.deepEqual(offline.snapshot, newer);
});

test('older remote snapshot behind newer metadata cannot downgrade the newest local catalog', async () => {
  for (const cached of [undefined, snapshotAt('2026-10-13.1')]) {
    const { data, store } = catalogStore(cached);
    const before = data.get(catalogCacheKey('ankara'));
    const remote = remoteCatalog(snapshotAt('2026-10-14.1'));
    remote.getCatalog = async () => snapshotAt('2026-09-21.1');
    const result = await loadBestCatalog('ankara', remote, store);
    assert.equal(result.snapshot.catalogVersion, cached?.catalogVersion ?? EMBEDDED_CATALOG_VERSION);
    assert.match(result.remoteError!, /version changed/);
    assert.equal(data.get(catalogCacheKey('ankara')), before);
  }
});

test('remote errors retain the newest safe local catalog', async () => {
  for (const cached of [undefined, snapshotAt('2026-09-21.1'), snapshotAt('2026-10-13.1')]) {
    for (const stage of ['metadata', 'snapshot']) {
      const { store } = catalogStore(cached);
      const remote = remoteCatalog(snapshotAt('2026-10-14.1'));
      if (stage === 'metadata') remote.getCatalogMeta = async () => { throw new Error('offline metadata'); };
      else remote.getCatalog = async () => { throw new Error('offline snapshot'); };
      const result = await loadBestCatalog('ankara', remote, store);
      assert.equal(result.snapshot.catalogVersion, cached?.catalogVersion === '2026-10-13.1' ? cached.catalogVersion : EMBEDDED_CATALOG_VERSION);
      assert.match(result.remoteError!, /offline/);
    }
  }
});

test('metadata and snapshot timeouts retain the newest local catalog; late results are not cached', async () => {
  for (const stage of ['metadata', 'snapshot']) {
    const cached = snapshotAt('2026-10-13.1');
    const { data, store } = catalogStore(cached);
    const before = data.get(catalogCacheKey('ankara'));
    const remote = remoteCatalog(snapshotAt('2026-10-14.1'));
    let finish: () => void = () => {};
    if (stage === 'metadata') remote.getCatalogMeta = () => new Promise(resolve => {
      finish = () => resolve({ cityId: 'ankara', schemaVersion: 3, catalogVersion: '2026-10-14.1', updatedAt: cached.fetchedAt });
    });
    else remote.getCatalog = () => new Promise(resolve => { finish = () => resolve(snapshotAt('2026-10-14.1')); });
    const started = Date.now();
    const result = await loadBestCatalog('ankara', remote, store);
    assert.ok(Date.now() - started < 8_000);
    assert.equal(result.source, 'cache');
    assert.equal(result.snapshot.catalogVersion, cached.catalogVersion);
    assert.match(result.remoteError!, /timed out/);
    finish();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(data.get(catalogCacheKey('ankara')), before);
  }
});

test('malformed, incompatible and wrong-city caches and remote snapshots fail closed', async () => {
  const valid = snapshotAt('2026-10-14.1');
  const invalid = [
    { ...valid, catalogVersion: 'invalid' },
    { ...valid, catalogVersion: '2026-02-30.1' },
    { ...valid, schemaVersion: 999 },
    { ...valid, places: [] },
    { ...valid, events: [{ ...valid.events[0], sourceUrl: 'javascript:bad' }] },
    { ...valid, cities: valid.cities.map(city => ({ ...city, id: 'wrong-city' })) },
  ];
  for (const snapshot of invalid) {
    assert.equal(parseCatalogSnapshot(snapshot), undefined);
    const { store } = catalogStore(snapshot);
    assert.equal(await loadCachedCatalog('ankara', store), undefined);
    assert.equal((await loadBestCatalog('ankara', undefined, store)).source, 'embedded');
    await assert.rejects(saveCachedCatalog(snapshot as CatalogSnapshot, store), /invalid/);
    const remote = remoteCatalog(valid);
    remote.getCatalog = async () => snapshot as CatalogSnapshot;
    const result = await loadBestCatalog('ankara', remote, store);
    assert.equal(result.source, 'embedded');
    assert.match(result.remoteError!, /invalid or incompatible/);
  }
  const wrongCity: CatalogSnapshot = {
    ...valid, cityId: 'istanbul', cities: valid.cities.map(city => ({ ...city, id: 'istanbul' })),
    places: valid.places.map(place => ({ ...place, cityId: 'istanbul' })),
    experiences: valid.experiences.map(item => ({ ...item, cityId: 'istanbul' })),
    events: valid.events.map(item => ({ ...item, cityId: 'istanbul' })),
    guides: valid.guides.map(item => ({ ...item, cityId: 'istanbul' })),
  };
  assert.ok(parseCatalogSnapshot(wrongCity));
  const { store } = catalogStore(wrongCity);
  assert.equal(await loadCachedCatalog('ankara', store), undefined);
  const remote = remoteCatalog(valid);
  remote.getCatalog = async () => wrongCity;
  assert.equal((await loadBestCatalog('ankara', remote, store)).source, 'embedded');
  const brokenJson = memoryStore(new Map([[catalogCacheKey('ankara'), '{broken']]));
  assert.equal(await loadCachedCatalog('ankara', brokenJson.store), undefined);
});

test('invalid, incompatible and wrong-city remote metadata is rejected before snapshot reads', async () => {
  for (const changes of [{ catalogVersion: 'broken' }, { schemaVersion: 999 }, { cityId: 'istanbul' }]) {
    const valid = snapshotAt('2026-10-14.1');
    const remote = remoteCatalog(valid);
    const meta = { ...(await remote.getCatalogMeta('ankara'))!, ...changes };
    if ('catalogVersion' in changes) assert.equal(parseCatalogMeta(meta), undefined);
    remote.getCatalogMeta = async () => meta;
    remote.getCatalog = async () => { throw new Error('must not read'); };
    const result = await loadBestCatalog('ankara', remote, catalogStore().store);
    assert.equal(result.source, 'embedded');
    assert.match(result.remoteError!, /metadata/);
  }
});
