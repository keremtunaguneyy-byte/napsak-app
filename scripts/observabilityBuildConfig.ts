import { resolveObservabilitySettings } from '../src/observabilityPolicy';

type Environment = Record<string, string | undefined>;

const SENTRY_BUILD_KEYS = ['SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_AUTH_TOKEN'];

export function requireSentryBuildSettings(env: Environment): void {
  if (resolveObservabilitySettings(env).mode !== 'sentry') {
    throw new Error('Production release requires EXPO_PUBLIC_SENTRY_DSN.');
  }
  const missing = SENTRY_BUILD_KEYS
    .filter(key => !env[key]?.trim() || /replace-with|your[-_]|example/i.test(env[key]!));
  if (missing.length) throw new Error(`Sentry source-map configuration is incomplete. Missing: ${missing.join(', ')}.`);
}

export function validateOptionalSentryBuildSettings(env: Environment): void {
  if (!['EXPO_PUBLIC_SENTRY_DSN', ...SENTRY_BUILD_KEYS].some(key => env[key]?.trim())) return;
  try {
    requireSentryBuildSettings(env);
  } catch {
    throw new Error(`Connected beta has partial Sentry configuration. Provide a valid EXPO_PUBLIC_SENTRY_DSN and non-placeholder ${SENTRY_BUILD_KEYS.join(', ')}, or leave all four empty.`);
  }
}
