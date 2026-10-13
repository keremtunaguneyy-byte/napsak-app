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
import { KNOWN_DURATIONS, KNOWN_INTERESTS, type DurationPreference, type Experience } from '../src/types';
import { durationEligible, durationFitSignal, recommendAll, recommendExperiences } from '../src/recommendations';
import { isExperience, parseCatalogSnapshot } from '../src/data/catalogValidation';
import { validateFirestoreCatalogSnapshot } from '../src/firebase/firestoreContentRepository';

const catalog = embeddedCatalog('ankara');

const phaseOneNow = new Date('2026-10-13T12:00:00+03:00');
const durationMaximums: Record<DurationPreference, number> = {
  '30–60 dk': 60, '1–2 saat': 120, '3–4 saat': 240, 'Yarım gün': 360, 'Fark etmez': Infinity,
};
const phaseOneOptions = { ...catalog, interests: [], dismissed: [], now: phaseOneNow, seed: 11, limit: 100 };

// Independent oracle: check every attainable integer minute in an estimate.
// This does not import or duplicate the production duration predicate.
function durationOracle(min: number, max: number, available: number): boolean {
  for (let elapsed = min; elapsed <= max; elapsed += 1) {
    if (available - elapsed < 0) return false;
  }
  return true;
}

test('all 52 Experiences match the duration oracle through direct and public paths', () => {
  assert.equal(catalog.experiences.length, 52);
  const counts = [5, 26, 46, 52, 52];
  for (const [index, duration] of KNOWN_DURATIONS.entries()) {
    const expected = catalog.experiences.filter(item => durationOracle(item.minDurationMinutes, item.maxDurationMinutes, durationMaximums[duration]));
    for (const item of catalog.experiences) {
      assert.equal(durationEligible(item, duration), expected.includes(item), `${item.id}: ${duration}`);
    }
    const direct = recommendExperiences({ ...phaseOneOptions, duration });
    const publicResults = recommendAll({ ...phaseOneOptions, filter: 'experience', duration });
    assert.deepEqual(new Set(direct.map(item => item.id)), new Set(expected.map(item => item.id)));
    assert.deepEqual(publicResults, direct);
    assert.equal(direct.length, counts[index]);
  }
});

test('generated duration boundary matrix matches independent available-time oracle', () => {
  const boundaries = [29, 30, 60, 61, 119, 120, 121, 179, 180, 181, 239, 240, 241, 360, 361];
  let cases = 0;
  for (const min of boundaries) for (const max of boundaries.filter(value => value >= min)) for (const duration of KNOWN_DURATIONS) {
    const item = { ...catalog.experiences[0], minDurationMinutes: min, maxDurationMinutes: max };
    assert.equal(durationEligible(item, duration), durationOracle(min, max, durationMaximums[duration]), `${min}–${max}: ${duration}`);
    cases += 1;
  }
  assert.equal(cases, 600);
  for (const duration of KNOWN_DURATIONS.filter(value => value !== 'Fark etmez')) {
    const maximum = durationMaximums[duration];
    assert.equal(durationEligible({ ...catalog.experiences[0], minDurationMinutes: 30, maxDurationMinutes: maximum }, duration), true);
    assert.equal(durationEligible({ ...catalog.experiences[0], minDurationMinutes: 30, maxDurationMinutes: maximum + 1 }, duration), false);
  }
});

test('approved crossing ranges fit their maximum without optimistic minimum fallback', () => {
  const examples: [number, number, DurationPreference, boolean][] = [
    [45, 90, '1–2 saat', true], [45, 100, '1–2 saat', true], [120, 180, '1–2 saat', false],
    [150, 240, '3–4 saat', true], [120, 240, '3–4 saat', true], [180, 300, 'Yarım gün', true],
  ];
  for (const [min, max, duration, expected] of examples) {
    assert.equal(durationEligible({ ...catalog.experiences[0], minDurationMinutes: min, maxDurationMinutes: max }, duration), expected);
  }
});

