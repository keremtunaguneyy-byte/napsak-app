import { CatalogSnapshot, embeddedCatalog } from './data/catalog';
import { loadBestCatalog } from './data/catalogService';
import { clearPreferences, PersistedPreferences } from './persistence';
import { deleteUser } from '@firebase/auth';
import type { Auth, User } from '@firebase/auth';
import { ensureAnonymousUser } from './firebase/auth';
import { getFirebaseClient } from './firebase/client';
import { FirestoreContentRepository } from './firebase/firestoreContentRepository';
import { FirestoreUserRepository, UserRepository } from './firebase/userRepository';
import { blockDeletedUserSync, clearQueuedUserSync, enqueueUserSync, flushUserSync, isDeletedUserSyncBlocked, migrateLocalUserStateOnce } from './firebase/userSync';
import { runUserDataDeletion, UserDataDeletionResult } from './userDataDeletion';
import { captureOperationalError } from './observability';
import { withBoundedWait } from './timeout';

let activeUser: { uid: string; repository: UserRepository } | undefined;
let remoteWork: Promise<void> = Promise.resolve();
let deletionGeneration = 0;
let deletionInProgress = false;
let authTimedOut = false;
let pendingAnonymousUser: Promise<User> | undefined;

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

function serializeRemoteWork<T>(work: () => Promise<T>): Promise<T> {
  const result = remoteWork.then(work);
  remoteWork = result.then(() => undefined, () => undefined);
  return result;
}

export async function initializeDataBackbone(preferences: PersistedPreferences, cityId = 'ankara'): Promise<CatalogSnapshot> {
  const generation = deletionGeneration;
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
  if (generation !== deletionGeneration || deletionInProgress) return (await loadBestCatalog(cityId)).snapshot;
  const userRepository = new FirestoreUserRepository(client.db);
  await serializeRemoteWork(async () => {
    if (generation !== deletionGeneration || deletionInProgress || await isDeletedUserSyncBlocked(user.uid)) return;
    activeUser = { uid: user.uid, repository: userRepository };
    try {
      await migrateLocalUserStateOnce(user.uid, userRepository, preferences);
    } catch (error) {
      captureOperationalError(error, 'remote_sync', 'user_state_migration_failed');
      // Local state remains authoritative until a later flush succeeds.
      await enqueueUserSync(preferences);
    }
  });
  if (generation !== deletionGeneration || deletionInProgress) return (await loadBestCatalog(cityId)).snapshot;

  const contentRepository = new FirestoreContentRepository(client.db);
  const result = await loadBestCatalog(cityId, contentRepository);
  if (result.remoteError) captureOperationalError(result.remoteError, 'catalog_refresh', 'remote_catalog_refresh_failed');
  return result.snapshot;
}

export async function queuePreferencesForRemoteSync(preferences: PersistedPreferences): Promise<void> {
  const generation = deletionGeneration;
  const client = getFirebaseClient();
  if (!client) return;
  await serializeRemoteWork(async () => {
    if (deletionInProgress || generation !== deletionGeneration) return;
    const current = activeUser;
    const uid = current?.uid ?? client.auth.currentUser?.uid;
    if (uid && await isDeletedUserSyncBlocked(uid)) return;
    if (!current && !preferences.saved.length && !preferences.dismissed.length && !preferences.interests.length) return;
    await enqueueUserSync(preferences);
    if (!current) return;
    try {
      await flushUserSync(current.uid, current.repository);
    } catch (error) {
      captureOperationalError(error, 'remote_sync', 'user_state_sync_failed');
      // The queued snapshot remains in AsyncStorage and is retried next launch/change.
    }
  });
}

export function initialCatalog(cityId = 'ankara'): CatalogSnapshot {
  return embeddedCatalog(cityId);
}

export async function deleteCurrentUserData(): Promise<UserDataDeletionResult> {
  const client = getFirebaseClient();
  if (deletionInProgress) throw new Error('User data deletion is already in progress.');
  deletionInProgress = true;
  deletionGeneration += 1;
  try {
    // Never report local-only deletion while a configured Auth identity is unresolved.
    if (authTimedOut) throw new Error('Anonymous Auth identity is unresolved; retry after relaunch.');
    await withBoundedWait(remoteWork, 5_000, 'Pending remote user sync did not finish.');
    return await serializeRemoteWork(async () => {
      if (authTimedOut) throw new Error('Anonymous Auth identity is unresolved; retry after relaunch.');
      const user = client ? await getAnonymousUser(client.auth) : undefined;
      const repository = client && user
        ? activeUser?.uid === user.uid ? activeUser.repository : new FirestoreUserRepository(client.db)
        : undefined;
      const result = await runUserDataDeletion({
        blockRemoteUserSync: user ? () => blockDeletedUserSync(user.uid) : undefined,
        deleteRemoteUserState: repository && user
          ? () => withBoundedWait(repository.delete(user.uid), 10_000, 'Remote user deletion timed out.')
          : undefined,
        clearLocalUserState: async () => {
          await clearQueuedUserSync();
          await clearPreferences();
        },
        deleteAnonymousAccount: user
          ? () => withBoundedWait(deleteUser(user), 10_000, 'Anonymous Auth deletion timed out.')
          : undefined,
        onAnonymousAccountDeletionError: error => captureOperationalError(error, 'user_data_deletion', 'anonymous_auth_deletion_failed'),
      });
      activeUser = undefined;
      return result;
    });
  } finally {
    deletionInProgress = false;
  }
}
