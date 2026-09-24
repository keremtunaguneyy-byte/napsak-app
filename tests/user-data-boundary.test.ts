import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clearPreferences,
  emptyPreferences,
  loadPreferences,
  PREFERENCE_STORAGE_KEY,
  PreferenceStorage,
  savePreferences,
} from '../src/persistence';
import {
  blockDeletedUserSync,
  clearQueuedUserSync,
  enqueueUserSync,
  flushUserSync,
  isDeletedUserSyncBlocked,
  migrateLocalUserStateOnce,
  USER_SYNC_QUEUE_KEY,
  UserSyncStorage,
} from '../src/firebase/userSync';
import { createRemoteUserState, RemoteUserState, UserRepository } from '../src/firebase/userRepository';
import { UserDataBoundary, UserDataBoundaryDependencies } from '../src/userDataBoundary';

type StorageControl = {
  failRemoveKeys: Set<string>;
  failSetKeys: Set<string>;
};

type Harness = {
  boundary: UserDataBoundary;
  control: StorageControl;
  data: Map<string, string>;
  events: string[];
  store: PreferenceStorage & UserSyncStorage;
};

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function createMemoryStorage(
  data = new Map<string, string>(),
  control: StorageControl = { failRemoveKeys: new Set(), failSetKeys: new Set() },
): PreferenceStorage & UserSyncStorage {
  return {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => {
      if (control.failSetKeys.has(key)) throw new Error(`set failed: ${key}`);
      data.set(key, value);
    },
    removeItem: async key => {
      if (control.failRemoveKeys.has(key)) throw new Error(`remove failed: ${key}`);
      data.delete(key);
    },
  };
}

function repository(options: {
  events?: string[];
  load?: () => Promise<RemoteUserState | undefined>;
  save?: UserRepository['save'];
  delete?: UserRepository['delete'];
} = {}): UserRepository {
  return {
    load: options.load ?? (async () => createRemoteUserState(emptyPreferences)),
    save: options.save ?? (async uid => { options.events?.push(`save:${uid}`); }),
    delete: options.delete ?? (async uid => { options.events?.push(`delete:${uid}`); }),
  };
}

function createHarness(options: {
  data?: Map<string, string>;
  dependencies?: Partial<UserDataBoundaryDependencies>;
  events?: string[];
  control?: StorageControl;
} = {}): Harness {
  const data = options.data ?? new Map<string, string>();
  const control = options.control ?? { failRemoveKeys: new Set(), failSetKeys: new Set() };
  const events = options.events ?? [];
  const store = createMemoryStorage(data, control);
  const dependencies: UserDataBoundaryDependencies = {
    blockDeletedUserSync: async uid => {
      events.push(`block:${uid}`);
      await blockDeletedUserSync(uid, store);
    },
    clearPreferences: async () => {
      events.push('clear:preferences');
      await clearPreferences(store);
    },
    clearQueuedUserSync: async () => {
      events.push('clear:queue');
      await clearQueuedUserSync(store);
    },
    enqueueUserSync: (uid, preferences) => enqueueUserSync(uid, preferences, store),
    flushUserSync: (uid, userRepository) => flushUserSync(uid, userRepository, store),
    isDeletedUserSyncBlocked: uid => isDeletedUserSyncBlocked(uid, store),
    migrateLocalUserStateOnce: (uid, userRepository, preferences) => (
      migrateLocalUserStateOnce(uid, userRepository, preferences, store)
    ),
    savePreferences: preferences => savePreferences(preferences, store),
    withBoundedWait: operation => operation,
    ...options.dependencies,
  };
  return { boundary: new UserDataBoundary(dependencies), control, data, events, store };
}

async function seedLocalState(harness: Harness, uid = 'uid-a'): Promise<void> {
  await savePreferences({ ...emptyPreferences, saved: ['saved-place'], interests: ['Sanat'] }, harness.store);
  await enqueueUserSync(uid, { ...emptyPreferences, saved: ['queued-place'] }, harness.store);
}

test('happy path persists tombstone before remote delete, clears local state, and deletes Auth', async () => {
  const harness = createHarness();
  await seedLocalState(harness);
  const userRepository = repository({ events: harness.events });
  await harness.boundary.initializeUserState('uid-a', userRepository, emptyPreferences);
  harness.events.length = 0;

  const result = await harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: userRepository,
    deleteAnonymousAccount: async () => { harness.events.push('delete:auth'); },
  }));

  assert.deepEqual(harness.events, [
    'block:uid-a',
    'delete:uid-a',
    'clear:queue',
    'clear:preferences',
    'delete:auth',
  ]);
  assert.deepEqual(result, {
    remoteUserStateDeleted: true,
    anonymousAccountDeleted: true,
    anonymousAccountDeletionFailed: false,
  });
  assert.equal(await isDeletedUserSyncBlocked('uid-a', harness.store), true);
  assert.equal(harness.data.has(USER_SYNC_QUEUE_KEY), false);
  assert.equal(harness.data.has(PREFERENCE_STORAGE_KEY), false);
});