test('duration fit is bounded at 16, targets the displayed midpoint and is absent when unrestricted', () => {
  const base = catalog.experiences[0];
  for (const [duration, midpoint] of [['30–60 dk', 45], ['1–2 saat', 90], ['3–4 saat', 210], ['Yarım gün', 300]] as const) {
    const point = (minutes: number) => ({ ...base, minDurationMinutes: minutes, maxDurationMinutes: minutes });
    assert.equal(durationFitSignal(point(midpoint), duration), 16);
    assert.equal(durationFitSignal(point(midpoint / 2), duration), 8);
    assert.equal(durationFitSignal(point(midpoint * 2), duration), 0);
    assert.equal(durationFitSignal(point(midpoint * 3), duration), 0);
  }
  for (const item of catalog.experiences) {
    for (const duration of KNOWN_DURATIONS) assert.ok(durationFitSignal(item, duration) >= 0 && durationFitSignal(item, duration) <= 16);
    assert.equal(durationFitSignal(item, 'Fark etmez'), 0);
    assert.equal(durationFitSignal(item), 0);
  }
  assert.deepEqual(recommendExperiences({ ...phaseOneOptions, duration: 'Fark etmez' }), recommendExperiences(phaseOneOptions));
});

test('better duration fit wins among equivalent plans across seeds; shorter fallback stays available', () => {
  const base = catalog.experiences[0];
  const short = { ...base, id: 'fit-short', minDurationMinutes: 30, maxDurationMinutes: 60 };
  const fitted = { ...base, id: 'fit-target', minDurationMinutes: 180, maxDurationMinutes: 240 };
  for (let seed = 0; seed < 32; seed += 1) {
    const options = { ...phaseOneOptions, experiences: [short, fitted], duration: '3–4 saat' as const, seed, limit: 5 };
    const result = recommendExperiences(options);
    assert.deepEqual(result.map(item => item.id), [fitted.id, short.id]);
    assert.deepEqual(result, recommendExperiences(options));
    assert.deepEqual(recommendAll({ ...options, filter: 'experience' }), result);
  }
  assert.deepEqual(recommendExperiences({ ...phaseOneOptions, experiences: [short], duration: 'Yarım gün', limit: 5 }).map(item => item.id), [short.id]);
});

test('primary-interest priority beats duration fit and higher secondary raw scores', () => {
  const base = catalog.experiences[0];
  const primary = { ...base, id: 'primary-short', category: 'Kahve' as const, primaryInterests: ['Kahve' as const], secondaryInterests: [], minDurationMinutes: 30, maxDurationMinutes: 60, editorialScore: 1, confidenceScore: .1 };
  const secondary = { ...base, id: 'secondary-fitted', primaryInterests: ['Sanat' as const], secondaryInterests: ['Kahve' as const], minDurationMinutes: 180, maxDurationMinutes: 240, editorialScore: 10, confidenceScore: 1 };
  const options = { ...phaseOneOptions, experiences: [secondary, primary], interests: ['Kahve' as const], duration: '3–4 saat' as const, limit: 2 };
  const result = recommendExperiences(options);
  assert.ok(result[1].score > result[0].score);
  assert.deepEqual(result.map(item => item.id), [primary.id, secondary.id]);
  assert.deepEqual(recommendAll({ ...options, filter: 'experience' }), result);
});

test('free is hard on every surface, including empty/partial and previous-batch fallback', () => {
  const freeCatalog = {
    places: [{ ...catalog.places[0], priceLevel: 0 as const }],
    experiences: [{ ...catalog.experiences[0], points: [{ ...catalog.experiences[0].points[0], placeId: catalog.places[0].id }], priceLevel: 0 as const }],
    ideas: [{ ...catalog.ideas[0], priceLevel: 0 as const }],
    events: [{ ...catalog.events[0], priceLevel: 0 as const }],
  };
  const paidCatalog = {
    places: freeCatalog.places.map(item => ({ ...item, priceLevel: 1 as const, note: 'Ücretsiz yazan prose fiyatı geçersiz kılamaz.' })),
    experiences: freeCatalog.experiences.map(item => ({ ...item, priceLevel: 1 as const })),
    ideas: freeCatalog.ideas.map(item => ({ ...item, priceLevel: 1 as const })),
    events: freeCatalog.events.map(item => ({ ...item, priceLevel: 1 as const })),
  };
  for (const filter of ['experience', 'place', 'event', 'idea', 'all'] as const) {
    assert.deepEqual(recommendAll({ ...phaseOneOptions, ...paidCatalog, filter, budget: 'Ücretsiz', limit: 5 }), []);
    const expanded = Object.fromEntries(Object.keys(freeCatalog).map(key => [key, [
      ...freeCatalog[key as keyof typeof freeCatalog],
      ...paidCatalog[key as keyof typeof paidCatalog].map(item => ({ ...item, id: `paid-${item.id}` })),
    ]])) as typeof freeCatalog;
    const previousBatch = Object.values(freeCatalog).flat().map(item => item.id);
    const options = { ...phaseOneOptions, ...expanded, filter, budget: 'Ücretsiz' as const, previousBatch, limit: 5 };
    const result = recommendAll(options);
    assert.equal(result.length, filter === 'all' ? 4 : 1);
    assert.ok(result.every(item => item.priceLevel === 0));
    assert.deepEqual(result, recommendAll(options));
  }
});

