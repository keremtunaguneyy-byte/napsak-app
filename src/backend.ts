import { CatalogSnapshot, embeddedCatalog } from './data/catalog';
import { loadBestCatalog } from './data/catalogService';
import { PersistedPreferences } from './persistence';
import { ensureAnonymousUser } from './firebase/auth';
import { getFirebaseClient } from './firebase/client';
import { FirestoreContentRepository } from './firebase/firestoreContentRepository';
import { FirestoreUserRepository, UserRepository } from './firebase/userRepository';
import { enqueueUserSync, flushUserSync, migrateLocalUserStateOnce } from './firebase/userSync';

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
  return (await loadBestCatalog(cityId, contentRepository)).snapshot;
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
