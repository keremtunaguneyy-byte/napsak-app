import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { resolveFirebaseRuntimeSettings } from '../src/firebase/config';
import { resolveObservabilitySettings } from '../src/observabilityPolicy';

// Format-valid fixtures for offline builds. These values do not identify any service.
const connected = {
  EXPO_PUBLIC_FIREBASE_API_KEY: 'GezekRuntimeFixtureKey',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'gezek-runtime-fixture-beta.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'gezek-runtime-fixture-beta',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:123:web:abc',
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'gezek-runtime-fixture-beta.appspot.com',
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '5835092041',
  EXPO_PUBLIC_SENTRY_DSN: 'https://gezek-runtime-fixture@o123.ingest.sentry.io/456',
  SENTRY_ORG: 'gezek-runtime-fixture',
  SENTRY_PROJECT: 'gezek-runtime-fixture-beta',
  SENTRY_AUTH_TOKEN: 'gezek-runtime-fixture-build-token',
};

const eas = JSON.parse(readFileSync('eas.json', 'utf8')) as {
  build: Record<string, { env: NodeJS.ProcessEnv }>;
};
const hostEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) =>
  !/^(EXPO_|EAS_|SENTRY_|NAPSAK_|NODE_ENV$|BABEL_ENV$|DEBUG$)/.test(name),
));

function check(profile: 'connected-beta' | 'preview', output: string): void {
  const isConnected = profile === 'connected-beta';
  const env: NodeJS.ProcessEnv = {
    ...hostEnv,
    ...eas.build[profile].env,
    ...(isConnected ? connected : {}),
    EAS_BUILD_PROFILE: profile,
    NODE_ENV: 'production',
    EXPO_NO_DOTENV: '1',
    EXPO_OFFLINE: '1',
  };
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/checkBuildConfig.ts'], { env, stdio: 'ignore' });
  console.log(profile + ' preflight passed');
  // Expo can reuse transforms between exports when only the shell environment changes.
  execFileSync(process.execPath, [
    require.resolve('expo/bin/cli'), 'export', '--platform', 'android', '--no-bytecode', '--no-minify',
    '--clear', '--max-workers', '2', '--output-dir', output,
  ], { env, stdio: 'ignore' });

  const metadata = JSON.parse(readFileSync(join(output, 'metadata.json'), 'utf8'));
  const bundle = readFileSync(join(output, metadata.fileMetadata.android.bundle), 'utf8');

  // Inspect the arguments at the actual runtime calls in Metro's production output.
  // Undefined is emitted as either undefined or void 0. Ignore SDK-owned modules.
  function runtimeInputs(consumer: string, keys: string[]): Record<string, string | undefined> {
    const call = bundle.match(new RegExp(consumer + '\\)\\(\\{([^}]+)\\}\\)'))?.[1];
    assert.ok(call, consumer + ' did not receive explicit public configuration in the Android bundle');
    const inputs: Record<string, string | undefined> = {};
    for (const key of keys) {
      const value: string | undefined = call.match(new RegExp('\\b' + key + ':\\s*("(?:[^"\\\\]|\\\\.)*"|undefined|void 0)'))?.[1];
      assert.ok(value, consumer + ' is missing a compiled input for ' + key);
      inputs[key] = value.startsWith('"') ? JSON.parse(value) : undefined;
      assert.ok(inputs[key] === env[key], consumer + ' has an unexpected compiled value for ' + key);
    }
    return inputs;
  }

  const sharedKeys = ['EXPO_PUBLIC_APP_ENV', 'EXPO_PUBLIC_SERVICE_TIER'];
  const firebase = resolveFirebaseRuntimeSettings(runtimeInputs('resolveFirebaseRuntimeSettings', [
    ...sharedKeys, ...Object.keys(connected).filter(key => key.startsWith('EXPO_PUBLIC_FIREBASE_')),
    'EXPO_PUBLIC_FIREBASE_EMULATOR_HOST',
  ]));
  const observability = resolveObservabilitySettings(runtimeInputs('initializeObservability', [
    ...sharedKeys, 'EXPO_PUBLIC_SENTRY_DSN',
  ]));
  assert.equal(firebase.mode, isConnected ? 'firebase' : 'local');
  assert.equal(observability.mode, isConnected ? 'sentry' : 'disabled');
  assert.equal(observability.environment, isConnected ? 'beta' : 'development');
  assert.ok(!bundle.includes(connected.SENTRY_AUTH_TOKEN), 'Build-only token was included in the Android bundle');
  console.log(profile + ' Android bundle verified');
}

const output = mkdtempSync(join(tmpdir(), 'gezek-android-runtime-'));
try {
  check('connected-beta', join(output, 'connected'));
  check('preview', join(output, 'preview'));
} finally {
  rmSync(output, { recursive: true, force: true });
}