test('tombstone persistence failure stops remote deletion and preserves retryable local state', async () => {
  const events: string[] = [];
  const harness = createHarness({
    events,
    dependencies: {
      blockDeletedUserSync: async uid => {
        events.push(`block:${uid}`);
        throw new Error('tombstone unavailable');
      },
    },
  });
  await seedLocalState(harness);
  let authCalled = false;
  await assert.rejects(harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: repository({ events }),
    deleteAnonymousAccount: async () => { authCalled = true; },
  })), /tombstone unavailable/);

  assert.deepEqual(events, ['block:uid-a']);
  assert.equal(authCalled, false);
  assert.equal(harness.data.has(USER_SYNC_QUEUE_KEY), true);
  assert.equal(harness.data.has(PREFERENCE_STORAGE_KEY), true);
});

test('remote deletion failure stops local cleanup and Auth while tombstone keeps retry safe', async () => {
  const harness = createHarness();
  await seedLocalState(harness);
  let shouldFail = true;
  let authCalls = 0;
  const userRepository = repository({
    events: harness.events,
    delete: async uid => {
      harness.events.push(`delete:${uid}`);
      if (shouldFail) throw new Error('Firestore offline');
    },
  });
  const context = async () => ({
    uid: 'uid-a',
    repository: userRepository,
    deleteAnonymousAccount: async () => { authCalls += 1; },
  });

  await assert.rejects(harness.boundary.deleteCurrentUserData(context), /Firestore offline/);
  assert.equal(await isDeletedUserSyncBlocked('uid-a', harness.store), true);
  assert.equal(harness.data.has(USER_SYNC_QUEUE_KEY), true);
  assert.equal(harness.data.has(PREFERENCE_STORAGE_KEY), true);
  assert.equal(authCalls, 0);

  shouldFail = false;
  const retry = await harness.boundary.deleteCurrentUserData(context);
  assert.equal(retry.remoteUserStateDeleted, true);
  assert.equal(retry.anonymousAccountDeleted, true);
  assert.equal(authCalls, 1);
});

test('queue clear failure stops preference and Auth cleanup, and surviving queue cannot replay', async () => {
  const harness = createHarness();
  await seedLocalState(harness);
  harness.control.failRemoveKeys.add(USER_SYNC_QUEUE_KEY);
  let authCalled = false;

  await assert.rejects(harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: repository({ events: harness.events }),
    deleteAnonymousAccount: async () => { authCalled = true; },
  })), /remove failed/);

  assert.equal(harness.data.has(USER_SYNC_QUEUE_KEY), true);
  assert.equal(harness.data.has(PREFERENCE_STORAGE_KEY), true);
  assert.equal(authCalled, false);
  const writes: string[] = [];
  assert.equal(await flushUserSync('uid-a', repository({ save: async uid => { writes.push(uid); } }), harness.store), false);
  assert.deepEqual(writes, []);
});

test('preference clear failure stops Auth and same-UID restart cannot load, migrate, queue, or save', async () => {
  const harness = createHarness();
  await seedLocalState(harness);
  harness.control.failRemoveKeys.add(PREFERENCE_STORAGE_KEY);
  let authCalled = false;

  await assert.rejects(harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: repository({ events: harness.events }),
    deleteAnonymousAccount: async () => { authCalled = true; },
  })), /remove failed/);
  assert.equal(authCalled, false);
  assert.equal(harness.data.has(USER_SYNC_QUEUE_KEY), false);
  assert.equal(harness.data.has(PREFERENCE_STORAGE_KEY), true);

  const restart = createHarness({ data: harness.data, control: harness.control });
  const remoteEvents: string[] = [];
  const restartRepository = repository({
    load: async () => { remoteEvents.push('load'); return undefined; },
    save: async () => { remoteEvents.push('save'); },
  });
  const surviving = await loadPreferences(restart.store);
  await restart.boundary.initializeUserState('uid-a', restartRepository, surviving);
  await restart.boundary.queuePreferencesForRemoteSync(surviving, 'uid-a');
  assert.deepEqual(remoteEvents, []);
  assert.equal(restart.data.has(USER_SYNC_QUEUE_KEY), false);
});

