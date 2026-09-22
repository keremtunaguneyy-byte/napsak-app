import { resolveObservabilitySettings } from '../src/observabilityPolicy';
import { requireSentryBuildSettings } from './observabilityBuildConfig';

try {
  const settings = resolveObservabilitySettings(process.env);
  if (process.argv.includes('--require-sentry')) requireSentryBuildSettings(process.env);
  console.log('Observability config preflight passed', {
    environment: settings.environment,
    mode: settings.mode,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Observability config preflight failed.');
  process.exitCode = 1;
}
