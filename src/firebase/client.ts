import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from '@firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

export type AppEnvironment = 'development' | 'production';
export type FirebaseClient = { app: FirebaseApp; auth: Auth; db: Firestore; environment: AppEnvironment };

type PublicFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

let singleton: FirebaseClient | null | undefined;
const authStorage = AsyncStorage as unknown as {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

function readEnvironment(): AppEnvironment {
  return process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'production' : 'development';
}

function readConfig(): PublicFirebaseConfig | undefined {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !appId) return undefined;
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
}

export function getFirebaseClient(): FirebaseClient | undefined {
  if (singleton !== undefined) return singleton ?? undefined;
  const config = readConfig();
  if (!config) {
    singleton = null;
    return undefined;
  }

  const environment = readEnvironment();
  const app = getApps().length ? getApp() : initializeApp(config);
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(authStorage) });
  } catch (error) {
    // Fast Refresh may initialize Auth before this module is re-evaluated.
    if (!(error instanceof Error) || !error.message.includes('already-initialized')) throw error;
    auth = getAuth(app);
  }
  const db = getFirestore(app);

  const emulatorHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;
  if (environment === 'development' && emulatorHost) {
    const [host, rawPort] = emulatorHost.split(':');
    const port = Number(rawPort || 8080);
    if (host && Number.isInteger(port)) connectFirestoreEmulator(db, host, port);
  }

  singleton = { app, auth, db, environment };
  return singleton;
}
