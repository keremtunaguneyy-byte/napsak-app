export type AppEnvironment = 'development' | 'production';

export type PublicFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

export type FirebaseRuntimeSettings = {
  environment: AppEnvironment;
  mode: 'local';
} | {
  environment: AppEnvironment;
  mode: 'firebase';
  config: PublicFirebaseConfig;
  emulator?: { host: string; port: number };
};

type PublicEnvironment = Record<string, string | undefined>;

const REQUIRED_CONFIG = [
  ['EXPO_PUBLIC_FIREBASE_API_KEY', 'apiKey'],
  ['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'authDomain'],
  ['EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'projectId'],
  ['EXPO_PUBLIC_FIREBASE_APP_ID', 'appId'],
] as const;

function configured(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseEnvironment(value: string | undefined): AppEnvironment {
  if (!value || value === 'development') return 'development';
  if (value === 'production') return 'production';
  throw new Error('EXPO_PUBLIC_APP_ENV must be development or production.');
}

function parseEmulator(value: string | undefined): { host: string; port: number } | undefined {
  if (!configured(value)) return undefined;
  const separator = value.lastIndexOf(':');
  const host = value.slice(0, separator).trim();
  const port = Number(value.slice(separator + 1));
  if (separator < 1 || !host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('EXPO_PUBLIC_FIREBASE_EMULATOR_HOST must use reachable-host:port.');
  }
  return { host, port };
}

function looksLikePlaceholder(value: string): boolean {
  return /replace-with|your[-_]|example/i.test(value);
}

function looksLikeDevelopmentProject(projectId: string): boolean {
  return projectId.startsWith('demo-') || /(^|[-_])(dev|development|test)([-_]|$)/i.test(projectId);
}

export function resolveFirebaseRuntimeSettings(env: PublicEnvironment): FirebaseRuntimeSettings {
  const environment = parseEnvironment(env.EXPO_PUBLIC_APP_ENV);
  const supplied = REQUIRED_CONFIG.filter(([key]) => configured(env[key]));
  const emulator = parseEmulator(env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST);

  if (!supplied.length) {
    if (emulator) throw new Error('Firestore emulator config requires a complete public Firebase config.');
    if (environment === 'production') throw new Error('Production builds require a complete public Firebase config.');
    return { environment, mode: 'local' };
  }

  if (supplied.length !== REQUIRED_CONFIG.length) {
    const missing = REQUIRED_CONFIG.filter(([key]) => !configured(env[key])).map(([key]) => key);
    throw new Error(`Firebase config is partial. Missing: ${missing.join(', ')}.`);
  }

  const values = Object.fromEntries(REQUIRED_CONFIG.map(([key, name]) => [name, env[key]!.trim()])) as Pick<PublicFirebaseConfig, 'apiKey' | 'authDomain' | 'projectId' | 'appId'>;
  if (Object.values(values).some(looksLikePlaceholder)) throw new Error('Firebase config still contains example placeholder values.');
  if (environment === 'production' && emulator) throw new Error('Production builds cannot connect to the Firestore emulator.');
  if (environment === 'production' && looksLikeDevelopmentProject(values.projectId)) {
    throw new Error('Production build points to a development/test Firebase project ID.');
  }

  return {
    environment,
    mode: 'firebase',
    config: {
      ...values,
      storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
      messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined,
    },
    emulator,
  };
}
