import { Firestore, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { PersistedPreferences } from '../persistence';
import { uniqueIds } from '../domain';
import { Interest, KNOWN_INTERESTS } from '../types';

export const USER_STATE_SCHEMA_VERSION = 1;
export type RemoteUserState = {
  schemaVersion: typeof USER_STATE_SCHEMA_VERSION;
  saved: string[];
  dismissed: string[];
  interests: Interest[];
  deviceMigrationVersion: number;
};

export interface UserRepository {
  load(uid: string): Promise<RemoteUserState | undefined>;
  save(uid: string, preferences: PersistedPreferences): Promise<void>;
}

function parseRemoteUserState(value: unknown): RemoteUserState | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Partial<RemoteUserState>;
  const interests = uniqueIds(item.interests).filter((interest): interest is Interest => KNOWN_INTERESTS.includes(interest as Interest));
  if (item.schemaVersion !== USER_STATE_SCHEMA_VERSION || typeof item.deviceMigrationVersion !== 'number') return undefined;
  return {
    schemaVersion: USER_STATE_SCHEMA_VERSION,
    saved: uniqueIds(item.saved),
    dismissed: uniqueIds(item.dismissed),
    interests,
    deviceMigrationVersion: item.deviceMigrationVersion,
  };
}

export class FirestoreUserRepository implements UserRepository {
  constructor(private readonly db: Firestore) {}

  async load(uid: string): Promise<RemoteUserState | undefined> {
    const snapshot = await getDoc(doc(this.db, 'users', uid));
    return snapshot.exists() ? parseRemoteUserState(snapshot.data()) : undefined;
  }

  async save(uid: string, preferences: PersistedPreferences): Promise<void> {
    await setDoc(doc(this.db, 'users', uid), {
      schemaVersion: USER_STATE_SCHEMA_VERSION,
      saved: uniqueIds(preferences.saved).slice(0, 500),
      dismissed: uniqueIds(preferences.dismissed).slice(0, 500),
      interests: preferences.interests.filter(interest => KNOWN_INTERESTS.includes(interest)).slice(0, KNOWN_INTERESTS.length),
      deviceMigrationVersion: 1,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}
