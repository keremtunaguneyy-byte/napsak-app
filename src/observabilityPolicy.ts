export type AppErrorArea =
  | 'app_startup'
  | 'catalog_refresh'
  | 'local_persistence'
  | 'remote_sync'
  | 'user_data_deletion'
  | 'render';

export type ObservabilitySettings =
  | { environment: 'development' | 'production'; mode: 'disabled' }
  | { environment: 'development' | 'production'; mode: 'sentry'; dsn: string };

type PublicEnvironment = Record<string, string | undefined>;
type MutableEvent = Record<string, unknown> & {
  tags?: Record<string, string | number | boolean | undefined>;
  exception?: { values?: Array<Record<string, unknown>> };
};

const SAFE_TAGS = new Set(['app_area', 'environment', 'failure_code', 'screen']);

function configured(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function environmentOf(value: string | undefined): 'development' | 'production' {
  if (!value || value === 'development') return 'development';
  if (value === 'production') return 'production';
  throw new Error('EXPO_PUBLIC_APP_ENV must be development or production.');
}

function isPlaceholder(value: string): boolean {
  return /replace-with|your[-_]|example/i.test(value);
}

function validSentryDsn(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && Boolean(url.username)
      && !url.password
      && (url.hostname === 'sentry.io' || url.hostname.endsWith('.sentry.io'))
      && /^\/\d+$/.test(url.pathname)
      && !url.search
      && !url.hash;
  } catch {
    return false;
  }
}

export function resolveObservabilitySettings(env: PublicEnvironment): ObservabilitySettings {
  const environment = environmentOf(env.EXPO_PUBLIC_APP_ENV);
  const dsn = env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  if (!configured(dsn)) return { environment, mode: 'disabled' };
  if (isPlaceholder(dsn) || !validSentryDsn(dsn)) {
    throw new Error('EXPO_PUBLIC_SENTRY_DSN must be a non-placeholder HTTPS sentry.io DSN.');
  }
  return { environment, mode: 'sentry', dsn };
}

export function normalizeOperationalError(error: unknown, area: AppErrorArea, failureCode: string): Error {
  if (!/^[a-z0-9_]{3,64}$/.test(failureCode)) throw new Error('Observability failure codes must be stable snake_case identifiers.');
  const normalized = new Error(`${area}:${failureCode}`);
  normalized.name = error instanceof Error && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(error.name)
    ? error.name
    : 'OperationalError';
  if (error instanceof Error && error.stack) {
    const stackFrames = error.stack.split('\n').slice(1).join('\n');
    if (stackFrames) normalized.stack = `${normalized.name}: ${normalized.message}\n${stackFrames}`;
  }
  return normalized;
}

export function sanitizeObservabilityEvent<T>(event: T): T {
  const source = event as MutableEvent;
  const safe = { ...source } as MutableEvent;
  delete safe.user;
  delete safe.request;
  delete safe.breadcrumbs;
  delete safe.extra;
  delete safe.message;
  delete safe.logentry;
  delete safe.transaction;
  delete safe.fingerprint;

  if (source.tags) {
    safe.tags = Object.fromEntries(Object.entries(source.tags).filter(([key]) => SAFE_TAGS.has(key)));
  }
  const values = source.exception?.values;
  if (values) {
    safe.exception = {
      ...source.exception,
      values: values.map(value => ({ ...value, value: 'Application error' })),
    };
  }
  return safe as T;
}

export function isSafeScreenName(value: string): boolean {
  return /^[a-z][a-z0-9_-]{0,32}$/.test(value);
}
