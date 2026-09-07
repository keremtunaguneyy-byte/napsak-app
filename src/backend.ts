import { CatalogSnapshot, embeddedCatalog } from './data/catalog';
import { loadBestCatalog } from './data/catalogService';
import { clearPreferences, PersistedPreferences } from './persistence';
import { deleteUser } from '@firebase/auth';
import { ensureAnonymousUser } from './firebase/auth';
import { getFirebaseClient } from './firebase/client';
import { FirestoreContentRepository } from './firebase/firestoreContentRepository';
import { FirestoreUserRepository, UserRepository } from './firebase/userRepository';
import { clearQueuedUserSync, enqueueUserSync, flushUserSync, migrateLocalUserStateOnce } from './firebase/userSync';
import { runUserDataDeletion, UserDataDeletionResult } from './userDataDeletion';
import { captureOperationalError } from './observability';

let activeUser: { uid: string; repository: UserRepository } | undefined;

export async function initializeDataBackbone(preferences: PersistedPreferences, cityId = 'ankara'): Promise<CatalogSnapshot> {
  const client = getFirebaseClient();
  if (!client) return (await loadBestCatalog(cityId)).snapshot;

  const user = await ensureAnonymousUser(client.auth);
  const userRepository = new FirestoreUserRepository(client.db);
  activeUser = { uid: user.uid, repository: userRepository };
  try {
    await migrateLocalUserStateOnce(user.uid, userRepository, preferences);
  } catch {
    // Local state remains authoritative until a later flush succeeds.
    await enqueueUserSync(preferences);
  }

  const contentRepository = new FirestoreContentRepository(client.db);
  const result = await loadBestCatalog(cityId, contentRepository);
  if (result.remoteError) captureOperationalError(result.remoteError, 'catalog_refresh', 'remote_catalog_refresh_failed');
  return result.snapshot;
}

export async function queuePreferencesForRemoteSync(preferences: PersistedPreferences): Promise<void> {
  const client = getFirebaseClient();
  if (!client) return;
  await enqueueUserSync(preferences);
  if (!activeUser) return;
  try {
    await flushUserSync(activeUser.uid, activeUser.repository);
  } catch {
    // The queued snapshot remains in AsyncStorage and is retried next launch/change.
  }
}

export function initialCatalog(cityId = 'ankara'): CatalogSnapshot {
  return embeddedCatalog(cityId);
}

export async function deleteCurrentUserData(): Promise<UserDataDeletionResult> {
  const client = getFirebaseClient();
  const user = client?.auth.currentUser;
  const repository = client && user
    ? activeUser?.uid === user.uid ? activeUser.repository : new FirestoreUserRepository(client.db)
    : undefined;

  const result = await runUserDataDeletion({
    deleteRemoteUserState: repository && user ? () => repository.delete(user.uid) : undefined,
    clearLocalUserState: async () => {
      await clearQueuedUserSync();
      await clearPreferences();
    },
    deleteAnonymousAccount: user ? () => deleteUser(user) : undefined,
    onAnonymousAccountDeletionError: error => captureOperationalError(error, 'user_data_deletion', 'anonymous_auth_deletion_failed'),
  });
  activeUser = undefined;
  return result;
}
