import { readFileSync } from 'node:fs';
import { validateBuildConfiguration } from './buildConfig';

try {
  const explicitProfile = process.argv.find(argument => argument.startsWith('--profile='))?.slice('--profile='.length);
  if (explicitProfile && process.env.EAS_BUILD_PROFILE && explicitProfile !== process.env.EAS_BUILD_PROFILE) {
    throw new Error('Requested profile conflicts with EAS_BUILD_PROFILE.');
  }
  if (process.env.EAS_BUILD_PROFILE && (!process.env.EXPO_PUBLIC_APP_ENV || !process.env.NAPSAK_BUILD_MODE)) {
    throw new Error('EAS build worker is missing explicit runtime environment or build mode.');
  }
  const app = JSON.parse(readFileSync('app.json', 'utf8'));
  const eas = JSON.parse(readFileSync('eas.json', 'utf8'));
  const result = validateBuildConfiguration(app, eas, explicitProfile ?? process.env.EAS_BUILD_PROFILE, process.env);
  console.log('Build config preflight passed', result);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Build config preflight failed.');
  process.exitCode = 1;
}
