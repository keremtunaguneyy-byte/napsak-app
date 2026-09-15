import type { Coordinates } from './domain';
import { embeddedCatalog, type CatalogSnapshot } from './data/catalog';
import { analyzeEventCatalog } from './eventOperations';
import {
  budgetPreferencePriceLevel,
  durationEligible,
  eventStartEligible,
  experienceLifecycleEligible,
  placeGroupSignal,
  placeInterestEligible,
  recommendAll,
  type ContentFilter,
  type RecommendationItem,
} from './recommendations';
import type {
  BudgetPreference,
  DurationPreference,
  Event,
  Experience,
  GroupSizePreference,
  Interest,
  Mood,
  RecommendationKind,
} from './types';

export const RECOMMENDATION_QUALITY_SCHEMA_VERSION = 2 as const;
export const RECOMMENDATION_QUALITY_LIMIT = 5 as const;

export type RecommendationQualityCatalog = Pick<CatalogSnapshot, 'places' | 'experiences' | 'events' | 'ideas'>;

export type RecommendationQualityScenario = {
  id: string;
  label: string;
  purpose: string;
  filter: Exclude<ContentFilter, 'all'>;
  mood?: Mood;
  interests: Interest[];
  budget?: BudgetPreference;
  groupSize?: GroupSizePreference;
  duration?: DurationPreference;
  coordinates?: Coordinates;
  dismissed?: string[];
  seed: number;
  now: Date;
};

type RecommendationLocationInput =
  | { mode: 'scenario' }
  | { mode: 'none' }
  | { mode: 'explicit'; coordinates: Coordinates };

