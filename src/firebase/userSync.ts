import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistedPreferences, deserializePreferences, serializePreferences } from '../persistence';
import { UserRepository } from './userRepository';

const QUEUE_KEY = '@napsak/user-sync/v1/pending';
const storage = AsyncStorage as unknown as {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export async function enqueueUserSync(preferences: PersistedPreferences): Promise<void> {
  // A full snapshot makes the queue idempotent and naturally coalesces rapid taps.
  await storage.setItem(QUEUE_KEY, serializePreferences(preferences));
}

export async function flushUserSync(uid: string, repository: UserRepository): Promise<boolean> {
  const pending = await storage.getItem(QUEUE_KEY);
  if (!pending) return true;
  await repository.save(uid, deserializePreferences(pending));
  // Do not erase a newer snapshot that may have been queued while the request ran.
  if (await storage.getItem(QUEUE_KEY) === pending) await storage.removeItem(QUEUE_KEY);
  return true;
}

export async function migrateLocalUserStateOnce(uid: string, repository: UserRepository, preferences: PersistedPreferences): Promise<void> {
  const remote = await repository.load(uid);
  if (!remote || remote.deviceMigrationVersion < 1) await enqueueUserSync(preferences);
  await flushUserSync(uid, repository);
}
