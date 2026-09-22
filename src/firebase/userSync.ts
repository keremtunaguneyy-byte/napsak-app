import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistedPreferences, deserializePreferences, serializePreferences } from '../persistence';
import { UserRepository } from './userRepository';

const QUEUE_KEY = '@napsak/user-sync/v1/pending';
const BLOCKED_UID_KEY = '@napsak/user-sync/v1/deleted-uid';
export type UserSyncStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
const storage = AsyncStorage as unknown as UserSyncStorage;

export async function enqueueUserSync(preferences: PersistedPreferences, store: UserSyncStorage = storage): Promise<void> {
  // A full snapshot makes the queue idempotent and naturally coalesces rapid taps.
  await store.setItem(QUEUE_KEY, serializePreferences(preferences));
}

export async function clearQueuedUserSync(store: UserSyncStorage = storage): Promise<void> {
  await store.removeItem(QUEUE_KEY);
}

export async function blockDeletedUserSync(uid: string, store: UserSyncStorage = storage): Promise<void> {
  await store.setItem(BLOCKED_UID_KEY, uid);
}

export async function isDeletedUserSyncBlocked(uid: string, store: UserSyncStorage = storage): Promise<boolean> {
  return (await store.getItem(BLOCKED_UID_KEY)) === uid;
}

export async function flushUserSync(uid: string, repository: UserRepository, store: UserSyncStorage = storage): Promise<boolean> {
  if (await isDeletedUserSyncBlocked(uid, store)) return false;
  const pending = await store.getItem(QUEUE_KEY);
  if (!pending) return true;
  await repository.save(uid, deserializePreferences(pending));
  // Do not erase a newer snapshot that may have been queued while the request ran.
  if (await store.getItem(QUEUE_KEY) === pending) await store.removeItem(QUEUE_KEY);
  return true;
}

export async function migrateLocalUserStateOnce(uid: string, repository: UserRepository, preferences: PersistedPreferences): Promise<void> {
  if (await isDeletedUserSyncBlocked(uid)) return;
  const remote = await repository.load(uid);
  if (!remote || remote.deviceMigrationVersion < 1) await enqueueUserSync(preferences);
  await flushUserSync(uid, repository);
}
