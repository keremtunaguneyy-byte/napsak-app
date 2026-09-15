import test from 'node:test';
import assert from 'node:assert/strict';
import { embeddedCatalog } from '../src/data/catalog';
import {
  analyzeRecommendationScenario,
  GOLDEN_RECOMMENDATION_SCENARIOS,
  runRecommendationQualityBaseline,
  type RecommendationQualityCatalog,
  type RecommendationQualityScenario,
} from '../src/recommendationQuality';
import type { Experience } from '../src/types';

const catalog = embeddedCatalog('ankara');

test('quality baseline output is deterministic', () => {
  assert.deepEqual(runRecommendationQualityBaseline(catalog), runRecommendationQualityBaseline(catalog));
});

test('quality analysis never leaks dismissed results', () => {
  const base = GOLDEN_RECOMMENDATION_SCENARIOS.find(scenario => scenario.id === 'friends-cukurambar-food-events')!;
  const first = analyzeRecommendationScenario(base, catalog);
  const dismissed = first.batches[0].ids[0];
  const measured = analyzeRecommendationScenario({ ...base, dismissed: [dismissed] }, catalog);
  assert.ok(measured.batches.every(batch => !batch.ids.includes(dismissed)));
  assert.equal(measured.dismissedLeakageCount, 0);
});

test('expired and invalid-start events remain visible as supply loss but never leak', () => {
  const scenario = GOLDEN_RECOMMENDATION_SCENARIOS.find(item => item.id === 'active-event-catalog')!;
  const measured = analyzeRecommendationScenario(scenario, {
    ...catalog,
    events: [
      ...catalog.events,
      { ...catalog.events[0], id: 'quality-invalid-event', startsAt: 'not-a-date' },
    ],
  });
  assert.ok(measured.eventCatalog.expiredCount > 0);
  assert.equal(measured.eventCatalog.invalidStartCount, 1);
  assert.equal(measured.expiredOrInvalidEventLeakageCount, 0);
});

test('invalid or expired Experience lifecycle entries never leak', () => {
  const base = catalog.experiences[0];
  const invalid = { ...base, id: 'quality-invalid-lifecycle', lifecycle: 'live', expiresAt: 'not-a-date' } as Experience;
  const expired = { ...base, id: 'quality-expired-lifecycle', lifecycle: 'seasonal', expiresAt: '2026-09-13T00:00:00Z' } as Experience;
  const active = { ...base, id: 'quality-active-lifecycle', lifecycle: 'live', expiresAt: '2026-09-15T00:00:00Z' } as Experience;
  const scenario: RecommendationQualityScenario = {
    id: 'lifecycle-fixture', label: 'Lifecycle fixture', purpose: 'Objective lifecycle characterization.',
    filter: 'experience', interests: [], seed: 1, now: new Date('2026-09-14T00:00:00Z'),
  };
  const fixtureCatalog: RecommendationQualityCatalog = { places: [], ideas: [], events: [], experiences: [invalid, expired, active] };
  const measured = analyzeRecommendationScenario(scenario, fixtureCatalog);
  assert.deepEqual(measured.batches[0].ids, ['quality-active-lifecycle']);
  assert.equal(measured.invalidLifecycleLeakageCount, 0);
});

test('every measured recommendation has an explanation', () => {
  const report = runRecommendationQualityBaseline(catalog);
  for (const scenario of report.scenarios) {
    for (const batch of scenario.batches) assert.equal(batch.resultsWithReasons, batch.resultCount, scenario.id);
  }
});

test('three-batch repetition is reported from consecutive seeded refreshes', () => {
  const measured = analyzeRecommendationScenario(GOLDEN_RECOMMENDATION_SCENARIOS[0], catalog);
  assert.equal(measured.batches.length, 3);
  assert.deepEqual(measured.batches.map(batch => batch.seed), [101, 102, 103]);
  const totalSlots = measured.batches.reduce((sum, batch) => sum + batch.resultCount, 0);
  assert.equal(measured.repetition.repeatedSlotCount, totalSlots - measured.repetition.uniqueResultCount);
});

