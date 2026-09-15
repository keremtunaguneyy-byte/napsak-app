import { performance } from 'node:perf_hooks';
import { embeddedCatalog } from '../src/data/catalog';
import {
  GOLDEN_RECOMMENDATION_SCENARIOS,
  RECOMMENDATION_QUALITY_LIMIT,
  runRecommendationQualityBaseline,
} from '../src/recommendationQuality';
import { recommendAll } from '../src/recommendations';

const catalog = embeddedCatalog('ankara');
const report = runRecommendationQualityBaseline(catalog);
const latencySamples: number[] = [];
let latencyChecksum = 0;

for (let iteration = 0; iteration < 20; iteration += 1) {
  for (const scenario of GOLDEN_RECOMMENDATION_SCENARIOS) {
    const startedAt = performance.now();
    const results = recommendAll({
      places: catalog.places,
      experiences: catalog.experiences,
      events: catalog.events,
      ideas: catalog.ideas,
      filter: scenario.filter,
      mood: scenario.mood,
      interests: scenario.interests,
      dismissed: scenario.dismissed ?? [],
      budget: scenario.budget,
      groupSize: scenario.groupSize,
      duration: scenario.duration,
      coordinates: scenario.coordinates,
      limit: RECOMMENDATION_QUALITY_LIMIT,
      seed: scenario.seed + iteration,
      now: scenario.now,
    });
    latencySamples.push(performance.now() - startedAt);
    latencyChecksum += results.length;
  }
}

latencySamples.sort((left, right) => left - right);
const percentile = (ratio: number) => latencySamples[Math.min(latencySamples.length - 1, Math.ceil(latencySamples.length * ratio) - 1)];
const latency = {
  measurement: 'single recommendAll call across the golden scenario matrix',
  iterations: latencySamples.length,
  meanMs: Number((latencySamples.reduce((sum, value) => sum + value, 0) / latencySamples.length).toFixed(3)),
  p50Ms: Number(percentile(.5).toFixed(3)),
  p95Ms: Number(percentile(.95).toFixed(3)),
  p99Ms: Number(percentile(.99).toFixed(3)),
  checksum: latencyChecksum,
};
const machineSummary = { ...report, latency };

if (!process.argv.includes('--json')) {
  console.log('\nRecommendation quality baseline (deterministic fixtures, not representative users)');
  console.table(report.scenarios.map(scenario => ({
    id: scenario.id,
    filter: scenario.filter,
    candidates: scenario.eligibleCandidateCount,
    results: scenario.batches[0].resultCount,
    reasons: scenario.batches[0].reasonCount,
    primary: scenario.batches[0].primaryInterestMatchCount,
    secondary: scenario.batches[0].secondaryOnlyInterestMatchCount,
    repeats: scenario.repetition.repeatedResultCount,
    categories: Object.keys(scenario.batches[0].categoryDistribution).length,
    districts: Object.keys(scenario.batches[0].districtDistribution).filter(key => key !== 'not-applicable').length,
    locationSlots: scenario.locationOnOff?.changedSlotCount ?? 'not-paired',
    locationMembership: scenario.locationOnOff?.symmetricDifferenceCount ?? 'not-paired',
  })));
  console.log('\nAggregate baseline');
  console.table(report.summary);
  console.log('\nLatency (report-only; no subjective quality threshold)');
  console.table(latency);
  console.log('\nMachine-readable summary follows.');
}

console.log(`RECOMMENDATION_QUALITY_JSON=${JSON.stringify(machineSummary)}`);

if (report.objectiveInvariantFailures.length) {
  throw new Error(`recommendation_quality_invariant_failure:${report.objectiveInvariantFailures.join(',')}`);
}