test('embedded free-budget supply remains paid-free across interests, duration, seeds and rotations', () => {
  const selections = Array.from({ length: 32 }, (_, mask) => KNOWN_INTERESTS.filter((_, bit) => mask & (1 << bit)));
  for (const filter of ['experience', 'place', 'event', 'idea', 'all'] as const) for (const interests of selections) for (const duration of KNOWN_DURATIONS) {
    const options = { ...phaseOneOptions, filter, interests, duration, budget: 'Ücretsiz' as const, mood: 'Sakin' as const, groupSize: '5+' as const, limit: 5 };
    const first = recommendAll(options);
    const second = recommendAll({ ...options, seed: 12, previousBatch: first.map(item => item.id) });
    assert.ok([...first, ...second].every(item => item.priceLevel === 0), `${filter}: ${interests}: ${duration}`);
    assert.deepEqual(first, recommendAll(options));
  }
});

test('budget explanations use exact structured prices on all scoring paths', () => {
  for (const budget of ['Ücretsiz', '₺', '₺₺', '₺₺₺', 'Fark etmez'] as const) {
    for (const filter of ['experience', 'place', 'event', 'idea', 'all'] as const) {
      const result = recommendAll({ ...phaseOneOptions, filter, budget });
      for (const item of result) for (const reason of item.reasons) {
        if (/ücretsiz/i.test(reason)) assert.equal(item.priceLevel, 0);
        if (reason.endsWith('bütçe seçiminle eşleşiyor')) assert.equal('₺'.repeat(item.priceLevel), budget);
        if (reason.endsWith('fiyat bandında')) assert.equal(reason, `${'₺'.repeat(item.priceLevel)} fiyat bandında`);
        assert.notEqual(reason, 'Ücretsiz bütçene yakın');
      }
    }
  }
});

test('Experience validation rejects non-finite, negative and inverted duration ranges', () => {
  const invalid = [[NaN, 60], [30, NaN], [Infinity, Infinity], [30, Infinity], [-Infinity, 60], [30, -Infinity], [-1, 60], [30, -1], [180, 60]];
  for (const [min, max] of invalid) {
    const item = { ...catalog.experiences[0], minDurationMinutes: min, maxDurationMinutes: max };
    assert.equal(isExperience(item), false, `${min}–${max}`);
    assert.equal(parseCatalogSnapshot({ ...catalog, experiences: [item] }), undefined);
  }
  assert.ok(parseCatalogSnapshot(catalog));
  // There is no global catalog upper cap or integer-only Experience contract.
  assert.ok(isExperience({ ...catalog.experiences[0], minDurationMinutes: 30.5, maxDurationMinutes: 59.5 }));
});

test('new time/free constraints preserve dismissals, dependencies, lifecycle and saved independence', () => {
  const base = { ...catalog.experiences[0], minDurationMinutes: 45, maxDurationMinutes: 90 };
  const event = { ...catalog.events[0], id: 'boundary-event', startsAt: phaseOneNow.toISOString() };
  const variants: Experience[] = [
    base,
    { ...base, id: 'dismissed-plan' },
    { ...base, id: 'unsupported', lifecycle: 'conditional', activation: { kind: 'unsupported' } },
    { ...base, id: 'started', lifecycle: 'event_linked', eventId: event.id },
    { ...base, id: 'missing-stop', points: [{ ...base.points[0], placeId: 'missing' }] },
    { ...base, id: 'paid-plan', priceLevel: 3 },
  ];
  const options = { ...phaseOneOptions, experiences: variants, events: [event], budget: 'Ücretsiz' as const, duration: '1–2 saat' as const, dismissed: ['dismissed-plan'] };
  assert.deepEqual(recommendExperiences(options).map(item => item.id), [base.id]);
  assert.deepEqual(recommendAll({ ...options, filter: 'experience' }), recommendExperiences(options));
  const withSavedMetadata = { ...options, saved: variants.map(item => item.id) };
  assert.deepEqual(recommendExperiences(withSavedMetadata), recommendExperiences(options));
  const withOtherSavedMetadata = { ...options, saved: ['unrelated'] };
  assert.deepEqual(recommendExperiences(withOtherSavedMetadata), recommendExperiences(options));
});

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
      { ...catalog.events[0], id: 'quality-expired-event', startsAt: '2026-09-13T00:00:00Z' },
      { ...catalog.events[0], id: 'quality-invalid-event', startsAt: 'not-a-date' },
    ],
  });
  assert.ok(measured.eventCatalog.expiredCount > 0);
  assert.equal(measured.eventCatalog.invalidStartCount, 1);
  assert.equal(measured.expiredOrInvalidEventLeakageCount, 0);
});

