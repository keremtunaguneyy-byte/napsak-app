export type PerformanceMetric = 'app_ready' | 'recommendation_compute';
export type PerformanceDurationBucket =
  | 'lt_10_ms'
  | '10_49_ms'
  | '50_199_ms'
  | '200_999_ms'
  | 'gte_1000_ms';

export const RECOMMENDATION_P95_BUDGET_MS = 25;

/** Converts a duration to a coarse, privacy-safe analytics value. */
export function performanceDurationBucket(durationMs: number): PerformanceDurationBucket {
  if (!Number.isFinite(durationMs) || durationMs < 0) throw new Error('performance_invalid_duration');
  if (durationMs < 10) return 'lt_10_ms';
  if (durationMs < 50) return '10_49_ms';
  if (durationMs < 200) return '50_199_ms';
  if (durationMs < 1_000) return '200_999_ms';
  return 'gte_1000_ms';
}
