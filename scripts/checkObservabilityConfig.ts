import { resolveObservabilitySettings } from '../src/observabilityPolicy';

function configured(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0 && !/replace-with|your[-_]|example/i.test(value);
}

try {
  const settings = resolveObservabilitySettings(process.env);
  if (process.argv.includes('--require-sentry')) {
    if (settings.mode !== 'sentry') throw new Error('Production release requires EXPO_PUBLIC_SENTRY_DSN.');
    const missing = ['SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_AUTH_TOKEN'].filter(key => !configured(process.env[key]));
    if (missing.length) throw new Error(`Sentry source-map configuration is incomplete. Missing: ${missing.join(', ')}.`);
  }
  console.log('Observability config preflight passed', {
    environment: settings.environment,
    mode: settings.mode,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Observability config preflight failed.');
  process.exitCode = 1;
}
