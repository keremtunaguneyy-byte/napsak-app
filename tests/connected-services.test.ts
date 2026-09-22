import assert from 'node:assert/strict';
import test from 'node:test';
import type { Auth } from '@firebase/auth';
import { ensureAnonymousUser } from '../src/firebase/auth';
import { loadBestCatalog } from '../src/data/catalogService';
import type { ContentRepository } from '../src/data/contentRepository';
import { resolveObservabilitySettings } from '../src/observabilityPolicy';
import { runUserDataDeletion } from '../src/userDataDeletion';
import { blockDeletedUserSync, clearQueuedUserSync, enqueueUserSync, flushUserSync, isDeletedUserSyncBlocked, UserSyncStorage } from '../src/firebase/userSync';
import { emptyPreferences } from '../src/persistence';

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
  const data = new Map<string, string>();
  const store: UserSyncStorage = {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => { data.set(key, value); },
    removeItem: async key => { data.delete(key); },
  };
  await enqueueUserSync({ ...emptyPreferences, saved: ['place-1'] }, store);
  await blockDeletedUserSync('old-uid', store);
  let saves = 0;
  const repository = {
    load: async () => undefined,
    save: async () => { saves += 1; },
    delete: async () => undefined,
  };
  assert.equal(await flushUserSync('old-uid', repository, store), false);
  assert.equal(saves, 0);
  await clearQueuedUserSync(store);
  assert.equal(await isDeletedUserSyncBlocked('old-uid', store), true);
  assert.equal(await flushUserSync('new-uid', repository, store), true);
  assert.equal(saves, 0);
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
