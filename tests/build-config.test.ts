import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateBuildConfiguration } from '../scripts/buildConfig';

const app = JSON.parse(readFileSync('app.json', 'utf8'));
const eas = JSON.parse(readFileSync('eas.json', 'utf8'));
const productionValues = {
  EXPO_PUBLIC_FIREBASE_API_KEY: 'private-test-api-key',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'napsak-production.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'napsak-production',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:123:web:abc',
  EXPO_PUBLIC_SENTRY_DSN: 'https://private-test-key@o123.ingest.sentry.io/456',
  SENTRY_ORG: 'test-org',
  SENTRY_PROJECT: 'test-project',
  SENTRY_AUTH_TOKEN: 'private-test-build-token',
};

test('development and preview are explicitly bound to local development runtime', () => {
  assert.deepEqual(validateBuildConfiguration(app, eas, 'development', {}), {
    profile: 'development', runtime: 'development', mode: 'local',
  });
  assert.deepEqual(validateBuildConfiguration(app, eas, 'preview', {}), {
    profile: 'preview', runtime: 'development', mode: 'local',
  });
  assert.throws(() => validateBuildConfiguration(app, eas, 'preview', productionValues), /local-only/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'development', { EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'napsak-production' }), /partial/);
});

test('production requires complete Firebase and Sentry build settings', () => {
  assert.deepEqual(validateBuildConfiguration(app, eas, 'production', productionValues), {
    profile: 'production', runtime: 'production', mode: 'connected',
  });
  assert.throws(() => validateBuildConfiguration(app, eas, 'production', {}), /Firebase config/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'production', {
    ...productionValues, SENTRY_AUTH_TOKEN: undefined,
  }), /SENTRY_AUTH_TOKEN/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'production', {
    ...productionValues, EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'napsak-dev',
  }), /development\/test/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'production', {
    ...productionValues, EXPO_PUBLIC_FIREBASE_APP_ID: 'invalid-app-id',
  }), /key shape/);
});

test('missing, unsupported and mismatched runtime identity fail closed', () => {
  assert.throws(() => validateBuildConfiguration(app, eas, undefined, {}), /profile is required/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'beta', {}), /profile is required/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'production', {
    ...productionValues, EXPO_PUBLIC_APP_ENV: 'development',
  }), /conflicts/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'production', {
    ...productionValues, EXPO_PUBLIC_APP_ENV: 'staging',
  }), /conflicts/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'preview', {
    EXPO_PUBLIC_APP_ENV: '',
  }), /conflicts/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'development', {
    EXPO_PUBLIC_APP_ENV: 'production',
  }), /conflicts/);
});

test('Expo app, package, bundle and active EAS project identities are fixed', () => {
  assert.equal(app.expo.android.package, 'com.getnapsak');
  assert.equal(app.expo.ios.bundleIdentifier, 'com.getnapsak');
  assert.equal(app.expo.extra.eas.projectId, 'af043dd8-412f-403e-81c3-6e0af8e024d6');
  assert.throws(() => validateBuildConfiguration({ ...app, expo: {
    ...app.expo, android: { package: 'com.other' },
  } }, eas, 'preview', {}), /identity/);
  assert.throws(() => validateBuildConfiguration({ ...app, expo: {
    ...app.expo, extra: { eas: { projectId: '00000000-0000-4000-8000-000000000000' } },
  } }, eas, 'preview', {}), /EAS project ID/);
});

test('profile bindings and the standard internal build expectation are checked', () => {
  assert.throws(() => validateBuildConfiguration(app, { ...eas, build: {
    ...eas.build, preview: { ...eas.build.preview, environment: 'production' },
  } }, 'preview', {}), /ambiguous/);
  assert.throws(() => validateBuildConfiguration(app, { ...eas, build: {
    ...eas.build, development: { ...eas.build.development, developmentClient: true },
  } }, 'development', {}), /standard build/);
});

test('preflight output never includes supplied public keys or build tokens', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/checkBuildConfig.ts', '--profile=production'], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, NODE_ENV: 'test', ...productionValues, EXPO_PUBLIC_APP_ENV: 'development' },
  });
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /conflicts/);
  for (const value of [productionValues.EXPO_PUBLIC_FIREBASE_API_KEY, productionValues.SENTRY_AUTH_TOKEN,
    productionValues.EXPO_PUBLIC_SENTRY_DSN]) assert.equal(output.includes(value), false);
});

test('EAS worker fails when profile identity was not injected into its environment', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/checkBuildConfig.ts'], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, NODE_ENV: 'test', EAS_BUILD_PROFILE: 'preview' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing explicit runtime environment/);
});

test('release baseline retains eight externally unverified blockers despite valid config shape', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/checkReleaseReadiness.ts'], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, NODE_ENV: 'test', ...productionValues, EXPO_PUBLIC_APP_ENV: 'production' },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Release baseline verified: 8 open blocker\(s\)/);
  assert.match(result.stdout, /production_firebase_unverified/);
  assert.match(result.stdout, /production_sentry_unverified/);
  const strict = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/checkReleaseReadiness.ts', '--strict'], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, NODE_ENV: 'test', ...productionValues, EXPO_PUBLIC_APP_ENV: 'production' },
  });
  assert.equal(strict.status, 1);
  assert.match(strict.stderr, /8 blocker\(s\)/);
});
