import { resolveFirebaseRuntimeSettings } from '../src/firebase/config';
import { resolveObservabilitySettings } from '../src/observabilityPolicy';
import { requireSentryBuildSettings } from './observabilityBuildConfig';

type Environment = Record<string, string | undefined>;
type ProfileName = 'development' | 'preview' | 'connected-beta' | 'production';
type BuildProfile = {
  autoIncrement?: boolean;
  developmentClient?: boolean;
  distribution?: string;
  environment?: string;
  env?: Environment;
};
type EasConfig = { cli?: { appVersionSource?: string }; build?: Record<string, BuildProfile> };
type AppConfig = {
  expo?: {
    name?: string;
    slug?: string;
    owner?: string;
    android?: { package?: string };
    ios?: { bundleIdentifier?: string };
    extra?: { eas?: { projectId?: string } };
  };
};

const PROJECT_ID = 'af043dd8-412f-403e-81c3-6e0af8e024d6';
const PROFILE_INTENT: Record<ProfileName, { easEnvironment: string; runtime: string; tier: string; mode: string }> = {
  development: { easEnvironment: 'development', runtime: 'development', tier: 'local', mode: 'local' },
  preview: { easEnvironment: 'preview', runtime: 'development', tier: 'local', mode: 'local' },
  'connected-beta': { easEnvironment: 'beta', runtime: 'development', tier: 'beta', mode: 'connected' },
  production: { easEnvironment: 'production', runtime: 'production', tier: 'production', mode: 'connected' },
};

function hasValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function validFirebaseWebConfig(config: { apiKey: string; authDomain: string; projectId: string; appId: string }): boolean {
  return /^[A-Za-z0-9_-]{8,}$/.test(config.apiKey)
    && /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(config.projectId)
    && config.authDomain === `${config.projectId}.firebaseapp.com`
    && /^1:\d+:web:[A-Za-z0-9]+$/.test(config.appId);
}

export function validateBuildConfiguration(
  app: AppConfig,
  eas: EasConfig,
  profileName: string | undefined,
  environment: Environment,
): { profile: ProfileName; runtime: string; mode: string } {
  const expo = app.expo;
  if (expo?.name !== 'Gezek' || expo.slug !== 'napsak-app' || expo.owner !== 'napsaks-team'
    || expo.android?.package !== 'com.getnapsak' || expo.ios?.bundleIdentifier !== 'com.getnapsak') {
    throw new Error('Expo application identity does not match the approved Gezek display name and preserved technical identity.');
  }
  if (expo.extra?.eas?.projectId !== PROJECT_ID) {
    throw new Error('Expo EAS project ID does not match the active project.');
  }
  if (eas.cli?.appVersionSource !== 'remote') throw new Error('EAS remote version source is required.');

  for (const [name, intent] of Object.entries(PROFILE_INTENT) as [ProfileName, typeof PROFILE_INTENT[ProfileName]][]) {
    const profile = eas.build?.[name];
    if (profile?.environment !== intent.easEnvironment
      || profile.env?.EXPO_PUBLIC_APP_ENV !== intent.runtime
      || profile.env?.EXPO_PUBLIC_SERVICE_TIER !== intent.tier
      || profile.env?.NAPSAK_BUILD_MODE !== intent.mode) {
      throw new Error(`EAS ${name} profile has an ambiguous environment binding.`);
    }
    if (name === 'production') {
      if (profile.autoIncrement !== true || profile.distribution === 'internal') {
        throw new Error('EAS production profile must keep store distribution and auto-increment.');
      }
    } else if (profile.distribution !== 'internal' || profile.developmentClient === true) {
      throw new Error(`EAS ${name} profile must be an internal standard build.`);
    }
  }

  if (!profileName || !(profileName in PROFILE_INTENT)) throw new Error('A supported EAS build profile is required.');
  const profile = profileName as ProfileName;
  const intent = PROFILE_INTENT[profile];
  const effective = { ...eas.build![profile].env, ...environment };
  if (effective.EXPO_PUBLIC_APP_ENV !== intent.runtime || effective.EXPO_PUBLIC_SERVICE_TIER !== intent.tier
    || effective.NAPSAK_BUILD_MODE !== intent.mode) {
    throw new Error(`EAS ${profile} profile conflicts with the effective runtime environment or build mode.`);
  }

  const firebase = resolveFirebaseRuntimeSettings(effective);
  const sentry = resolveObservabilitySettings(effective);
  if (profile === 'production' || profile === 'connected-beta') {
    if (firebase.mode !== 'firebase') throw new Error(`${profile} build requires Firebase configuration.`);
    if (!validFirebaseWebConfig(firebase.config)) throw new Error(`${profile} Firebase public config has invalid key shape.`);
    requireSentryBuildSettings(effective);
    const sentryProject = effective.SENTRY_PROJECT ?? '';
    if (profile === 'connected-beta' && (!/(^|[-_])(dev|development|beta)([-_]|$)/i.test(sentryProject)
      || /(^|[-_])(prod|production|live)([-_]|$)/i.test(sentryProject))) {
      throw new Error('Connected beta requires a beta/development Sentry project identity.');
    }
    if (profile === 'production' && /(^|[-_])(dev|development|beta|test)([-_]|$)/i.test(sentryProject)) {
      throw new Error('Production build points to a non-production Sentry project identity.');
    }
    if (profile === 'connected-beta' && sentry.environment !== 'beta') {
      throw new Error('Connected beta requires beta observability environment.');
    }
    if (hasValue(effective.EXPO_PUBLIC_OBSERVABILITY_TEST_MODE)) {
      throw new Error(`${profile} build cannot enable observability test mode.`);
    }
  } else {
    const connectedKeys = Object.keys(effective).filter(key =>
      (key.startsWith('EXPO_PUBLIC_FIREBASE_') || key === 'EXPO_PUBLIC_SENTRY_DSN' || key.startsWith('SENTRY_'))
      && hasValue(effective[key]));
    if (firebase.mode !== 'local' || sentry.mode !== 'disabled' || connectedKeys.length) {
      throw new Error(`EAS ${profile} profile is local-only; remove connected service configuration.`);
    }
  }
  return { profile, runtime: intent.runtime, mode: intent.mode };
}
