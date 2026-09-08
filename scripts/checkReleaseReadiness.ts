import { readFileSync } from 'node:fs';
import { resolveFirebaseRuntimeSettings } from '../src/firebase/config';
import { resolveObservabilitySettings } from '../src/observabilityPolicy';

type ExpoConfig = {
  expo?: {
    android?: { package?: string };
    extra?: { eas?: { projectId?: string } };
    ios?: { bundleIdentifier?: string };
  };
};

type Baseline = { knownBlockers?: string[] };

function configured(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !/replace-with|your[-_]|example/i.test(value);
}

function verifiedUrl(value: string | undefined): boolean {
  if (!configured(value)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function androidPackageVerified(value: string | undefined): boolean {
  return configured(value) && /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(value);
}

function iosBundleIdentifierVerified(value: string | undefined): boolean {
  return configured(value) && /^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z][A-Za-z0-9-]*){2,}$/.test(value);
}

function easProjectVerified(value: string | undefined): boolean {
  return configured(value) && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function productionFirebaseVerified(): boolean {
  try {
    const settings = resolveFirebaseRuntimeSettings({ ...process.env, EXPO_PUBLIC_APP_ENV: 'production' });
    return settings.mode === 'firebase' && !settings.emulator;
  } catch {
    return false;
  }
}

function productionSentryVerified(): boolean {
  try {
    const settings = resolveObservabilitySettings({ ...process.env, EXPO_PUBLIC_APP_ENV: 'production' });
    return settings.mode === 'sentry'
      && ['SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_AUTH_TOKEN'].every(key => configured(process.env[key]));
  } catch {
    return false;
  }
}

const app = JSON.parse(readFileSync('app.json', 'utf8')) as ExpoConfig;
const baseline = JSON.parse(readFileSync('release-readiness.json', 'utf8')) as Baseline;
const expo = app.expo ?? {};
const blockers: string[] = [];

if (!androidPackageVerified(expo.android?.package)) blockers.push('android_package_unverified');
if (!iosBundleIdentifierVerified(expo.ios?.bundleIdentifier)) blockers.push('ios_bundle_identifier_unverified');
if (!easProjectVerified(expo.extra?.eas?.projectId)) blockers.push('eas_project_id_unverified');
if (!verifiedUrl(process.env.NAPSAK_PRIVACY_POLICY_URL)) blockers.push('privacy_policy_url_unverified');
if (!verifiedUrl(process.env.NAPSAK_SUPPORT_URL)) blockers.push('support_url_unverified');
if (!productionFirebaseVerified()) blockers.push('production_firebase_unverified');
if (!productionSentryVerified()) blockers.push('production_sentry_unverified');
if (!verifiedUrl(process.env.NAPSAK_RESTORE_DRILL_EVIDENCE)) blockers.push('restore_drill_unverified');
if (!verifiedUrl(process.env.NAPSAK_DEVICE_MATRIX_EVIDENCE)) blockers.push('release_device_matrix_unverified');

blockers.sort();
const knownBlockers = [...(baseline.knownBlockers ?? [])].sort();
console.table(blockers.map(blocker => ({ blocker })));

if (process.argv.includes('--strict')) {
  if (blockers.length) {
    console.error(`Release gate failed with ${blockers.length} blocker(s).`);
    process.exitCode = 1;
  } else {
    console.log('Release gate passed: no known blocker remains.');
  }
} else if (JSON.stringify(blockers) !== JSON.stringify(knownBlockers)) {
  console.error('Release blocker baseline changed. Review the difference and update release-readiness.json deliberately.');
  process.exitCode = 1;
} else {
  console.log(`Release baseline verified: ${blockers.length} open blocker(s); this is not release approval.`);
}
