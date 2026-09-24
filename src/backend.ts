import { CatalogSnapshot, embeddedCatalog } from './data/catalog';
import { loadBestCatalog } from './data/catalogService';
import { clearPreferences, PersistedPreferences, savePreferences } from './persistence';
import { deleteUser } from '@firebase/auth';
import type { Auth, User } from '@firebase/auth';
import { ensureAnonymousUser } from './firebase/auth';
import { getFirebaseClient } from './firebase/client';
import { FirestoreContentRepository } from './firebase/firestoreContentRepository';
import { FirestoreUserRepository } from './firebase/userRepository';
import { blockDeletedUserSync, clearQueuedUserSync, enqueueUserSync, flushUserSync, isDeletedUserSyncBlocked, migrateLocalUserStateOnce } from './firebase/userSync';
import { UserDataDeletionResult } from './userDataDeletion';
import { captureOperationalError } from './observability';
import { withBoundedWait } from './timeout';
import { UserDataBoundary } from './userDataBoundary';

let authTimedOut = false;
let pendingAnonymousUser: Promise<User> | undefined;

const userDataBoundary = new UserDataBoundary({
  blockDeletedUserSync,
  clearPreferences,
  clearQueuedUserSync,
  enqueueUserSync,
  flushUserSync,
  isDeletedUserSyncBlocked,
  migrateLocalUserStateOnce,
  savePreferences,
  withBoundedWait,
  onAnonymousAccountDeletionError: error => captureOperationalError(error, 'user_data_deletion', 'anonymous_auth_deletion_failed'),
  onUserStateMigrationError: error => captureOperationalError(error, 'remote_sync', 'user_state_migration_failed'),
  onUserStateSyncError: error => captureOperationalError(error, 'remote_sync', 'user_state_sync_failed'),
});

function getAnonymousUser(auth: Auth): Promise<User> {
  if (!pendingAnonymousUser) {
    pendingAnonymousUser = ensureAnonymousUser(auth)
      .catch(error => {
        if (error instanceof Error && error.message === 'Anonymous Auth initialization timed out.') authTimedOut = true;
        throw error;
      })
      .finally(() => { pendingAnonymousUser = undefined; });
  }
  return pendingAnonymousUser;
}

export async function initializeDataBackbone(preferences: PersistedPreferences, cityId = 'ankara'): Promise<CatalogSnapshot> {
  let client;
  try {
    client = getFirebaseClient();
  } catch (error) {
    captureOperationalError(error, 'app_startup', 'firebase_config_invalid');
    return (await loadBestCatalog(cityId)).snapshot;
  }
  if (!client) return (await loadBestCatalog(cityId)).snapshot;

  let user;
  try {
    user = await getAnonymousUser(client.auth);
    authTimedOut = false;
  } catch (error) {
    captureOperationalError(error, 'app_startup', 'anonymous_auth_initialization_failed');
    return (await loadBestCatalog(cityId)).snapshot;
  }
  const userRepository = new FirestoreUserRepository(client.db);
  const userStateInitialized = await userDataBoundary.initializeUserState(user.uid, userRepository, preferences);
  if (!userStateInitialized) return (await loadBestCatalog(cityId)).snapshot;

  const contentRepository = new FirestoreContentRepository(client.db);
  const result = await loadBestCatalog(cityId, contentRepository);
  if (result.remoteError) captureOperationalError(result.remoteError, 'catalog_refresh', 'remote_catalog_refresh_failed');
  return result.snapshot;
}

export async function queuePreferencesForRemoteSync(preferences: PersistedPreferences): Promise<void> {
  const client = getFirebaseClient();
  if (!client) return;
  await userDataBoundary.queuePreferencesForRemoteSync(preferences, client.auth.currentUser?.uid);
}

export async function persistPreferences(preferences: PersistedPreferences): Promise<void> {
  await userDataBoundary.persistPreferences(preferences);
}

export function initialCatalog(cityId = 'ankara'): CatalogSnapshot {
  return embeddedCatalog(cityId);
}

export async function deleteCurrentUserData(): Promise<UserDataDeletionResult> {
  const client = getFirebaseClient();
  // Never report local-only deletion while a configured Auth identity is unresolved.
  if (authTimedOut) throw new Error('Anonymous Auth identity is unresolved; retry after relaunch.');
  return userDataBoundary.deleteCurrentUserData(async () => {
    if (authTimedOut) throw new Error('Anonymous Auth identity is unresolved; retry after relaunch.');
    if (!client) return undefined;
    const user = await getAnonymousUser(client.auth);
    return {
      uid: user.uid,
      repository: new FirestoreUserRepository(client.db),
      deleteAnonymousAccount: () => deleteUser(user),
    };
  });
}