test('Auth deletion failure reports an explicit partial result and same UID remains blocked after restart', async () => {
  const harness = createHarness();
  await seedLocalState(harness);
  const result = await harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: repository({ events: harness.events }),
    deleteAnonymousAccount: async () => { throw new Error('requires recent login'); },
  }));
  assert.deepEqual(result, {
    remoteUserStateDeleted: true,
    anonymousAccountDeleted: false,
    anonymousAccountDeletionFailed: true,
  });

  const restart = createHarness({ data: harness.data });
  const remoteEvents: string[] = [];
  const restartRepository = repository({
    load: async () => { remoteEvents.push('load'); return undefined; },
    save: async () => { remoteEvents.push('save'); },
  });
  await restart.boundary.initializeUserState('uid-a', restartRepository, emptyPreferences);
  await restart.boundary.queuePreferencesForRemoteSync({ ...emptyPreferences, saved: ['late'] }, 'uid-a');
  assert.deepEqual(remoteEvents, []);
  assert.equal(restart.data.has(USER_SYNC_QUEUE_KEY), false);
});

test('Auth timeout is an unconfirmed partial result and does not cancel or remove the tombstone', async () => {
  const accountDeletion = deferred<void>();
  const harness = createHarness({
    dependencies: {
      withBoundedWait: async (operation, _timeoutMs, message) => {
        if (message === 'Anonymous Auth deletion timed out.') throw new Error(message);
        return operation;
      },
    },
  });
  await seedLocalState(harness);

  const result = await harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: repository({ events: harness.events }),
    deleteAnonymousAccount: () => accountDeletion.promise,
  }));
  assert.deepEqual(result, {
    remoteUserStateDeleted: true,
    anonymousAccountDeleted: false,
    anonymousAccountDeletionFailed: true,
  });
  assert.equal(await isDeletedUserSyncBlocked('uid-a', harness.store), true);
  accountDeletion.resolve();
  await accountDeletion.promise;
  assert.equal(await isDeletedUserSyncBlocked('uid-a', harness.store), true);
});

test('delayed preference persistence finishes before deletion clear and cannot repopulate v5', async () => {
  const saveStarted = deferred<void>();
  const releaseSave = deferred<void>();
  const harness = createHarness({
    dependencies: {
      savePreferences: async preferences => {
        saveStarted.resolve();
        await releaseSave.promise;
        await savePreferences(preferences, harness.store);
      },
    },
  });
  const delayedSave = harness.boundary.persistPreferences({ ...emptyPreferences, saved: ['racing-place'] });
  await saveStarted.promise;
  let deletionSettled = false;
  const deletion = harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: repository({ events: harness.events }),
  })).finally(() => { deletionSettled = true; });
  const staleWriteAfterRequest = harness.boundary.persistPreferences({
    ...emptyPreferences,
    saved: ['after-delete-request'],
  });
  await Promise.resolve();
  assert.equal(deletionSettled, false);

  releaseSave.resolve();
  await delayedSave;
  await deletion;
  await staleWriteAfterRequest;
  assert.equal(harness.data.has(PREFERENCE_STORAGE_KEY), false);
  assert.deepEqual(await loadPreferences(harness.store), emptyPreferences);
});

test('surviving device-scoped v5 can migrate to UID B only after deletion failed explicitly', async () => {
  const harness = createHarness();
  await savePreferences({ ...emptyPreferences, saved: ['device-place'], interests: ['Doğa'] }, harness.store);
  harness.control.failRemoveKeys.add(PREFERENCE_STORAGE_KEY);
  await assert.rejects(harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: repository(),
  })), /remove failed/);

  harness.control.failRemoveKeys.delete(PREFERENCE_STORAGE_KEY);
  const survivingPreferences = await loadPreferences(harness.store);
  const writes: Array<{ uid: string; state: RemoteUserState }> = [];
  const uidBRepository = repository({
    load: async () => undefined,
    save: async (uid, state) => { writes.push({ uid, state }); },
  });
  const identityChanged = createHarness({ data: harness.data, control: harness.control });
  await identityChanged.boundary.initializeUserState('uid-b', uidBRepository, survivingPreferences);

  assert.deepEqual(writes, [{
    uid: 'uid-b',
    state: createRemoteUserState({ ...emptyPreferences, saved: ['device-place'], interests: ['Doğa'] }),
  }]);
});

