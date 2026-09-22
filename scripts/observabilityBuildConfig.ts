import { resolveObservabilitySettings } from '../src/observabilityPolicy';

type Environment = Record<string, string | undefined>;

export function requireSentryBuildSettings(env: Environment): void {
  if (resolveObservabilitySettings(env).mode !== 'sentry') {
    throw new Error('Production release requires EXPO_PUBLIC_SENTRY_DSN.');
  }
  const missing = ['SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_AUTH_TOKEN']
    .filter(key => !env[key]?.trim() || /replace-with|your[-_]|example/i.test(env[key]!));
  if (missing.length) throw new Error(`Sentry source-map configuration is incomplete. Missing: ${missing.join(', ')}.`);
}