test('candidate and final result counts are reported without filling weak supply', () => {
  const report = runRecommendationQualityBaseline(catalog);
  for (const scenario of report.scenarios) {
    assert.equal(scenario.batches[0].resultCount, scenario.batches[0].ids.length);
    assert.ok(scenario.batches[0].resultCount <= Math.min(5, scenario.eligibleCandidateCount));
  }
  const sparse = report.scenarios.find(scenario => scenario.id === 'sparse-interest')!;
  assert.ok(sparse.batches[0].resultCount < 5);
});

test('Experience reports distinguish primary from secondary-only matches', () => {
  const scenario: RecommendationQualityScenario = {
    ...GOLDEN_RECOMMENDATION_SCENARIOS[0],
    interests: ['Kahve'],
    duration: 'Fark etmez',
  };
  const measured = analyzeRecommendationScenario(scenario, catalog);
  assert.ok(measured.batches[0].primaryInterestMatchCount > 0);
  assert.ok(measured.batches[0].secondaryOnlyInterestMatchCount > 0);
  assert.equal(
    measured.batches[0].primaryInterestMatchCount + measured.batches[0].secondaryOnlyInterestMatchCount,
    measured.batches[0].resultCount,
  );
});

test('cold start remains deterministic and returns an explained batch', () => {
  const scenario = GOLDEN_RECOMMENDATION_SCENARIOS.find(item => item.id === 'cold-start-no-interests')!;
  const measured = analyzeRecommendationScenario(scenario, catalog);
  assert.equal(measured.deterministicReplay, true);
  assert.equal(measured.batches[0].resultCount, 5);
  assert.equal(measured.batches[0].interestMatchCount, 0);
  assert.equal(measured.batches[0].resultsWithReasons, 5);
});

test('location-off replay uses no coordinates and reports changed slots without changing eligibility', () => {
  const scenario = GOLDEN_RECOMMENDATION_SCENARIOS.find(item => item.id === 'flexible-budget')!;
  const measured = analyzeRecommendationScenario(scenario, catalog);
  assert.ok(measured.locationOnOff);
  assert.deepEqual(measured.locationOnOff.locationOnIds, measured.batches[0].ids);
  assert.deepEqual(measured.locationOnOff.locationOffIds, [
    'bogazici-lokantasi',
    'mogan-parki',
    'federal-bilkent',
    'sulu-han',
    'beypazari-tarihi-carsi',
  ]);
  assert.notDeepEqual(measured.locationOnOff.locationOnIds, measured.locationOnOff.locationOffIds);
  assert.equal(measured.locationOnOff.changedSlotCount, 4);
  assert.equal(measured.locationOnOff.symmetricDifferenceCount, 6);
  assert.equal(measured.locationOnOff.eligibleCandidateCountDelta, 0);
  assert.equal(measured.invariantFailures.includes('location_changed_eligibility'), false);
});

test('location aggregate uses changed-slot and membership-difference terminology', () => {
  const report = runRecommendationQualityBaseline(catalog);
  assert.equal(report.summary.locationChangedSlotCount, 17);
  assert.equal(report.summary.locationSymmetricDifferenceCount, 14);
  assert.equal('locationChangedRankCount' in report.summary, false);
});

test('quality fixture preserves Idea 1+4 controlled discovery', () => {
  const scenario = GOLDEN_RECOMMENDATION_SCENARIOS.find(item => item.id === 'idea-controlled-discovery')!;
  const measured = analyzeRecommendationScenario(scenario, catalog);
  const resultIds = new Set(measured.batches[0].ids);
  const results = catalog.ideas.filter(idea => resultIds.has(idea.id));
  const matchesSelection = (idea: typeof results[number]) => scenario.interests.some(interest => idea.category === interest || idea.interests.includes(interest));
  assert.equal(results.filter(matchesSelection).length, 1);
  assert.equal(results.filter(idea => !matchesSelection(idea)).length, 4);
});
