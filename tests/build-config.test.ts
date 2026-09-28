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
  SENTRY_PROJECT: 'napsak-production',
  SENTRY_AUTH_TOKEN: 'private-test-build-token',
};
const betaValues = {
  ...productionValues,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'napsak-beta.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'napsak-beta',
  SENTRY_PROJECT: 'napsak-beta',
};

test('development and preview are explicitly bound to local development runtime', () => {
  assert.deepEqual(validateBuildConfiguration(app, eas, 'development', {}), {
    profile: 'development', runtime: 'development', mode: 'local',
  });
  assert.deepEqual(validateBuildConfiguration(app, eas, 'preview', {}), {
    profile: 'preview', runtime: 'development', mode: 'local',
  });
  assert.throws(() => validateBuildConfiguration(app, eas, 'preview', productionValues), /Local tier cannot connect/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'development', { EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'napsak-production' }), /partial/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'preview', {
    EXPO_PUBLIC_SERVICE_TIER: 'beta', ...betaValues,
  }), /conflicts/);
});

test('connected beta requires its explicit profile and non-production services', () => {
  assert.deepEqual(validateBuildConfiguration(app, eas, 'connected-beta', betaValues), {
    profile: 'connected-beta', runtime: 'development', mode: 'connected',
  });
  assert.throws(() => validateBuildConfiguration(app, eas, 'connected-beta', {}), /Firebase config/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'connected-beta', productionValues), /non-production Firebase/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'connected-beta', {
    ...betaValues, SENTRY_PROJECT: 'napsak-production',
  }), /beta\/development Sentry/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'connected-beta', {
    ...betaValues, EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'napsak-production.firebaseapp.com',
  }), /key shape/);
  assert.throws(() => validateBuildConfiguration(app, eas, 'connected-beta', {
    ...betaValues, EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: '127.0.0.1:8080',
  }), /no emulator/);
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
  assert.throws(() => validateBuildConfiguration(app, eas, 'production', {
    ...productionValues, SENTRY_PROJECT: 'napsak-beta',
  }), /non-production Sentry/);
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

test('Gezek display name and preserved technical identities are fixed', () => {
  assert.equal(app.expo.name, 'Gezek');
  assert.equal(app.expo.slug, 'napsak-app');
  assert.equal(app.expo.owner, 'napsaks-team');
  assert.equal(app.expo.android.package, 'com.getnapsak');
  assert.equal(app.expo.ios.bundleIdentifier, 'com.getnapsak');
  assert.equal(app.expo.extra.eas.projectId, 'af043dd8-412f-403e-81c3-6e0af8e024d6');
  assert.throws(() => validateBuildConfiguration({ ...app, expo: {
    ...app.expo, name: "N'apsak?",
  } }, eas, 'preview', {}), /identity/);
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
  assert.throws(() => validateBuildConfiguration(app, { ...eas, build: {
    ...eas.build, 'connected-beta': { ...eas.build['connected-beta'], environment: 'production' },
  } }, 'connected-beta', betaValues), /ambiguous/);
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
