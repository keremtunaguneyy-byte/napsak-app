import assert from 'node:assert/strict';
import test from 'node:test';
import type { Auth } from '@firebase/auth';
import { ensureAnonymousUser } from '../src/firebase/auth';
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
    getCatalogMeta: async () => ({ cityId: 'ankara', schemaVersion: 3, catalogVersion: 'broken', updatedAt: '2026-09-22T00:00:00.000Z' }),
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
