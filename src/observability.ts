import * as Sentry from '@sentry/react-native';

import {
  AppErrorArea,
  isSafeScreenName,
  normalizeOperationalError,
  resolveObservabilitySettings,
  sanitizeObservabilityEvent,
} from './observabilityPolicy';

let initialized = false;

export function initializeObservability(env: Record<string, string | undefined>): void {
  if (initialized) return;
  const settings = resolveObservabilitySettings(env);
  Sentry.init({
    dsn: settings.mode === 'sentry' ? settings.dsn : undefined,
    enabled: settings.mode === 'sentry',
    environment: settings.environment,
    sendDefaultPii: false,
    attachStacktrace: true,
    tracesSampleRate: 0,
    beforeBreadcrumb: () => null,
    beforeSend: event => sanitizeObservabilityEvent(event),
  });
  initialized = true;
}

export function captureOperationalError(error: unknown, area: AppErrorArea, failureCode: string): void {
  Sentry.withScope(scope => {
    scope.setTag('app_area', area);
    scope.setTag('failure_code', failureCode);
    Sentry.captureException(normalizeOperationalError(error, area, failureCode));
  });
}

export function setObservabilityScreen(screen: string): void {
  if (!isSafeScreenName(screen)) return;
  Sentry.setTag('screen', screen);
}

export const ObservedApp = Sentry.wrap;
