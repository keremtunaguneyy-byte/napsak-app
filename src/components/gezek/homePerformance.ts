import type { ProfilerOnRenderCallback } from 'react';

/** Opt-in local development diagnostics only. Never sent to analytics or Sentry. */
export const HOME_PROFILING_ENABLED = typeof __DEV__ !== 'undefined' && __DEV__
  && process.env.EXPO_PUBLIC_GEZEK_HOME_PROFILING === '1';

type Sample = { metric: 'recommendation_compute' | 'home_commit'; durationMs: number; phase?: string };
type Snapshot = { homeRenders: number; assetRenders: number; recommendationComputes: number; samples: Sample[] };
const diagnostics = globalThis as typeof globalThis & { __GEZEK_HOME_PROFILE__?: Snapshot };

function snapshot(): Snapshot {
  return diagnostics.__GEZEK_HOME_PROFILE__ ??= { homeRenders: 0, assetRenders: 0, recommendationComputes: 0, samples: [] };
}

export function recordHomeRender(part: 'home' | 'asset'): void {
  if (!HOME_PROFILING_ENABLED) return;
  const data = snapshot();
  if (part === 'home') data.homeRenders += 1;
  else data.assetRenders += 1;
}

export function recordHomeRecommendation(durationMs: number): void {
  if (!HOME_PROFILING_ENABLED) return;
  snapshot().recommendationComputes += 1;
  recordSample({ metric: 'recommendation_compute', durationMs });
}

function recordSample(sample: Sample): void {
  const samples = snapshot().samples;
  samples.push(sample);
  if (samples.length > 200) samples.shift();
}

export const recordHomeCommit: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
  if (HOME_PROFILING_ENABLED) recordSample({ metric: 'home_commit', phase, durationMs: actualDuration });
};
