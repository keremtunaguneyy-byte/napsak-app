import type { ProfilerOnRenderCallback } from 'react';
import type { ResultFilter } from '../../resultFilters';
import { createFilterTimingRecorder, FilterTiming } from './homeFilterDiagnostics';

/** Opt-in local development diagnostics only. Never sent to analytics or Sentry. */
export const HOME_PROFILING_ENABLED = typeof __DEV__ !== 'undefined' && __DEV__
  && process.env.EXPO_PUBLIC_GEZEK_HOME_PROFILING === '1';

type Sample = { metric: 'recommendation_compute' | 'home_commit' | 'svg_parse_and_construct'; durationMs: number; phase?: string } | FilterTiming;
type Snapshot = { homeRenders: number; assetRenders: number; recommendationComputes: number; assetMounts: number; assetUnmounts: number; svgCacheHits: number; svgCacheMisses: number; svgElementsConstructed: number; samples: Sample[] };
const diagnostics = globalThis as typeof globalThis & { __GEZEK_HOME_PROFILE__?: Snapshot };

function snapshot(): Snapshot {
  return diagnostics.__GEZEK_HOME_PROFILE__ ??= { homeRenders: 0, assetRenders: 0, recommendationComputes: 0, assetMounts: 0, assetUnmounts: 0, svgCacheHits: 0, svgCacheMisses: 0, svgElementsConstructed: 0, samples: [] };
}

let filterTiming: ReturnType<typeof createFilterTimingRecorder> | undefined;
function timing() {
  return filterTiming ??= createFilterTimingRecorder(() => performance.now(), callback => { requestAnimationFrame(callback); }, recordSample);
}
export function recordHomeFilterPress(filter: ResultFilter): void {
  if (HOME_PROFILING_ENABLED) timing().press(filter);
}
export function recordHomeContentCommit(filter: ResultFilter): void {
  if (HOME_PROFILING_ENABLED) timing().commit(filter);
}
export function recordHomeAssetMount(mounted: boolean): void {
  if (!HOME_PROFILING_ENABLED) return;
  const data = snapshot();
  if (mounted) data.assetMounts += 1;
  else data.assetUnmounts += 1;
}
export function recordHomeSvgCache(hit: boolean, durationMs = 0, elements = 0): void {
  if (!HOME_PROFILING_ENABLED) return;
  const data = snapshot();
  if (hit) data.svgCacheHits += 1;
  else {
    data.svgCacheMisses += 1;
    data.svgElementsConstructed += elements;
    recordSample({ metric: 'svg_parse_and_construct', durationMs });
  }
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
