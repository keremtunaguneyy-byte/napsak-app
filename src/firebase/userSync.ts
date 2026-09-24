import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistedPreferences } from '../persistence';
import { KNOWN_INTERESTS, Interest } from '../types';
import {
  createRemoteUserState,
  RemoteUserState,
  USER_STATE_SCHEMA_VERSION,
  UserRepository,
} from './userRepository';

export const USER_SYNC_QUEUE_KEY = '@napsak/user-sync/v2/pending';
export const LEGACY_USER_SYNC_QUEUE_KEY = '@napsak/user-sync/v1/pending';
const BLOCKED_UID_KEY = '@napsak/user-sync/v1/deleted-uid';
const QUEUE_SCHEMA_VERSION = 2;

type PendingUserSync = {
  queueSchemaVersion: typeof QUEUE_SCHEMA_VERSION;
  ownerUid: string;
  payload: RemoteUserState;
};

export type UserSyncStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
const storage = AsyncStorage as unknown as UserSyncStorage;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.length && expected.every(key => keys.includes(key));
}

function isValidOwnerUid(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 128
    && value === value.trim();
}

function isUniqueStringArray(value: unknown, maximum: number): value is string[] {
  return Array.isArray(value)
    && value.length <= maximum
    && value.every(item => typeof item === 'string')
    && new Set(value).size === value.length;
}

function parseRemotePayload(value: unknown): RemoteUserState | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    'schemaVersion',
    'saved',
    'dismissed',
    'interests',
    'deviceMigrationVersion',
  ])) return undefined;
  if (value.schemaVersion !== USER_STATE_SCHEMA_VERSION || value.deviceMigrationVersion !== 1) return undefined;
  const saved = value.saved;
  const dismissed = value.dismissed;
  if (!isUniqueStringArray(saved, 500) || !isUniqueStringArray(dismissed, 500)) return undefined;
  if (saved.some(id => dismissed.includes(id))) return undefined;
  if (!isUniqueStringArray(value.interests, KNOWN_INTERESTS.length)) return undefined;
  if (!value.interests.every(interest => KNOWN_INTERESTS.includes(interest as Interest))) return undefined;
  return value as RemoteUserState;
}

function parsePendingUserSync(raw: string): PendingUserSync | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || !hasOnlyKeys(value, ['queueSchemaVersion', 'ownerUid', 'payload'])) return undefined;
    const payload = parseRemotePayload(value.payload);
    if (value.queueSchemaVersion !== QUEUE_SCHEMA_VERSION || !isValidOwnerUid(value.ownerUid) || !payload) return undefined;
    return { queueSchemaVersion: QUEUE_SCHEMA_VERSION, ownerUid: value.ownerUid, payload };
  } catch {
    return undefined;
  }
}

async function removeIfUnchanged(key: string, raw: string, store: UserSyncStorage): Promise<void> {
  if (await store.getItem(key) === raw) await store.removeItem(key);
}

export async function enqueueUserSync(
  ownerUid: string,
  preferences: PersistedPreferences,
  store: UserSyncStorage = storage,
): Promise<void> {
  if (!isValidOwnerUid(ownerUid)) throw new Error('Cannot queue user sync without a valid owner UID.');
  const pending: PendingUserSync = {
    queueSchemaVersion: QUEUE_SCHEMA_VERSION,
    ownerUid,
    payload: createRemoteUserState(preferences),
  };
  await store.setItem(USER_SYNC_QUEUE_KEY, JSON.stringify(pending));
  await store.removeItem(LEGACY_USER_SYNC_QUEUE_KEY);
}

export async function clearQueuedUserSync(store: UserSyncStorage = storage): Promise<void> {
  await Promise.all([
    store.removeItem(USER_SYNC_QUEUE_KEY),
    store.removeItem(LEGACY_USER_SYNC_QUEUE_KEY),
  ]);
}

export async function blockDeletedUserSync(uid: string, store: UserSyncStorage = storage): Promise<void> {
  await store.setItem(BLOCKED_UID_KEY, uid);
}

export async function isDeletedUserSyncBlocked(uid: string, store: UserSyncStorage = storage): Promise<boolean> {
  return (await store.getItem(BLOCKED_UID_KEY)) === uid;
}

export async function flushUserSync(
  uid: string,
  repository: UserRepository,
  store: UserSyncStorage = storage,
): Promise<boolean> {
  if (!isValidOwnerUid(uid) || await isDeletedUserSyncBlocked(uid, store)) return false;

  // v1 never carried an owner. It cannot be safely assigned to the current UID.
  const legacy = await store.getItem(LEGACY_USER_SYNC_QUEUE_KEY);
  if (legacy) await removeIfUnchanged(LEGACY_USER_SYNC_QUEUE_KEY, legacy, store);

  const raw = await store.getItem(USER_SYNC_QUEUE_KEY);
  if (!raw) return true;
  const pending = parsePendingUserSync(raw);
  if (!pending || pending.ownerUid !== uid) {
    await removeIfUnchanged(USER_SYNC_QUEUE_KEY, raw, store);
    return false;
  }
  if (await isDeletedUserSyncBlocked(uid, store)) return false;

  await repository.save(uid, pending.payload);
  // Do not erase a newer snapshot that may have been queued while the request ran.
  await removeIfUnchanged(USER_SYNC_QUEUE_KEY, raw, store);
  return true;
}

export async function migrateLocalUserStateOnce(
  uid: string,
  repository: UserRepository,
  preferences: PersistedPreferences,
  store: UserSyncStorage = storage,
): Promise<void> {
  if (await isDeletedUserSyncBlocked(uid, store)) return;
  const remote = await repository.load(uid);
  if (!remote || remote.deviceMigrationVersion < 1) await enqueueUserSync(uid, preferences, store);
  await flushUserSync(uid, repository, store);
}
