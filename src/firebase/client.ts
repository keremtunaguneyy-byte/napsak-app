import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from '@firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

import { AppEnvironment, resolveFirebaseRuntimeSettings } from './config';

export type { AppEnvironment } from './config';

export type FirebaseClient = { app: FirebaseApp; auth: Auth; db: Firestore; environment: AppEnvironment };

let singleton: FirebaseClient | null | undefined;
const authStorage = AsyncStorage as unknown as {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export function getFirebaseClient(): FirebaseClient | undefined {
  if (singleton !== undefined) return singleton ?? undefined;
  // Use direct public environment references for Expo's standalone bundle.
  const settings = resolveFirebaseRuntimeSettings({
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    EXPO_PUBLIC_SERVICE_TIER: process.env.EXPO_PUBLIC_SERVICE_TIER,
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST,
  });
  if (settings.mode === 'local') {
    singleton = null;
    return undefined;
  }

  const app = getApps().length ? getApp() : initializeApp(settings.config);
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(authStorage) });
  } catch (error) {
    // Fast Refresh may initialize Auth before this module is re-evaluated.
    if (!(error instanceof Error) || !error.message.includes('already-initialized')) throw error;
    auth = getAuth(app);
  }
  const db = getFirestore(app);

  if (settings.emulator) connectFirestoreEmulator(db, settings.emulator.host, settings.emulator.port);

  singleton = { app, auth, db, environment: settings.environment };
  return singleton;
}