test('A to B to delete B replaces the single tombstone while old A queue cannot upload as B', async () => {
  const harness = createHarness();
  await harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-a',
    repository: repository(),
    deleteAnonymousAccount: async () => { throw new Error('Auth unavailable'); },
  }));
  assert.equal(await isDeletedUserSyncBlocked('uid-a', harness.store), true);

  await enqueueUserSync('uid-a', { ...emptyPreferences, saved: ['old-a-place'] }, harness.store);
  const uidBWrites: string[] = [];
  assert.equal(await flushUserSync('uid-b', repository({ save: async uid => { uidBWrites.push(uid); } }), harness.store), false);
  assert.deepEqual(uidBWrites, []);

  await harness.boundary.deleteCurrentUserData(async () => ({
    uid: 'uid-b',
    repository: repository(),
    deleteAnonymousAccount: async () => { throw new Error('Auth unavailable'); },
  }));
  assert.equal(await isDeletedUserSyncBlocked('uid-a', harness.store), false);
  assert.equal(await isDeletedUserSyncBlocked('uid-b', harness.store), true);

  const restartB = createHarness({ data: harness.data });
  const remoteEvents: string[] = [];
  await restartB.boundary.initializeUserState('uid-b', repository({
    load: async () => { remoteEvents.push('load'); return undefined; },
    save: async () => { remoteEvents.push('save'); },
  }), emptyPreferences);
  assert.deepEqual(remoteEvents, []);
});

test('retrying an already tombstoned UID reruns deletion safely', async () => {
  const harness = createHarness();
  let authShouldFail = true;
  let remoteDeletes = 0;
  const context = async () => ({
    uid: 'uid-a',
    repository: repository({ delete: async () => { remoteDeletes += 1; } }),
    deleteAnonymousAccount: async () => {
      if (authShouldFail) throw new Error('Auth unavailable');
    },
  });

  const first = await harness.boundary.deleteCurrentUserData(context);
  assert.equal(first.anonymousAccountDeletionFailed, true);
  authShouldFail = false;
  const retry = await harness.boundary.deleteCurrentUserData(context);
  assert.equal(retry.anonymousAccountDeleted, true);
  assert.equal(remoteDeletes, 2);
  assert.equal(await isDeletedUserSyncBlocked('uid-a', harness.store), true);
});

test('old serialized remote save must settle before deletion and no queued work saves afterward', async () => {
  const saveStarted = deferred<void>();
  const releaseSave = deferred<void>();
  const events: string[] = [];
  const harness = createHarness({ events });
  const userRepository = repository({
    events,
    save: async uid => {
      events.push(`save:start:${uid}`);
      saveStarted.resolve();
      await releaseSave.promise;
      events.push(`save:end:${uid}`);
    },
  });
  await harness.boundary.initializeUserState('uid-a', userRepository, emptyPreferences);
  events.length = 0;

  const oldSave = harness.boundary.queuePreferencesForRemoteSync(
    { ...emptyPreferences, saved: ['before-delete'] },
    'uid-a',
  );
  await saveStarted.promise;
  const deletion = harness.boundary.deleteCurrentUserData(async () => ({ uid: 'uid-a', repository: userRepository }));
  const postDeleteQueue = harness.boundary.queuePreferencesForRemoteSync(
    { ...emptyPreferences, saved: ['after-delete-request'] },
    'uid-a',
  );
  await Promise.resolve();
  assert.deepEqual(events, ['save:start:uid-a']);

  releaseSave.resolve();
  await oldSave;
  await deletion;
  await postDeleteQueue;
  assert.deepEqual(events, [
    'save:start:uid-a',
    'save:end:uid-a',
    'block:uid-a',
    'delete:uid-a',
    'clear:queue',
    'clear:preferences',
  ]);
  assert.equal(harness.data.has(USER_SYNC_QUEUE_KEY), false);
});

test('location-like local input is excluded from the owned remote queue payload', async () => {
  const harness = createHarness();
  const withLocation = {
    ...emptyPreferences,
    saved: ['place-1'],
    coordinates: { latitude: 39.92, longitude: 32.85 },
  } as typeof emptyPreferences;
  await enqueueUserSync('uid-a', withLocation, harness.store);
  const queued = JSON.parse(harness.data.get(USER_SYNC_QUEUE_KEY) ?? '{}');
  assert.equal('coordinates' in queued.payload, false);
  assert.deepEqual(Object.keys(queued.payload).sort(), [
    'deviceMigrationVersion',
    'dismissed',
    'interests',
    'saved',
    'schemaVersion',
  ]);
});