export const GOLDEN_RECOMMENDATION_SCENARIOS: readonly RecommendationQualityScenario[] = [
  {
    id: 'solo-student-tunali-coffee-art',
    label: 'Solo student · Tunalı · Kahve + Sanat',
    purpose: 'A location-aware, lower-budget solo context around Tunalı.',
    filter: 'experience', mood: 'Sakin', interests: ['Kahve', 'Sanat'], budget: '₺', groupSize: 'Tek',
    duration: 'Fark etmez', coordinates: { latitude: 39.9090, longitude: 32.8610 }, seed: 101,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'couple-ulus-art',
    label: 'Couple · Ulus · Sanat',
    purpose: 'A culture-first couple context close to Ulus.',
    filter: 'experience', mood: 'Meraklı', interests: ['Sanat'], budget: '₺', groupSize: '2 kişi',
    duration: '1–2 saat', coordinates: { latitude: 39.9410, longitude: 32.8550 }, seed: 111,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'friends-cukurambar-food-events',
    label: '3–4 friends · Çukurambar · Lezzet + Etkinlik',
    purpose: 'A social, location-aware place recommendation context.',
    filter: 'place', mood: 'Sosyal', interests: ['Lezzet', 'Etkinlik'], budget: '₺₺', groupSize: '3–4 kişi',
    coordinates: { latitude: 39.8911, longitude: 32.8109 }, seed: 121,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'large-group-eryaman-nature-events',
    label: '5+ group · Eryaman · Doğa + Etkinlik',
    purpose: 'A large-group context near Eryaman/Batıkent.',
    filter: 'place', mood: 'Enerjik', interests: ['Doğa', 'Etkinlik'], budget: 'Ücretsiz', groupSize: '5+',
    coordinates: { latitude: 39.9895, longitude: 32.6510 }, seed: 131,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'no-location-permission',
    label: 'No location permission',
    purpose: 'The same ranking surface remains usable with no coordinates.',
    filter: 'place', mood: 'Sakin', interests: ['Doğa'], budget: 'Ücretsiz', groupSize: 'Tek', seed: 141,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'cold-start-no-interests',
    label: 'Cold start · no interests',
    purpose: 'No interests or optional plan preferences are available.',
    filter: 'experience', interests: [], seed: 151,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'tight-budget',
    label: 'Tight budget',
    purpose: 'Free options are a ranking signal, not a new hard filter.',
    filter: 'place', mood: 'Meraklı', interests: ['Sanat', 'Doğa'], budget: 'Ücretsiz', groupSize: '2 kişi',
    coordinates: { latitude: 39.9208, longitude: 32.8541 }, seed: 161,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'premium-budget',
    label: 'Expensive budget',
    purpose: 'Premium-priced options receive the existing ranking signal.',
    filter: 'place', mood: 'Sosyal', interests: ['Lezzet'], budget: '₺₺₺', groupSize: '2 kişi',
    coordinates: { latitude: 39.9090, longitude: 32.8570 }, seed: 171,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'flexible-budget',
    label: 'Flexible budget',
    purpose: 'No price level is treated as an exact budget target.',
    filter: 'place', mood: 'Sosyal', interests: ['Lezzet'], budget: 'Fark etmez', groupSize: '2 kişi',
    coordinates: { latitude: 39.9090, longitude: 32.8570 }, seed: 181,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'short-duration',
    label: 'Short duration · 30–60 dk',
    purpose: 'Experience duration eligibility is measured as a hard gate.',
    filter: 'experience', mood: 'Sakin', interests: ['Sanat', 'Doğa'], budget: 'Ücretsiz', groupSize: 'Tek',
    duration: '30–60 dk', coordinates: { latitude: 39.9208, longitude: 32.8541 }, seed: 191,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'long-duration',
    label: 'Long duration · Yarım gün',
    purpose: 'Long Experience supply is measured without filling from shorter plans.',
    filter: 'experience', mood: 'Enerjik', interests: ['Doğa', 'Sanat'], budget: '₺', groupSize: '5+',
    duration: 'Yarım gün', coordinates: { latitude: 39.9208, longitude: 32.8541 }, seed: 201,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'sparse-interest',
    label: 'Sparse interest context',
    purpose: 'A narrow Experience intersection may honestly return fewer than five results.',
    filter: 'experience', mood: 'Meraklı', interests: ['Kahve'], budget: '₺₺', groupSize: 'Tek',
    duration: '3–4 saat', seed: 211,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'active-event-catalog',
    label: 'Active event catalog context',
    purpose: 'Only future, parseable event starts remain eligible at the baseline instant.',
    filter: 'event', mood: 'Sosyal', interests: ['Etkinlik'], budget: '₺₺₺', groupSize: '3–4 kişi', seed: 221,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
  {
    id: 'stale-event-catalog',
    label: 'Stale event catalog context',
    purpose: 'A fully expired local event catalog returns zero rather than stale results.',
    filter: 'event', mood: 'Sosyal', interests: ['Etkinlik'], groupSize: '2 kişi', seed: 231,
    now: new Date('2026-09-21T12:00:00+03:00'),
  },
  {
    id: 'idea-controlled-discovery',
    label: 'Fikir · controlled 1+4 discovery',
    purpose: 'One selected-interest idea plus four independent discovery ideas.',
    filter: 'idea', mood: 'Meraklı', interests: ['Kahve', 'Sanat'], budget: 'Fark etmez', groupSize: '2 kişi', seed: 241,
    now: new Date('2026-09-14T12:00:00+03:00'),
  },
] as const;

type CountMap = Record<string, number>;
type QualityCandidate = Experience | Event | (RecommendationQualityCatalog['ideas'][number]) | (RecommendationQualityCatalog['places'][number] & { kind: 'place' });

export type QualityBatchMetrics = {
  seed: number;
  resultCount: number;
  ids: string[];
  reasonCount: number;
  resultsWithReasons: number;
  moodMatchCount: number;
  interestMatchCount: number;
  exactBudgetFitCount: number;
  groupFitCount: number;
  primaryInterestMatchCount: number;
  secondaryOnlyInterestMatchCount: number;
  categoryDistribution: CountMap;
  districtDistribution: CountMap;
};

export type QualityScenarioMetrics = {
  id: string;
  label: string;
  purpose: string;
  filter: Exclude<ContentFilter, 'all'>;
  eligibleCandidateCount: number;
  eligibleCandidatesByKind: Record<RecommendationKind, number>;
  durationExcludedCount: number;
  eventCatalog: {
    upcomingCount: number;
    expiredCount: number;
    invalidStartCount: number;
    staleVerificationCount: number;
  };
  batches: [QualityBatchMetrics, QualityBatchMetrics, QualityBatchMetrics];
  repetition: {
    adjacentOverlapCounts: [number, number];
    uniqueResultCount: number;
    repeatedResultCount: number;
    repeatedSlotCount: number;
  };
  locationOnOff?: {
    locationOnIds: string[];
    locationOffIds: string[];
    overlapCount: number;
    sameRankCount: number;
    changedSlotCount: number;
    symmetricDifferenceCount: number;
    eligibleCandidateCountDelta: number;
  };
  deterministicReplay: boolean;
  dismissedLeakageCount: number;
  expiredOrInvalidEventLeakageCount: number;
  invalidLifecycleLeakageCount: number;
  durationLeakageCount: number;
  duplicateResultCount: number;
  invariantFailures: string[];
};

export type RecommendationQualityReport = {
  schemaVersion: typeof RECOMMENDATION_QUALITY_SCHEMA_VERSION;
  catalogVersion: string;
  limit: typeof RECOMMENDATION_QUALITY_LIMIT;
  scenarios: QualityScenarioMetrics[];
  summary: {
    scenarioCount: number;
    zeroResultCount: number;
    zeroResultRate: number;
    partialResultCount: number;
    partialResultRate: number;
    fullFiveCount: number;
    fullFiveRate: number;
    totalEligibleCandidateCount: number;
    totalResultCount: number;
    totalReasonCount: number;
    primaryInterestMatchCount: number;
    secondaryOnlyInterestMatchCount: number;
    moodMatchCount: number;
    interestMatchCount: number;
    exactBudgetFitCount: number;
    groupFitCount: number;
    categoryDiversityMean: number;
    districtDiversityMean: number;
    repeatedResultCount: number;
    repeatedSlotCount: number;
    locationComparedScenarioCount: number;
    locationChangedSlotCount: number;
    locationSymmetricDifferenceCount: number;
    staleOrExpiredLeakageCount: number;
    deterministicReplayFailures: number;
    objectiveInvariantFailureCount: number;
  };
  objectiveInvariantFailures: string[];
};

function increment(counts: CountMap, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function matchesInterests(item: RecommendationItem, interests: Interest[]): boolean {
  if (!interests.length) return false;
  if (item.kind === 'experience') {
    return interests.some(interest => item.primaryInterests.includes(interest) || item.secondaryInterests.includes(interest));
  }
  return interests.some(interest => item.category === interest || item.interests.includes(interest));
}

function explicitGroupFit(item: RecommendationItem, groupSize?: GroupSizePreference): boolean {
  if (!groupSize) return false;
  return item.kind === 'place' ? placeGroupSignal(item, groupSize) > 0 : item.groupSizes.includes(groupSize);
}

function eligibleCandidates(
  scenario: RecommendationQualityScenario,
  catalog: RecommendationQualityCatalog,
): QualityCandidate[] {
  const dismissed = scenario.dismissed ?? [];
  if (scenario.filter === 'experience') {
    return catalog.experiences
      .filter(item => !dismissed.includes(item.id))
      .filter(item => experienceLifecycleEligible(item, scenario.now))
      .filter(item => durationEligible(item, scenario.duration))
      .filter(item => !scenario.interests.length || scenario.interests.some(interest => item.primaryInterests.includes(interest) || item.secondaryInterests.includes(interest)));
  }
  if (scenario.filter === 'place') {
    return catalog.places
      .filter(item => !dismissed.includes(item.id))
      .filter(item => placeInterestEligible(item, scenario.interests))
      .map(item => ({ ...item, kind: 'place' as const }));
  }
  if (scenario.filter === 'idea') {
    return catalog.ideas.filter(item => !dismissed.includes(item.id));
  }
  return catalog.events
    .filter(item => !dismissed.includes(item.id))
    .filter(item => eventStartEligible(item, scenario.now));
}

function recommendationOptions(
  scenario: RecommendationQualityScenario,
  catalog: RecommendationQualityCatalog,
  seed: number,
  previousBatch: string[] = [],
  location: RecommendationLocationInput = { mode: 'scenario' },
) {
  const coordinates = location.mode === 'scenario'
    ? scenario.coordinates
    : location.mode === 'explicit'
      ? location.coordinates
      : undefined;
  return {
    ...catalog,
    filter: scenario.filter,
    mood: scenario.mood,
    interests: scenario.interests,
    dismissed: scenario.dismissed ?? [],
    budget: scenario.budget,
    groupSize: scenario.groupSize,
    duration: scenario.duration,
    coordinates,
    limit: RECOMMENDATION_QUALITY_LIMIT,
    seed,
    previousBatch,
    now: scenario.now,
  };
}

function batchMetrics(seed: number, results: RecommendationItem[], scenario: RecommendationQualityScenario): QualityBatchMetrics {
  const categoryDistribution: CountMap = {};
  const districtDistribution: CountMap = {};
  const preferredPrice = budgetPreferencePriceLevel(scenario.budget);
  let primaryInterestMatchCount = 0;
  let secondaryOnlyInterestMatchCount = 0;
  for (const item of results) {
    increment(categoryDistribution, item.category);
    increment(districtDistribution, item.kind === 'experience' || item.kind === 'place' ? item.district : 'not-applicable');
    if (item.kind === 'experience' && scenario.interests.length) {
      if (scenario.interests.some(interest => item.primaryInterests.includes(interest))) primaryInterestMatchCount += 1;
      else if (scenario.interests.some(interest => item.secondaryInterests.includes(interest))) secondaryOnlyInterestMatchCount += 1;
    }
  }
  return {
    seed,
    resultCount: results.length,
    ids: results.map(item => item.id),
    reasonCount: results.reduce((sum, item) => sum + item.reasons.length, 0),
    resultsWithReasons: results.filter(item => item.reasons.length > 0).length,
    moodMatchCount: scenario.mood ? results.filter(item => item.moods.includes(scenario.mood!)).length : 0,
    interestMatchCount: results.filter(item => matchesInterests(item, scenario.interests)).length,
    exactBudgetFitCount: preferredPrice === undefined ? 0 : results.filter(item => item.priceLevel === preferredPrice).length,
    groupFitCount: scenario.groupSize ? results.filter(item => explicitGroupFit(item, scenario.groupSize)).length : 0,
    primaryInterestMatchCount,
    secondaryOnlyInterestMatchCount,
    categoryDistribution,
    districtDistribution,
  };
}

function eventCatalogMetrics(events: Event[], now: Date): QualityScenarioMetrics['eventCatalog'] {
  const health = analyzeEventCatalog(events, now);
  return {
    upcomingCount: health.upcomingCount,
    expiredCount: health.expiredCount,
    invalidStartCount: health.issues.find(issue => issue.code === 'invalid_start')?.eventIds?.length ?? 0,
    staleVerificationCount: health.staleVerificationCount,
  };
}

function countDurationExclusions(scenario: RecommendationQualityScenario, experiences: Experience[]): number {
  if (scenario.filter !== 'experience' || !scenario.duration || scenario.duration === 'Fark etmez') return 0;
  const dismissed = scenario.dismissed ?? [];
  return experiences
    .filter(item => !dismissed.includes(item.id))
    .filter(item => experienceLifecycleEligible(item, scenario.now))
    .filter(item => !scenario.interests.length || scenario.interests.some(interest => item.primaryInterests.includes(interest) || item.secondaryInterests.includes(interest)))
    .filter(item => !durationEligible(item, scenario.duration)).length;
}

function overlap(left: string[], right: string[]): number {
  const rightIds = new Set(right);
  return left.filter(id => rightIds.has(id)).length;
}

export function analyzeRecommendationScenario(
  scenario: RecommendationQualityScenario,
  catalog: RecommendationQualityCatalog,
): QualityScenarioMetrics {
  const candidates = eligibleCandidates(scenario, catalog);
  const candidatesByKind: Record<RecommendationKind, number> = { experience: 0, place: 0, event: 0, idea: 0 };
  for (const candidate of candidates) candidatesByKind[candidate.kind] += 1;

  const first = recommendAll(recommendationOptions(scenario, catalog, scenario.seed));
  const replay = recommendAll(recommendationOptions(scenario, catalog, scenario.seed));
  const second = recommendAll(recommendationOptions(scenario, catalog, scenario.seed + 1, first.map(item => item.id)));
  const third = recommendAll(recommendationOptions(scenario, catalog, scenario.seed + 2, second.map(item => item.id)));
  const batches: [QualityBatchMetrics, QualityBatchMetrics, QualityBatchMetrics] = [
    batchMetrics(scenario.seed, first, scenario),
    batchMetrics(scenario.seed + 1, second, scenario),
    batchMetrics(scenario.seed + 2, third, scenario),
  ];
  const allIds = batches.flatMap(batch => batch.ids);
  const occurrences = new Map<string, number>();
  for (const id of allIds) occurrences.set(id, (occurrences.get(id) ?? 0) + 1);
  const repeated = [...occurrences.values()].filter(count => count > 1);
  const dismissed = new Set(scenario.dismissed ?? []);
  const allResults = [...first, ...second, ...third];
  const dismissedLeakageCount = allResults.filter(item => dismissed.has(item.id)).length;
  const expiredOrInvalidEventLeakageCount = allResults.filter(item => item.kind === 'event' && !eventStartEligible(item, scenario.now)).length;
  const invalidLifecycleLeakageCount = allResults.filter(item => item.kind === 'experience' && !experienceLifecycleEligible(item, scenario.now)).length;
  const durationLeakageCount = allResults.filter(item => item.kind === 'experience' && !durationEligible(item, scenario.duration)).length;
  const duplicateResultCount = batches.reduce((sum, batch) => sum + batch.resultCount - new Set(batch.ids).size, 0);
  const deterministicReplay = JSON.stringify(first) === JSON.stringify(replay);

  let locationOnOff: QualityScenarioMetrics['locationOnOff'];
  if (scenario.coordinates) {
    const locationOffCandidates = eligibleCandidates({ ...scenario, coordinates: undefined }, catalog);
    const locationOff = recommendAll(recommendationOptions(scenario, catalog, scenario.seed, [], { mode: 'none' }));
    const locationOnIds = first.map(item => item.id);
    const locationOffIds = locationOff.map(item => item.id);
    const overlapCount = overlap(locationOnIds, locationOffIds);
    const sameRankCount = locationOnIds.filter((id, index) => locationOffIds[index] === id).length;
    locationOnOff = {
      locationOnIds,
      locationOffIds,
      overlapCount,
      sameRankCount,
      changedSlotCount: Math.max(locationOnIds.length, locationOffIds.length) - sameRankCount,
      symmetricDifferenceCount: locationOnIds.length + locationOffIds.length - overlapCount * 2,
      eligibleCandidateCountDelta: candidates.length - locationOffCandidates.length,
    };
  }

  const invariantFailures: string[] = [];
  if (!deterministicReplay) invariantFailures.push('deterministic_replay');
  if (dismissedLeakageCount) invariantFailures.push('dismissed_leakage');
  if (expiredOrInvalidEventLeakageCount) invariantFailures.push('expired_or_invalid_event_leakage');
  if (invalidLifecycleLeakageCount) invariantFailures.push('invalid_lifecycle_leakage');
  if (durationLeakageCount) invariantFailures.push('duration_leakage');
  if (duplicateResultCount) invariantFailures.push('duplicate_results');
  if (batches.some(batch => batch.resultCount > RECOMMENDATION_QUALITY_LIMIT)) invariantFailures.push('result_limit');
  if (batches.some(batch => batch.resultCount > candidates.length)) invariantFailures.push('result_exceeds_candidates');
  if (batches.some(batch => batch.resultsWithReasons !== batch.resultCount)) invariantFailures.push('missing_explanation');
  if (locationOnOff?.eligibleCandidateCountDelta) invariantFailures.push('location_changed_eligibility');

  return {
    id: scenario.id,
    label: scenario.label,
    purpose: scenario.purpose,
    filter: scenario.filter,
    eligibleCandidateCount: candidates.length,
    eligibleCandidatesByKind: candidatesByKind,
    durationExcludedCount: countDurationExclusions(scenario, catalog.experiences),
    eventCatalog: eventCatalogMetrics(catalog.events, scenario.now),
    batches,
    repetition: {
      adjacentOverlapCounts: [overlap(batches[0].ids, batches[1].ids), overlap(batches[1].ids, batches[2].ids)],
      uniqueResultCount: occurrences.size,
      repeatedResultCount: repeated.length,
      repeatedSlotCount: repeated.reduce((sum, count) => sum + count - 1, 0),
    },
    locationOnOff,
    deterministicReplay,
    dismissedLeakageCount,
    expiredOrInvalidEventLeakageCount,
    invalidLifecycleLeakageCount,
    durationLeakageCount,
    duplicateResultCount,
    invariantFailures,
  };
}

const rate = (count: number, total: number) => total ? Number((count / total).toFixed(4)) : 0;
const mean = (values: number[]) => values.length
  ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3))
  : 0;