test('unsupported conditional and invalid Event-linked lifecycle entries never leak', () => {
  const base = catalog.experiences[0];
  const conditional = { ...base, id: 'quality-conditional', lifecycle: 'conditional', activation: { kind: 'unsupported' } } as Experience;
  const expiredEvent = { ...catalog.events[0], id: 'quality-expired-event', startsAt: '2026-09-13T00:00:00Z' };
  const activeEvent = { ...catalog.events[0], id: 'quality-active-event', startsAt: '2026-09-15T00:00:00Z' };
  const expired = { ...base, id: 'quality-expired-lifecycle', lifecycle: 'event_linked', eventId: expiredEvent.id } as Experience;
  const active = { ...base, id: 'quality-active-lifecycle', lifecycle: 'event_linked', eventId: activeEvent.id } as Experience;
  const missing = { ...base, id: 'quality-missing-event', lifecycle: 'event_linked', eventId: 'missing' } as Experience;
  const scenario: RecommendationQualityScenario = {
    id: 'lifecycle-fixture', label: 'Lifecycle fixture', purpose: 'Objective lifecycle characterization.',
    filter: 'experience', interests: [], seed: 1, now: new Date('2026-09-14T00:00:00Z'),
  };
  const fixtureCatalog: RecommendationQualityCatalog = { places: catalog.places, ideas: [], events: [expiredEvent, activeEvent], experiences: [conditional, expired, missing, active] };
  const measured = analyzeRecommendationScenario(scenario, fixtureCatalog);
  assert.deepEqual(measured.batches[0].ids, ['quality-active-lifecycle']);
  assert.equal(measured.invalidLifecycleLeakageCount, 0);
});

test('quality harness candidate counts reuse production Place dependency eligibility', () => {
  const base = catalog.experiences[0];
  const pointId = base.points[0].placeId;
  const fixtureCatalog: RecommendationQualityCatalog = {
    ...catalog,
    experiences: [base],
    places: catalog.places.map(place => place.id === pointId ? { ...place, status: 'deprecated' } : place),
  };
  const scenario: RecommendationQualityScenario = {
    id: 'ineligible-stop', label: 'Ineligible stop', purpose: 'Production predicate parity.',
    filter: 'experience', interests: [], seed: 1, now: new Date('2026-09-14T00:00:00Z'),
  };
  const measured = analyzeRecommendationScenario(scenario, fixtureCatalog);
  assert.equal(measured.eligibleCandidateCount, 0);
  assert.deepEqual(measured.batches[0].ids, []);
});

test('Firestore assembled snapshots use full catalog validation', () => {
  assert.deepEqual(validateFirestoreCatalogSnapshot(catalog), catalog);
  assert.throws(
    () => validateFirestoreCatalogSnapshot({ ...catalog, experiences: [{ ...catalog.experiences[0], points: [{ ...catalog.experiences[0].points[0], placeId: 'missing' }] }] }),
    /assembled snapshot validation/,
  );
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
  assert.equal(sparse.eligibleCandidateCount, 7);
  assert.equal(sparse.batches[0].primaryInterestMatchCount, 4);
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
    'urumci-uygur-restaurant-on-cebeci',
    'mogan-parki',
    'hamamonu',
    'lavare-sokak',
    'sulu-han',
  ]);
  assert.notDeepEqual(measured.locationOnOff.locationOnIds, measured.locationOnOff.locationOffIds);
  assert.equal(measured.locationOnOff.changedSlotCount, 4);
  assert.equal(measured.locationOnOff.symmetricDifferenceCount, 2);
  assert.equal(measured.locationOnOff.eligibleCandidateCountDelta, 0);
  assert.equal(measured.invariantFailures.includes('location_changed_eligibility'), false);
});

test('location aggregate uses changed-slot and membership-difference terminology', () => {
  const report = runRecommendationQualityBaseline(catalog);
  assert.equal(report.summary.locationChangedSlotCount, 14);
  assert.equal(report.summary.locationSymmetricDifferenceCount, 16);
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
