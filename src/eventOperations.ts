import type { Event } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export const EVENT_MINIMUM_UPCOMING_COUNT = 5;
export const EVENT_MINIMUM_HORIZON_DAYS = 7;
export const EVENT_VERIFICATION_MAX_AGE_DAYS = 7;

export type EventCatalogIssueCode =
  | 'invalid_start'
  | 'invalid_verification'
  | 'future_verification'
  | 'stale_verification'
  | 'no_upcoming_events'
  | 'insufficient_upcoming_events'
  | 'short_catalog_horizon';

export type EventCatalogIssue = {
  code: EventCatalogIssueCode;
  eventIds?: string[];
  actual?: number;
  required?: number;
};

export type EventCatalogHealth = {
  checkedAt: string;
  totalCount: number;
  upcomingCount: number;
  expiredCount: number;
  horizonDays: number | null;
  latestUpcomingAt: string | null;
  staleVerificationCount: number;
  healthy: boolean;
  issues: EventCatalogIssue[];
};

function parseVerificationDate(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendarCheck = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day
  ) {
    return null;
  }

  // Katalog Ankara içindir. Tarih-only doğrulama alanını Türkiye gününün
  // başlangıcı olarak ele almak, CI'ın UTC saatine göre farklı karar vermesini önler.
  return Date.parse(`${value}T00:00:00+03:00`);
}

export function analyzeEventCatalog(
  events: readonly Event[],
  now: Date = new Date(),
): EventCatalogHealth {
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) throw new Error('event_catalog_invalid_check_time');

  const issues: EventCatalogIssue[] = [];
  const invalidStartIds: string[] = [];
  const invalidVerificationIds: string[] = [];
  const futureVerificationIds: string[] = [];
  const staleVerificationIds: string[] = [];
  const upcomingStarts: number[] = [];
  let expiredCount = 0;

  for (const event of events) {
    const startsAt = Date.parse(event.startsAt);
    if (!Number.isFinite(startsAt)) invalidStartIds.push(event.id);
    else if (startsAt > nowMs) upcomingStarts.push(startsAt);
    else expiredCount += 1;

    const verifiedAt = parseVerificationDate(event.verifiedAt);
    if (verifiedAt === null) invalidVerificationIds.push(event.id);
    else if (verifiedAt > nowMs) futureVerificationIds.push(event.id);
    else if ((nowMs - verifiedAt) / DAY_MS > EVENT_VERIFICATION_MAX_AGE_DAYS) {
      staleVerificationIds.push(event.id);
    }
  }

  if (invalidStartIds.length) issues.push({ code: 'invalid_start', eventIds: invalidStartIds });
  if (invalidVerificationIds.length) {
    issues.push({ code: 'invalid_verification', eventIds: invalidVerificationIds });
  }
  if (futureVerificationIds.length) {
    issues.push({ code: 'future_verification', eventIds: futureVerificationIds });
  }
  if (staleVerificationIds.length) {
    issues.push({ code: 'stale_verification', eventIds: staleVerificationIds });
  }

  const upcomingCount = upcomingStarts.length;
  const latestUpcomingMs = upcomingCount ? Math.max(...upcomingStarts) : null;
  const horizonDays = latestUpcomingMs === null ? null : (latestUpcomingMs - nowMs) / DAY_MS;

  if (!upcomingCount) issues.push({ code: 'no_upcoming_events' });
  else {
    if (upcomingCount < EVENT_MINIMUM_UPCOMING_COUNT) {
      issues.push({
        code: 'insufficient_upcoming_events',
        actual: upcomingCount,
        required: EVENT_MINIMUM_UPCOMING_COUNT,
      });
    }
    if (horizonDays !== null && horizonDays < EVENT_MINIMUM_HORIZON_DAYS) {
      issues.push({
        code: 'short_catalog_horizon',
        actual: Number(horizonDays.toFixed(2)),
        required: EVENT_MINIMUM_HORIZON_DAYS,
      });
    }
  }

  return {
    checkedAt: now.toISOString(),
    totalCount: events.length,
    upcomingCount,
    expiredCount,
    horizonDays: horizonDays === null ? null : Number(horizonDays.toFixed(2)),
    latestUpcomingAt: latestUpcomingMs === null ? null : new Date(latestUpcomingMs).toISOString(),
    staleVerificationCount: staleVerificationIds.length,
    healthy: issues.length === 0,
    issues,
  };
}