export function runRecommendationQualityBaseline(
  catalogSnapshot: CatalogSnapshot = embeddedCatalog('ankara'),
  scenarios: readonly RecommendationQualityScenario[] = GOLDEN_RECOMMENDATION_SCENARIOS,
): RecommendationQualityReport {
  const scenarioMetrics = scenarios.map(scenario => analyzeRecommendationScenario(scenario, catalogSnapshot));
  const firstBatches = scenarioMetrics.map(scenario => scenario.batches[0]);
  const resultCounts = firstBatches.map(batch => batch.resultCount);
  const zeroResultCount = resultCounts.filter(count => count === 0).length;
  const partialResultCount = resultCounts.filter(count => count > 0 && count < RECOMMENDATION_QUALITY_LIMIT).length;
  const fullFiveCount = resultCounts.filter(count => count === RECOMMENDATION_QUALITY_LIMIT).length;
  const objectiveInvariantFailures = scenarioMetrics.flatMap(scenario => scenario.invariantFailures.map(failure => `${scenario.id}:${failure}`));
  const locationComparisons = scenarioMetrics.flatMap(scenario => scenario.locationOnOff ? [scenario.locationOnOff] : []);

  return {
    schemaVersion: RECOMMENDATION_QUALITY_SCHEMA_VERSION,
    catalogVersion: 'catalogVersion' in catalogSnapshot ? catalogSnapshot.catalogVersion : 'custom',
    limit: RECOMMENDATION_QUALITY_LIMIT,
    scenarios: scenarioMetrics,
    summary: {
      scenarioCount: scenarioMetrics.length,
      zeroResultCount,
      zeroResultRate: rate(zeroResultCount, scenarioMetrics.length),
      partialResultCount,
      partialResultRate: rate(partialResultCount, scenarioMetrics.length),
      fullFiveCount,
      fullFiveRate: rate(fullFiveCount, scenarioMetrics.length),
      totalEligibleCandidateCount: scenarioMetrics.reduce((sum, scenario) => sum + scenario.eligibleCandidateCount, 0),
      totalResultCount: resultCounts.reduce((sum, count) => sum + count, 0),
      totalReasonCount: firstBatches.reduce((sum, batch) => sum + batch.reasonCount, 0),
      primaryInterestMatchCount: firstBatches.reduce((sum, batch) => sum + batch.primaryInterestMatchCount, 0),
      secondaryOnlyInterestMatchCount: firstBatches.reduce((sum, batch) => sum + batch.secondaryOnlyInterestMatchCount, 0),
      moodMatchCount: firstBatches.reduce((sum, batch) => sum + batch.moodMatchCount, 0),
      interestMatchCount: firstBatches.reduce((sum, batch) => sum + batch.interestMatchCount, 0),
      exactBudgetFitCount: firstBatches.reduce((sum, batch) => sum + batch.exactBudgetFitCount, 0),
      groupFitCount: firstBatches.reduce((sum, batch) => sum + batch.groupFitCount, 0),
      categoryDiversityMean: mean(firstBatches.map(batch => Object.keys(batch.categoryDistribution).length)),
      districtDiversityMean: mean(firstBatches.map(batch => Object.keys(batch.districtDistribution).filter(key => key !== 'not-applicable').length)),
      repeatedResultCount: scenarioMetrics.reduce((sum, scenario) => sum + scenario.repetition.repeatedResultCount, 0),
      repeatedSlotCount: scenarioMetrics.reduce((sum, scenario) => sum + scenario.repetition.repeatedSlotCount, 0),
      locationComparedScenarioCount: locationComparisons.length,
      locationChangedSlotCount: locationComparisons.reduce((sum, comparison) => sum + comparison.changedSlotCount, 0),
      locationSymmetricDifferenceCount: locationComparisons.reduce((sum, comparison) => sum + comparison.symmetricDifferenceCount, 0),
      staleOrExpiredLeakageCount: scenarioMetrics.reduce((sum, scenario) => sum + scenario.expiredOrInvalidEventLeakageCount + scenario.invalidLifecycleLeakageCount, 0),
      deterministicReplayFailures: scenarioMetrics.filter(scenario => !scenario.deterministicReplay).length,
      objectiveInvariantFailureCount: objectiveInvariantFailures.length,
    },
    objectiveInvariantFailures,
  };
}
