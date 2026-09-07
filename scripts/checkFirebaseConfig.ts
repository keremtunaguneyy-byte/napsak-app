import { resolveFirebaseRuntimeSettings } from '../src/firebase/config';

try {
  const settings = resolveFirebaseRuntimeSettings(process.env);
  if (process.argv.includes('--require-firebase') && settings.mode !== 'firebase') {
    throw new Error('This check requires Firebase config; local-only mode is not accepted.');
  }
  console.log('Firebase config preflight passed', {
    environment: settings.environment,
    mode: settings.mode,
    projectId: settings.mode === 'firebase' ? settings.config.projectId : undefined,
    emulator: settings.mode === 'firebase' ? settings.emulator : undefined,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Firebase config preflight failed.');
  process.exitCode = 1;
}
