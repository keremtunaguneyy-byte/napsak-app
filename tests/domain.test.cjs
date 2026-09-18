const test = require('node:test');
const assert = require('node:assert/strict');
const { dismissId, distanceInKm, formatDurationRange, newestFirstIds, resolveSavedPlaces, restoreId, toggleId, uniqueIds } = require('../.test-build/domain.js');
const { recommendAll, recommendExperiences, recommendExperiencesForPlace, recommendPlaces } = require('../.test-build/recommendations.js');
const {
  isExperiencePubliclyResolvable,
  isHardExcludedPlace,
  isPlaceRecommendationEligible,
  isPlacePubliclyResolvable,
  nextContentEligibilityChange,
  normalizeContentIdentity,
} = require('../.test-build/contentPolicy.js');
const { ANALYTICS_SCHEMA_VERSION, createProductAnalyticsEvent } = require('../.test-build/analyticsPolicy.js');
const { performanceDurationBucket, RECOMMENDATION_P95_BUDGET_MS } = require('../.test-build/performancePolicy.js');
const { googleMapsUrlForExperiencePoints } = require('../.test-build/mapLinks.js');
const {
  EVENT_MINIMUM_HORIZON_DAYS,
  EVENT_MINIMUM_UPCOMING_COUNT,
  EVENT_VERIFICATION_MAX_AGE_DAYS,
  analyzeEventCatalog,
} = require('../.test-build/eventOperations.js');
const { events: catalogEvents } = require('../.test-build/data/events.js');
const {
  assertFirestoreExportApply,
  assertFirestoreRestoreApply,
  buildFirestoreExportPlan,
  buildFirestoreRestorePlan,
  commandForDisplay,
} = require('../.test-build/backupOperations.js');

test('Firestore export plans are deterministic and scope the backup by project', () => {
  const plan = buildFirestoreExportPlan({
    projectId: 'napsak-production',
    bucketRoot: 'gs://napsak-backups',
    timestamp: new Date('2026-09-08T01:02:03.456Z'),
  });
  assert.equal(plan.storageUri, 'gs://napsak-backups/firestore/napsak-production/2026-09-08T01-02-03-456Z');
  assert.deepEqual(plan.args, [
    'firestore', 'export', plan.storageUri, '--project=napsak-production', '--database=(default)',
  ]);
  assert.match(commandForDisplay(plan), /napsak-production/);
});

test('Firestore export apply requires exact project and bucket confirmations', () => {
  const base = { projectId: 'napsak-production', bucketRoot: 'gs://napsak-backups' };
  assert.throws(() => assertFirestoreExportApply(base), /project_confirmation/);
  assert.throws(() => assertFirestoreExportApply({ ...base, confirmedProject: base.projectId }), /bucket_confirmation/);
  assert.doesNotThrow(() => assertFirestoreExportApply({
    ...base, confirmedProject: base.projectId, confirmedBucket: base.bucketRoot,
  }));
});

test('Firestore restore only targets a distinct recovery project', () => {
  const input = {
    sourceProjectId: 'napsak-production',
    targetProjectId: 'napsak-recovery',
    sourceUri: 'gs://napsak-backups/firestore/napsak-production/export-1',
    targetEnvironment: 'recovery',
  };
  const plan = buildFirestoreRestorePlan(input);
  assert.equal(plan.projectId, 'napsak-recovery');
  assert.equal(plan.args[1], 'import');
  assert.throws(() => buildFirestoreRestorePlan({ ...input, targetEnvironment: 'production' }), /recovery_environment/);
  assert.throws(() => buildFirestoreRestorePlan({ ...input, targetProjectId: input.sourceProjectId }), /must_differ/);
});

test('Firestore restore apply requires exact target and empty-target phrase', () => {
  const targetProjectId = 'napsak-recovery';
  assert.throws(() => assertFirestoreRestoreApply({ targetProjectId }), /target_confirmation/);
  assert.throws(() => assertFirestoreRestoreApply({
    targetProjectId, confirmedTarget: targetProjectId, confirmedEmptyTarget: 'yes',
  }), /empty_target_confirmation/);
  assert.doesNotThrow(() => assertFirestoreRestoreApply({
    targetProjectId,
    confirmedTarget: targetProjectId,
    confirmedEmptyTarget: `EMPTY_RECOVERY_TARGET_${targetProjectId}`,
  }));
});

test('Firestore backup plans reject unsafe identifiers and paths', () => {
  assert.throws(() => buildFirestoreExportPlan({
    projectId: 'BAD PROJECT', bucketRoot: 'gs://valid-backups', timestamp: new Date(),
  }), /invalid_project/);
  assert.throws(() => buildFirestoreExportPlan({
    projectId: 'napsak-production', bucketRoot: 'gs://bucket/path', timestamp: new Date(),
  }), /invalid_bucket/);
  assert.throws(() => buildFirestoreRestorePlan({
    sourceProjectId: 'napsak-production', targetProjectId: 'napsak-recovery',
    sourceUri: 'gs://bucket/../other', targetEnvironment: 'recovery',
  }), /invalid_export_source/);
});

const eventFixture = (overrides = {}) => ({
  id: 'event', kind: 'event', title: 'Etkinlik', venue: 'Mekân', cityId: 'ankara', city: 'Ankara',
  startsAt: '2026-09-15T20:00:00+03:00', category: 'Etkinlik', moods: ['Sosyal'], interests: ['Etkinlik'],
  priceLevel: 1, editorialScore: 4, note: 'Not', sourceUrl: 'https://example.com/event', sourceLabel: 'Kaynak',
  verifiedAt: '2026-09-07', groupSizes: ['2 kişi'], ...overrides,
});

test('current event catalog has a complete fresh batch and a safe horizon', () => {
  const health = analyzeEventCatalog(catalogEvents, new Date('2026-09-16T17:30:00+03:00'));
  assert.equal(health.healthy, true);
  assert.equal(health.upcomingCount, 12);
  assert.equal(health.expiredCount, 0);
  assert.ok(health.horizonDays >= EVENT_MINIMUM_HORIZON_DAYS);
  assert.deepEqual(health.issues, []);
});

test('event catalog health accepts exact count, horizon and verification boundaries', () => {
  const now = new Date('2026-09-14T00:00:00+03:00');
  const boundaryEvents = Array.from({ length: EVENT_MINIMUM_UPCOMING_COUNT }, (_, index) => eventFixture({
    id: `boundary-${index}`,
    startsAt: index === 0
      ? '2026-09-14T01:00:00+03:00'
      : `2026-09-${index === 4 ? '21' : '15'}T00:00:00+03:00`,
  }));
  const health = analyzeEventCatalog(boundaryEvents, now);
  assert.equal(EVENT_VERIFICATION_MAX_AGE_DAYS, 7);
  assert.equal(health.healthy, true);
  assert.equal(health.horizonDays, 7);
});

test('event catalog health reports depleted inventory, short horizon and stale sources', () => {
  const health = analyzeEventCatalog([
    eventFixture({ id: 'expired', startsAt: '2026-09-10T20:00:00+03:00' }),
    eventFixture({ id: 'last-one', startsAt: '2026-09-15T20:00:00+03:00' }),
  ], new Date('2026-09-15T08:00:00+03:00'));
  assert.equal(health.healthy, false);
  assert.equal(health.expiredCount, 1);
  assert.equal(health.upcomingCount, 1);
  assert.deepEqual(health.issues.map((issue) => issue.code), [
    'stale_verification',
    'insufficient_upcoming_events',
    'short_catalog_horizon',
  ]);
});

test('event catalog health fails closed for invalid and future dates', () => {
  const health = analyzeEventCatalog([
    eventFixture({ id: 'invalid-start', startsAt: 'not-a-date' }),
    eventFixture({ id: 'invalid-verification', verifiedAt: '2026-02-30' }),
    eventFixture({ id: 'future-verification', verifiedAt: '2026-09-08' }),
  ], new Date('2026-09-07T12:00:00+03:00'));
  assert.equal(health.healthy, false);
  assert.deepEqual(health.issues.map((issue) => issue.code), [
    'invalid_start',
    'invalid_verification',
    'future_verification',
    'insufficient_upcoming_events',
  ]);
});

test('distanceInKm returns zero for the same point', () => {
  assert.equal(distanceInKm({ latitude: 39.93, longitude: 32.85 }, { latitude: 39.93, longitude: 32.85 }), 0);
});

test('distanceInKm calculates a realistic Ankara distance', () => {
  const distance = distanceInKm(
    { latitude: 39.9208, longitude: 32.8541 },
    { latitude: 39.8985, longitude: 32.8633 },
  );
  assert.ok(distance > 2.5 && distance < 2.7);
});

test('formatDurationRange renders mixed hour/minute bounds naturally', () => {
  assert.equal(formatDurationRange(240, 330), '4 sa–5 sa 30 dk');
  assert.equal(formatDurationRange(45, 60), '45 dk–1 sa');
});

test('uniqueIds removes invalid and duplicate values', () => {
  assert.deepEqual(uniqueIds(['1', '1', 2, null, '3']), ['1', '3']);
  assert.deepEqual(uniqueIds(null), []);
});

test('resolveSavedPlaces preserves save order and ignores stale or duplicate ids', () => {
  const catalogue = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }];
  assert.deepEqual(resolveSavedPlaces(catalogue, ['b', 'missing', 'a', 'b']), [catalogue[1], catalogue[0]]);
  assert.deepEqual(resolveSavedPlaces(catalogue, []), []);
});

test('newestFirstIds presents the last saved item first without duplicates', () => {
  assert.deepEqual(newestFirstIds(['first', 'second', 'second', 'latest']), ['latest', 'second', 'first']);
  assert.deepEqual(newestFirstIds(undefined), []);
});

test('experience map links preserve ordered walking stops', () => {
  const url = new URL(googleMapsUrlForExperiencePoints([
    { placeId: 'start', name: 'Start', latitude: 39.91, longitude: 32.81 },
    { placeId: 'middle', name: 'Middle', latitude: 39.92, longitude: 32.82 },
    { placeId: 'finish', name: 'Finish', latitude: 39.93, longitude: 32.83 },
  ]));
  assert.equal(`${url.origin}${url.pathname}`, 'https://www.google.com/maps/dir/');
  assert.equal(url.searchParams.get('origin'), '39.91,32.81');
  assert.equal(url.searchParams.get('waypoints'), '39.92,32.82');
  assert.equal(url.searchParams.get('destination'), '39.93,32.83');
  assert.equal(url.searchParams.get('travelmode'), 'walking');
});

test('single-stop experience opens a map search and invalid coordinates fail closed', () => {
  const single = new URL(googleMapsUrlForExperiencePoints([
    { placeId: 'only', name: 'Only', latitude: 39.9, longitude: 32.8 },
  ]));
  assert.equal(`${single.origin}${single.pathname}`, 'https://www.google.com/maps/search/');
  assert.equal(single.searchParams.get('query'), '39.9,32.8');
  assert.equal(googleMapsUrlForExperiencePoints([]), undefined);
  assert.equal(googleMapsUrlForExperiencePoints([{ placeId: 'bad', name: 'Bad', latitude: 200, longitude: 32.8 }]), undefined);
});

test('toggleId adds and removes saved ids without carrying duplicate state forward', () => {
  assert.deepEqual(toggleId(['a', 'a'], 'b'), ['a', 'b']);
  assert.deepEqual(toggleId(['a', 'b', 'a'], 'a'), ['b']);
});

test('dismissId persists hidden places and restoreId supports undo', () => {
  assert.deepEqual(dismissId(['a', 'a'], 'b'), ['a', 'b']);
  assert.deepEqual(dismissId(['a'], 'a'), ['a']);
  assert.deepEqual(restoreId(['a', 'b', 'b'], 'b'), ['a']);
});

const fixture = (overrides) => ({
  id: 'place', name: 'Place', district: 'Çankaya', address: 'Adres', category: 'Doğa',
  moods: ['Sakin'], interests: ['Doğa'], priceLevel: 0, editorialScore: 4, note: 'Not', latitude: 39.9, longitude: 32.85,
  sourceUrl: 'https://example.com', verifiedAt: '2026-08-03', status: 'active', ...overrides,
});

test('Place eligibility status and hard exclusion are enforced before scoring', () => {
  const active = fixture({ id: 'active' });
  const deprecated = fixture({ id: 'deprecated', status: 'deprecated', editorialScore: 99 });
  const verificationRequired = fixture({ id: 'verification', status: 'verification_required', editorialScore: 99 });
  const forbidden = fixture({ id: 'yilmaz-guney-sahnesi', name: 'Unrelated display label', editorialScore: 99 });
  assert.equal(isPlaceRecommendationEligible(active), true);
  assert.equal(isPlaceRecommendationEligible(deprecated), false);
  assert.equal(isPlaceRecommendationEligible(verificationRequired), false);
  assert.equal(isPlaceRecommendationEligible(forbidden), false);
  assert.deepEqual(
    recommendPlaces({ places: [deprecated, verificationRequired, forbidden, active], interests: [], dismissed: [], limit: 10 }).map(item => item.id),
    ['active'],
  );
});

test('hard exclusion normalization matches canonical id and Turkish aliases', () => {
  assert.equal(normalizeContentIdentity('  YILMAZ—GÜNEY  Sahnesi '), 'yilmaz guney sahnesi');
  assert.equal(isHardExcludedPlace(fixture({ id: 'new-import-id', name: 'YILMAZ GÜNEY SAHNESİ' })), true);
  assert.equal(isHardExcludedPlace(fixture({ id: 'new-import-id', name: 'Başka Yer', aliases: ['Yilmaz Guney Tiyatro Sahnesi'] })), true);
});

test('eligibility clock schedules the nearest future Event boundary and ignores stale dates', () => {
  const now = new Date('2026-09-16T12:00:00.000Z');
  const next = nextContentEligibilityChange([
    eventFixture({ id: 'past', startsAt: '2026-09-16T11:59:59.000Z' }),
    eventFixture({ id: 'later', startsAt: '2026-09-16T14:00:00.000Z' }),
    eventFixture({ id: 'next', startsAt: '2026-09-16T13:00:00.000Z' }),
    eventFixture({ id: 'invalid', startsAt: 'not-a-date' }),
  ], now);
  assert.equal(next, Date.parse('2026-09-16T13:00:00.000Z'));
  assert.equal(nextContentEligibilityChange([], now), undefined);
});

test('unified feed inherits Place hard exclusion without changing direct ranking', () => {
  const forbidden = fixture({ id: 'imported-yilmaz', name: 'Yilmaz Guney Sahnesi', editorialScore: 99 });
  const active = fixture({ id: 'active', editorialScore: 1 });
  const result = recommendAll({ places: [forbidden, active], ideas: [], experiences: [], events: [], filter: 'place', interests: [], dismissed: [], limit: 10 });
  assert.deepEqual(result.map(item => item.id), ['active']);
});

test('deprecated Places remain saved-resolvable while hard-excluded Places do not publicly resolve', () => {
  const deprecated = fixture({ id: 'deprecated', status: 'deprecated' });
  const forbidden = fixture({ id: 'yilmaz-guney-sahnesi', name: 'Yılmaz Güney Sahnesi' });
  const publicPlaces = [deprecated, forbidden].filter(isPlacePubliclyResolvable);
  assert.deepEqual(resolveSavedPlaces(publicPlaces, [deprecated.id, forbidden.id]).map(item => item.id), ['deprecated']);
});

test('recommendPlaces prioritizes preference matches and explains the score', () => {
  const results = recommendPlaces({
    places: [fixture({ id: 'match' }), fixture({ id: 'popular', category: 'Sanat', moods: [], editorialScore: 5 })],
    mood: 'Sakin', interests: ['Doğa'], dismissed: [],
  });
  assert.equal(results[0].id, 'match');
  assert.deepEqual(results[0].reasons, ['Sakin moduna uygun', 'Doğa seçiminle eşleşiyor']);
});


test('explicit Lezzet selection excludes unrelated pure parks', () => {
  const results = recommendPlaces({
    places: [
      fixture({ id: 'park', category: 'Doğa', interests: ['Doğa'], editorialScore: 5 }),
      fixture({ id: 'food', category: 'Lezzet', interests: ['Lezzet'], editorialScore: 2 }),
    ],
    mood: 'Sakin', interests: ['Lezzet'], dismissed: [], random: () => 0,
  });
  assert.deepEqual(results.map(place => place.id), ['food']);
});

test('budget preference changes ranking without hard filtering', () => {
  const free = fixture({ id: 'free', category: 'Sanat', interests: ['Sanat'], priceLevel: 0, editorialScore: 4 });
  const premium = fixture({ id: 'premium', category: 'Sanat', interests: ['Sanat'], priceLevel: 3, editorialScore: 5 });
  const results = recommendPlaces({ places: [premium, free], interests: ['Sanat'], dismissed: [], budget: 'Ücretsiz', random: () => 0 });
  assert.equal(results[0].id, 'free');
  assert.ok(results.some(place => place.id === 'premium'));
});

test('group size preference changes ranking from safe metadata signals', () => {
  const solo = fixture({ id: 'solo', category: 'Kahve', interests: ['Kahve'], moods: ['Sakin'], editorialScore: 4 });
  const crowd = fixture({ id: 'crowd', category: 'Etkinlik', interests: ['Etkinlik'], moods: ['Sosyal'], editorialScore: 4 });
  assert.equal(recommendPlaces({ places: [crowd, solo], interests: [], dismissed: [], groupSize: 'Tek', random: () => 0 })[0].id, 'solo');
  assert.equal(recommendPlaces({ places: [solo, crowd], interests: [], dismissed: [], groupSize: '5+', random: () => 0 })[0].id, 'crowd');
});

test('recommendPlaces excludes dismissed places and uses live proximity', () => {
  const results = recommendPlaces({
    places: [fixture({ id: 'near' }), fixture({ id: 'far', latitude: 40.9 })],
    interests: [], dismissed: ['far'], coordinates: { latitude: 39.9, longitude: 32.85 },
  });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'near');
  assert.equal(results[0].distance, 0);
  assert.ok(results[0].reasons.includes('sana yakın'));
});

const { places } = require('../.test-build/data/places.js');
const { ideas } = require('../.test-build/data/ideas.js');
const { KNOWN_DURATIONS, KNOWN_INTERESTS, KNOWN_MOODS } = require('../.test-build/types.js');
const { events } = require('../.test-build/data/events.js');
const { experiences } = require('../.test-build/data/experiences.js');

test('related plans match stable stop and city IDs, never a matching display name', () => {
  const base = experiences[0];
  const place = { id: base.points[0].placeId, cityId: base.cityId };
  const wrongId = { ...base, id: 'wrong-id', points: base.points.map(p => ({ ...p, placeId: 'different-id' })) };
  const wrongCity = { ...base, id: 'wrong-city', cityId: 'other-city' };
  const result = recommendExperiencesForPlace(place, { experiences: [base, wrongId, wrongCity], places, events, interests: [], dismissed: [] });
  assert.deepEqual(result.map(x => x.id), [base.id]);
  assert.deepEqual(recommendExperiencesForPlace({ ...place, id: 'unknown' }, { experiences: [base], places, events, interests: [], dismissed: [] }), []);
});

test('related plans filter before limit and match a later stop without duplicating a plan', () => {
  const base = experiences[0];
  const targetPlace = { ...places[0], id: 'target' };
  const linked = { ...base, id: 'linked', editorialScore: 1, points: [base.points[0], { ...base.points[0], placeId: 'target' }, { ...base.points[0], placeId: 'target' }] };
  const unrelated = Array.from({ length: 8 }, (_, i) => ({ ...base, id: `popular-${i}`, editorialScore: 5 }));
  const result = recommendExperiencesForPlace(targetPlace, { experiences: [...unrelated, linked], places: [...places, targetPlace], events, interests: [], dismissed: [], limit: 1 });
  assert.deepEqual(result.map(x => x.id), ['linked']);
});

test('related plans preserve hiding, lifecycle, duration and interest eligibility', () => {
  const base = { ...experiences[0], primaryInterests: ['Doğa'], secondaryInterests: [], category: 'Doğa', minDurationMinutes: 30, maxDurationMinutes: 60 };
  const variants = [
    { ...base, id: 'eligible' },
    { ...base, id: 'hidden' },
    { ...base, id: 'conditional', lifecycle: 'conditional', activation: { kind: 'unsupported' } },
    { ...base, id: 'missing-event', lifecycle: 'event_linked', eventId: 'missing-event' },
    { ...base, id: 'too-long', minDurationMinutes: 120, maxDurationMinutes: 180 },
    { ...base, id: 'wrong-interest', primaryInterests: ['Kahve'], category: 'Kahve' },
  ];
  const result = recommendExperiencesForPlace({ id: base.points[0].placeId, cityId: base.cityId }, {
    experiences: variants, places, events, interests: ['Doğa'], dismissed: ['hidden'], duration: '30–60 dk', now: new Date('2026-09-06T00:00:00Z'),
  });
  assert.deepEqual(result.map(x => x.id), ['eligible']);
});

test('related plans preserve personalized ranking and reasons without mutating the catalogue', () => {
  const base = experiences[0];
  const options = { experiences: [base, { ...base, id: 'secondary', primaryInterests: ['Kahve'], secondaryInterests: ['Doğa'], editorialScore: 5 }], places, events, interests: ['Doğa'], dismissed: [], mood: 'Sakin', budget: 'Ücretsiz', groupSize: '2 kişi', seed: 27, now: new Date('2026-09-06T00:00:00Z') };
  const before = JSON.stringify(options);
  const place = { id: base.points[0].placeId, cityId: base.cityId };
  assert.deepEqual(recommendExperiencesForPlace(place, options), recommendExperiences(options));
  assert.equal(JSON.stringify(options), before);
});

test('related event-linked plans refresh at the linked Event boundary', () => {
  const base = experiences[0];
  const linkedEvent = { ...events[0], id: 'linked-event', startsAt: '2026-09-06T12:00:00Z' };
  const live = { ...base, lifecycle: 'event_linked', eventId: linkedEvent.id };
  const place = { id: base.points[0].placeId, cityId: base.cityId };
  const options = { experiences: [live], places, events: [linkedEvent], interests: [], dismissed: [] };
  assert.equal(recommendExperiencesForPlace(place, { ...options, now: new Date('2026-09-06T11:59:59Z') }).length, 1);
  assert.equal(recommendExperiencesForPlace(place, { ...options, now: new Date('2026-09-06T12:00:00Z') }).length, 0);
  assert.equal(recommendExperiencesForPlace(place, { ...options, experiences: [] }).length, 0);
});
const { guides } = require('../.test-build/data/guides.js');
const { insiderRoutes } = require('../.test-build/data/insiderRoutes.js');
const { cities } = require('../.test-build/data/cities.js');
const { CATALOG_CACHE_NAMESPACE_VERSION, CATALOG_SCHEMA_VERSION, catalogCacheKey, embeddedCatalog } = require('../.test-build/data/catalog.js');
const { parseCatalogSnapshot } = require('../.test-build/data/catalogValidation.js');
const { EmbeddedContentRepository } = require('../.test-build/data/contentRepository.js');
const { DEFAULT_RESULT_FILTER, RESULT_FILTERS } = require('../.test-build/resultFilters.js');

test('result tabs default to N’apsak and preserve the established content order', () => {
  assert.equal(DEFAULT_RESULT_FILTER, 'experience');
  assert.deepEqual(RESULT_FILTERS.map(filter => filter.value), ['experience', 'place', 'event', 'idea']);
  assert.ok(!RESULT_FILTERS.some(filter => filter.value === 'all' || filter.label === 'Hepsi'));
});

test('Ankara 101 contains 12 sourced, unique and city-scoped evergreen guides', () => {
  assert.equal(guides.length, 12);
  assert.equal(new Set(guides.map(guide => guide.id)).size, guides.length);
  for (const guide of guides) {
    assert.equal(guide.kind, 'guide');
    assert.equal(guide.cityId, 'ankara');
    assert.ok(guide.title && guide.summary && guide.category && guide.district && guide.sourceLabel);
    assert.ok(Array.isArray(guide.paragraphs) && guide.paragraphs.length >= 2);
    assert.ok(guide.readMinutes > 0);
    assert.equal(new URL(guide.sourceUrl).protocol, 'https:');
    assert.ok(Number.isFinite(Date.parse(guide.verifiedAt)));
  }
});

test('Bir Ankaralı Gibi routes are complete, ordered and map-ready', () => {
  assert.ok(insiderRoutes.length >= 1);
  for (const route of insiderRoutes) {
    assert.ok(route.id && route.title && route.intro && route.friendNote);
    assert.ok(route.stops.length >= 3);
    assert.equal(new Set(route.stops.map(stop => stop.name)).size, route.stops.length);
    assert.equal(new URL(route.mapUrl).hostname, 'www.google.com');
  }
});

test('experience catalogue contains 40 complete, sourced and honestly scoped plans', () => {
  assert.equal(experiences.length, 40);
  assert.equal(new Set(experiences.map(item => item.id)).size, experiences.length);
  for (const item of experiences) {
    assert.equal(item.kind, 'experience');
    assert.equal(item.lifecycle, 'evergreen');
    assert.equal(item.cityId, 'ankara');
    assert.ok(item.primaryInterests.length, `${item.id}: primary interests`);
    assert.ok(item.primaryInterests.includes(item.category), `${item.id}: category must be a primary interest`);
    assert.ok(item.primaryInterests.every(value => KNOWN_INTERESTS.includes(value)), `${item.id}: primary interests valid`);
    assert.ok(item.secondaryInterests.every(value => KNOWN_INTERESTS.includes(value)), `${item.id}: secondary interests valid`);
    assert.equal(item.primaryInterests.filter(value => item.secondaryInterests.includes(value)).length, 0, `${item.id}: interest tiers overlap`);
    assert.ok(item.points.length && item.sources.length, `${item.id}: points and sources`);
    assert.ok(item.minDurationMinutes >= 30 && item.maxDurationMinutes >= item.minDurationMinutes, `${item.id}: duration`);
    assert.ok(item.groupSizes.length, `${item.id}: group sizes`);
    assert.ok(item.availabilityNote.trim(), `${item.id}: availability note`);
    assert.ok(item.confidenceScore > 0 && item.confidenceScore <= 1, `${item.id}: confidence`);
    assert.ok(item.editorialScore > 0 && item.editorialScore <= 10, `${item.id}: editorial score`);
    assert.ok(Number.isFinite(Date.parse(item.lastVerifiedAt)), `${item.id}: verified date`);
    for (const source of item.sources) {
      assert.equal(new URL(source.url).protocol, 'https:', `${item.id}: source URL`);
      assert.ok(Number.isFinite(Date.parse(source.verifiedAt)), `${item.id}: source verification`);
    }
  }
});

test('evergreen content batch 1 preserves its approved single-anchor scope', () => {
  const approved = [
    ['xp-no29-kahve-tatli', 'no29-dukkan-coffee', 'Kahve', ['Lezzet'], 60, 120],
    ['xp-federal-bilkent-demleme', 'federal-bilkent', 'Kahve', ['Lezzet'], 45, 90],
    ['xp-duveroglu-lahmacun', 'duveroğlu', 'Lezzet', [], 60, 90],
    ['xp-trilye-balik', 'trilye', 'Lezzet', [], 120, 180],
    ['xp-anadolu-kronolojik', 'anadolu-medeniyetleri', 'Sanat', [], 120, 180],
    ['xp-hava-kuvvetleri-iki-saat', 'hava-kuvvetleri-muzesi', 'Sanat', ['Etkinlik'], 120, 180],
    ['xp-mavi-gol-sehirden-uzak', 'mavi-gol', 'Doğa', [], 150, 240],
    ['xp-altinpark-uzun-ogleden-sonra', 'altinpark', 'Doğa', [], 150, 240],
    ['xp-dikmen-vadisi-kot-yuruyusu', 'dikmen-vadisi', 'Doğa', [], 90, 150],
  ];
  for (const [id, placeId, primary, secondary, min, max] of approved) {
    const experience = experiences.find(item => item.id === id);
    assert.ok(experience, `${id}: missing`);
    assert.equal(experience.lifecycle, 'evergreen', `${id}: lifecycle`);
    assert.deepEqual(experience.points.map(point => point.placeId), [placeId], `${id}: single anchor`);
    assert.deepEqual(experience.primaryInterests, [primary], `${id}: primary interest`);
    assert.deepEqual(experience.secondaryInterests, secondary, `${id}: secondary interests`);
    assert.equal(experience.minDurationMinutes, min, `${id}: minimum duration`);
    assert.equal(experience.maxDurationMinutes, max, `${id}: maximum duration`);
  }
});

test('Ankara content batch 2 keeps only lifecycle-safe Experiences', () => {
  const approved = [
    ['xp-da-vinci-yeni-oyun', 'da-vinci-board-game-neorama', 120, 180, 'not-required'],
    ['xp-deniz-dunyasi-akvaryum', 'kecioren-deniz-dunyasi', 60, 90, 'not-required'],
    ['xp-tragos-tanitim-dersi', 'tragos-boulder-outdoor', 60, 60, 'required'],
  ];
  for (const [id, placeId, min, max, reservation] of approved) {
    const experience = experiences.find(item => item.id === id);
    assert.ok(experience, `${id}: missing`);
    assert.equal(experience.lifecycle, 'evergreen', `${id}: lifecycle`);
    assert.deepEqual(experience.points.map(point => point.placeId), [placeId], `${id}: single anchor`);
    assert.equal(experience.minDurationMinutes, min, `${id}: minimum duration`);
    assert.equal(experience.maxDurationMinutes, max, `${id}: maximum duration`);
    assert.equal(experience.reservation, reservation, `${id}: reservation`);
  }
  assert.equal(experiences.some(item => item.points.some(point => point.placeId === 'no24-studio-umitkoy')), false);
  assert.equal(experiences.some(item => item.points.some(point => point.placeId === 'golden-chef-mutfak-akademisi-cayyolu')), false);
});

test('Ankara content batch 3 keeps the approved Places and lifecycle-safe Experiences', () => {
  const expectedPlaces = [
    'ankara-palas-muzesi',
    'gokyay-vakfi-satranc-muzesi',
    'old-school-roastery-bahcelievler',
    'hanem-firin-eryaman',
    'bolu-akin-lokantasi-etlik',
    'urumci-uygur-restaurant-on-cebeci',
    'cin-ali-muzesi',
    'ka-cinnah',
  ];
  for (const id of expectedPlaces) {
    const place = places.find(item => item.id === id);
    assert.ok(place, `${id}: missing`);
    assert.equal(place.status, 'active', `${id}: status`);
    assert.equal(place.verifiedAt, '2026-09-18', `${id}: verifiedAt`);
    assert.ok(place.provenance?.some(item => item.kind === 'official'), `${id}: official provenance`);
    assert.ok(place.provenance?.some(item => item.kind === 'map_pin'), `${id}: map-pin provenance`);
  }

  const expectedExperiences = [
    ['xp-hanem-konya-sofrasi', ['hanem-firin-eryaman'], 45, 90],
    ['xp-bolu-akin-eski-garajlar-tencere', ['bolu-akin-lokantasi-etlik'], 45, 90],
    ['xp-urumci-on-cebeci-uygur-sofrasi', ['urumci-uygur-restaurant-on-cebeci'], 60, 100],
    ['xp-old-school-iki-demleme', ['old-school-roastery-bahcelievler'], 45, 100],
    ['xp-cin-ali-iki-kusak', ['cin-ali-muzesi'], 60, 120],
    ['xp-gokyay-satranc-taslari', ['gokyay-vakfi-satranc-muzesi'], 60, 120],
    ['xp-ankara-palas-ikinci-tbmm', ['cumhuriyet-muzesi', 'ankara-palas-muzesi'], 120, 180],
    ['xp-ka-fotograf-sergisini-yavas-oku', ['ka-cinnah'], 45, 90],
  ];
  for (const [id, pointIds, min, max] of expectedExperiences) {
    const experience = experiences.find(item => item.id === id);
    assert.ok(experience, `${id}: missing`);
    assert.equal(experience.lifecycle, 'evergreen', `${id}: lifecycle`);
    assert.deepEqual(experience.points.map(point => point.placeId), pointIds, `${id}: points`);
    assert.equal(experience.minDurationMinutes, min, `${id}: minimum duration`);
    assert.equal(experience.maxDurationMinutes, max, `${id}: maximum duration`);
  }

  const forbiddenFragments = ['evliyagil', 'runik', 'tulumtas', 'endemik-vadi'];
  assert.equal(places.some(place => forbiddenFragments.some(fragment => place.id.includes(fragment))), false);
  assert.equal(experiences.some(item => item.points.some(point => ['golden-chef-mutfak-akademisi-cayyolu', 'no24-studio-umitkoy'].includes(point.placeId))), false);
  assert.match(experiences.find(item => item.id === 'xp-old-school-iki-demleme').note, /resmî tadım ya da atölye ürünü değildir/);
  assert.match(experiences.find(item => item.id === 'xp-ka-fotograf-sergisini-yavas-oku').availabilityNote, /belirli sergi garanti edilmez/);
  assert.match(experiences.find(item => item.id === 'xp-cin-ali-iki-kusak').availabilityNote, /250\/300 TL/);
});

test('every experience produces a safe Google Maps action', () => {
  for (const experience of experiences) {
    const url = googleMapsUrlForExperiencePoints(experience.points);
    assert.ok(url, `${experience.id}: missing map URL`);
    assert.equal(new URL(url).origin, 'https://www.google.com', `${experience.id}: unexpected map host`);
    assert.equal(new URL(url).pathname, experience.points.length > 1 ? '/maps/dir/' : '/maps/search/');
  }
});

test('duration is a hard eligibility gate and Fark etmez leaves the catalogue open', () => {
  const common = { experiences, places, events, interests: [], dismissed: [], limit: 100, now: new Date('2026-08-08T00:00:00Z') };
  const short = recommendExperiences({ ...common, duration: '30–60 dk' });
  const oneToTwo = recommendExperiences({ ...common, duration: '1–2 saat' });
  const threeToFour = recommendExperiences({ ...common, duration: '3–4 saat' });
  const halfDay = recommendExperiences({ ...common, duration: 'Yarım gün' });
  const any = recommendExperiences({ ...common, duration: 'Fark etmez' });
  assert.ok(short.length && short.every(item => item.minDurationMinutes >= 30 && item.maxDurationMinutes <= 60));
  assert.ok(oneToTwo.length && oneToTwo.every(item => item.minDurationMinutes >= 60 && item.maxDurationMinutes <= 120));
  assert.ok(threeToFour.length && threeToFour.every(item => item.minDurationMinutes >= 180 && item.maxDurationMinutes <= 240));
  assert.ok(halfDay.length && halfDay.every(item => item.minDurationMinutes >= 240 && item.maxDurationMinutes <= 360));
  assert.equal(any.length, experiences.length);
});

test('unsupported conditional and invalid event-linked Experiences fail closed', () => {
  const base = experiences[0];
  const activeEvent = { ...events[0], id: 'active-event', startsAt: '2026-08-09T00:00:00Z' };
  const expiredEvent = { ...events[0], id: 'expired-event', startsAt: '2026-08-07T00:00:00Z' };
  const conditional = { ...base, id: 'conditional', lifecycle: 'conditional', activation: { kind: 'unsupported' } };
  const activeLinked = { ...base, id: 'active-linked', lifecycle: 'event_linked', eventId: activeEvent.id };
  const expiredLinked = { ...base, id: 'expired-linked', lifecycle: 'event_linked', eventId: expiredEvent.id };
  const missingLinked = { ...base, id: 'missing-linked', lifecycle: 'event_linked', eventId: 'missing' };
  const result = recommendExperiences({
    experiences: [conditional, expiredLinked, missingLinked, activeLinked], places, events: [activeEvent, expiredEvent],
    interests: [], dismissed: [], now: new Date('2026-08-08T00:00:00Z'),
  });
  assert.deepEqual(result.map(item => item.id), ['active-linked']);
});

test('Experience recommendations fail closed for missing, ineligible, or hard-excluded stops', () => {
  const base = experiences[0];
  const pointId = base.points[0].placeId;
  const activePoint = places.find(place => place.id === pointId);
  assert.ok(activePoint);
  const withoutPoint = places.filter(place => place.id !== pointId);
  const deprecatedPoint = { ...activePoint, status: 'deprecated' };
  const excludedPoint = { ...activePoint, name: 'Yılmaz Güney Sahnesi' };
  const common = { experiences: [base], events, interests: [], dismissed: [], limit: 10 };
  assert.deepEqual(recommendExperiences({ ...common, places: withoutPoint }), []);
  assert.deepEqual(recommendExperiences({ ...common, places: [...withoutPoint, deprecatedPoint] }), []);
  assert.deepEqual(recommendExperiences({ ...common, places: [...withoutPoint, excludedPoint] }), []);
  assert.deepEqual(recommendAll({ ...common, places: [...withoutPoint, deprecatedPoint], ideas: [], filter: 'experience' }), []);
  assert.deepEqual(recommendExperiencesForPlace(deprecatedPoint, { ...common, places: [...withoutPoint, deprecatedPoint] }), []);
  assert.equal(isExperiencePubliclyResolvable(base, new Map([...withoutPoint, excludedPoint].map(place => [place.id, place]))), false);
});

test('experience interest, dismissal and rotation gates stay intact', () => {
  const common = { experiences, places, events, mood: 'Meraklı', interests: [], dismissed: [], limit: 5, seed: 101, now: new Date('2026-08-08T00:00:00Z') };
  const first = recommendExperiences(common);
  const second = recommendExperiences({ ...common, seed: 102, previousBatch: first.map(item => item.id) });
  assert.equal(first.length, 5);
  assert.equal(second.length, 5);
  assert.equal(second.filter(item => first.some(previous => previous.id === item.id)).length, 0);
  const hidden = first[0].id;
  assert.ok(!recommendExperiences({ ...common, dismissed: [hidden], limit: 20 }).some(item => item.id === hidden));
  const coffee = recommendExperiences({ ...common, interests: ['Kahve'], limit: 20 });
  assert.ok(coffee.length);
  assert.ok(coffee.every(item => item.primaryInterests.includes('Kahve') || item.secondaryInterests.includes('Kahve')));
  const firstSecondaryIndex = coffee.findIndex(item => !item.primaryInterests.includes('Kahve'));
  assert.ok(firstSecondaryIndex > 0);
  assert.ok(coffee.slice(0, firstSecondaryIndex).every(item => item.primaryInterests.includes('Kahve')));
  assert.ok(coffee.slice(0, firstSecondaryIndex).every(item => item.reasons.includes('Kahve planın ana odağında')));
  assert.ok(coffee.slice(firstSecondaryIndex).every(item => item.reasons.includes('Kahve ikincil olarak eşleşiyor')));
});

test('each duration keeps at least one honest match for every explicit interest', () => {
  for (const duration of KNOWN_DURATIONS.filter(value => value !== 'Fark etmez')) {
    for (const interest of KNOWN_INTERESTS) {
      const result = recommendExperiences({ experiences, places, events, duration, interests: [interest], dismissed: [], limit: 20, now: new Date('2026-08-08T00:00:00Z') });
      assert.ok(result.length, `${duration} + ${interest} has no Experience`);
      assert.ok(result.every(item => item.primaryInterests.includes(interest) || item.secondaryInterests.includes(interest)), `${duration} + ${interest} leaked an unrelated Experience`);
    }
  }
});

test('verified event catalogue has explicit Ankara time zones and trustworthy metadata', () => {
  assert.ok(events.length >= 10);
  assert.equal(new Set(events.map(event => event.id)).size, events.length);
  const verifiedOn = new Date('2026-09-16T00:00:00+03:00');
  for (const event of events) {
    assert.equal(event.kind, 'event');
    assert.equal(event.cityId, 'ankara');
    assert.equal(event.city, 'Ankara');
    assert.match(event.startsAt, /[+-]\d\d:\d\d$/);
    assert.ok(Number.isFinite(Date.parse(event.startsAt)));
    assert.ok(Date.parse(event.startsAt) > verifiedOn.getTime(), `${event.id}: already expired when verified`);
    if (event.endsAt) {
      assert.match(event.endsAt, /[+-]\d\d:\d\d$/);
      assert.ok(Date.parse(event.endsAt) > Date.parse(event.startsAt), `${event.id}: invalid end time`);
    }
    assert.equal(new URL(event.sourceUrl).protocol, 'https:');
    assert.equal(event.verifiedAt, '2026-09-16');
    assert.ok(event.sourceLabel && event.note);
  }
});

test('event feed excludes expired events and admits future events regardless of general interests', () => {
  const now = new Date('2026-09-07T12:00:00+03:00');
  const expired = { ...events[0], id: 'expired', startsAt: '2026-09-06T22:00:00+03:00' };
  const result = recommendAll({ places: [], ideas: [], events: [expired, events[0]], filter: 'event', interests: ['Kahve'], dismissed: [], now });
  assert.deepEqual(result.map(item => item.id), [events[0].id]);
});

test('empty and fully expired event catalogues are safe', () => {
  const common = { places: [], ideas: [], filter: 'event', interests: [], dismissed: [], now: new Date('2027-01-01T00:00:00+03:00') };
  assert.deepEqual(recommendAll({ ...common, events: [] }), []);
  assert.deepEqual(recommendAll({ ...common, events }), []);
});

test('event rotation can produce two fresh five-item batches from the current catalogue', () => {
  const common = {
    places: [], ideas: [], events, filter: 'event', mood: 'Sosyal', interests: ['Kahve'],
    dismissed: [], limit: 5, now: new Date('2026-09-07T12:00:00+03:00'), seed: 60,
  };
  const first = recommendAll(common);
  const second = recommendAll({ ...common, seed: 61, previousBatch: first.map(item => item.id) });
  assert.equal(first.length, 5);
  assert.equal(second.length, 5);
  assert.equal(second.filter(item => first.some(previous => previous.id === item.id)).length, 0);
});

test('catalog has 120–170 complete, uniquely identified Ankara entries', () => {
  assert.ok(places.length >= 120 && places.length <= 170);
  assert.equal(new Set(places.map(place => place.id)).size, places.length);
  for (const place of places) {
    assert.equal(place.cityId, 'ankara', `${place.id}: city`);
    for (const field of ['id', 'name', 'district', 'address', 'note', 'sourceUrl', 'verifiedAt']) {
      assert.equal(typeof place[field], 'string', `${place.id}: ${field}`);
      assert.ok(place[field].trim(), `${place.id}: ${field} is required`);
    }
    assert.ok(place.editorialScore >= 0 && place.editorialScore <= 5, `${place.id}: editorialScore`);
    assert.ok([0, 1, 2, 3].includes(place.priceLevel), `${place.id}: priceLevel`);
    assert.ok(['active', 'deprecated', 'verification_required'].includes(place.status), `${place.id}: status`);
  }
  assert.equal(places.find(place => place.id === 'kronotrop-tunali').status, 'deprecated');
  assert.equal(places.find(place => place.id === 'ankara-sanat-tiyatrosu').status, 'deprecated');
  assert.equal(places.find(place => place.id === 'coffee-lab-bilkent').status, 'verification_required');
  const no29 = places.find(place => place.id === 'no29-dukkan-coffee');
  assert.equal(no29.status, 'active');
  assert.equal(no29.priceLevel, 2);
  assert.deepEqual(no29.interests, ['Kahve', 'Lezzet']);
  assert.equal(no29.verifiedAt, '2026-09-16');
});

test('Ankara content batch 2 removes Kartaltepe and preserves evidence boundaries', () => {
  assert.equal(places.some(place => place.id === 'macera-parki'), false);
  assert.deepEqual(resolveSavedPlaces(places, ['macera-parki']), []);
  const expected = [
    'da-vinci-board-game-neorama',
    'kecioren-deniz-dunyasi',
    'tragos-boulder-outdoor',
    'no24-studio-umitkoy',
    'golden-chef-mutfak-akademisi-cayyolu',
  ];
  for (const id of expected) {
    const place = places.find(item => item.id === id);
    assert.ok(place, `${id}: missing`);
    assert.equal(place.status, 'active', `${id}: status`);
    assert.equal(place.verifiedAt, '2026-09-18', `${id}: verifiedAt`);
    assert.ok(place.provenance?.some(item => item.kind === 'official'), `${id}: official provenance`);
    assert.ok(place.provenance?.some(item => item.kind === 'map_pin'), `${id}: map-pin provenance`);
  }
  assert.ok(places.find(item => item.id === 'da-vinci-board-game-neorama').provenance.some(item => item.kind === 'first_hand'));
  assert.ok(places.find(item => item.id === 'kecioren-deniz-dunyasi').provenance.some(item => item.kind === 'first_hand'));
});

test('every explicit interest has enough places for two fresh five-item batches', () => {
  for (const interest of KNOWN_INTERESTS) {
    const eligible = places.filter(place => place.category === interest || place.interests.includes(interest));
    assert.ok(eligible.length >= 10, `${interest}: expected at least 10 eligible places, found ${eligible.length}`);
  }
});

test('coffee place rotation can produce a completely fresh second batch', () => {
  const common = { places, ideas, filter: 'place', mood: 'Sakin', interests: ['Kahve'], dismissed: [], limit: 5, seed: 80 };
  const first = recommendAll(common);
  const second = recommendAll({ ...common, seed: 81, previousBatch: first.map(item => item.id) });
  assert.equal(first.length, 5);
  assert.equal(second.length, 5);
  assert.equal(second.filter(item => first.some(previous => previous.id === item.id)).length, 0);
});

test('catalog coordinates, official URL shapes, categories and tags are valid', () => {
  for (const place of places) {
    assert.ok(place.latitude >= 38 && place.latitude <= 41, `${place.id}: latitude`);
    assert.ok(place.longitude >= 30.5 && place.longitude <= 34.5, `${place.id}: longitude`);
    const url = new URL(place.sourceUrl);
    assert.equal(url.protocol, 'https:', `${place.id}: source URL must use HTTPS`);
    assert.ok(KNOWN_INTERESTS.includes(place.category), `${place.id}: category`);
    assert.ok(place.interests.length && place.interests.every(value => KNOWN_INTERESTS.includes(value)), `${place.id}: interests`);
    assert.ok(place.moods.length && place.moods.every(value => KNOWN_MOODS.includes(value)), `${place.id}: moods`);
  }
});

test('timeless idea catalog is curated, complete and uniquely identified', () => {
  assert.ok(ideas.length >= 40 && ideas.length <= 60);
  assert.equal(new Set(ideas.map(idea => idea.id)).size, ideas.length);
  for (const idea of ideas) {
    assert.equal(idea.kind, 'idea');
    assert.ok(idea.title.trim(), `${idea.id}: title`);
    assert.ok(idea.note.trim().length >= 40, `${idea.id}: note should explain the actual activity`);
    assert.ok(idea.actionLabel.trim(), `${idea.id}: action label`);
    assert.equal(new URL(idea.actionUrl).protocol, 'https:', `${idea.id}: action URL`);
    assert.ok(idea.editorialScore >= 0 && idea.editorialScore <= 10, `${idea.id}: editorialScore`);
    assert.ok(idea.groupSizes.length, `${idea.id}: group sizes`);
    assert.ok(KNOWN_INTERESTS.includes(idea.category), `${idea.id}: category`);
    assert.ok(idea.interests.length && idea.interests.every(value => KNOWN_INTERESTS.includes(value)), `${idea.id}: interests`);
    assert.ok(idea.moods.length && idea.moods.every(value => KNOWN_MOODS.includes(value)), `${idea.id}: moods`);
  }
});

test('embedded content repository preserves exact local catalogue parity', async () => {
  const repository = new EmbeddedContentRepository();
  const snapshot = await repository.getCatalog('ankara');
  assert.equal(snapshot.schemaVersion, CATALOG_SCHEMA_VERSION);
  assert.deepEqual(snapshot.cities.map(item => item.id), cities.map(item => item.id));
  assert.deepEqual(snapshot.places.map(item => item.id), places.map(item => item.id));
  assert.deepEqual(snapshot.experiences.map(item => item.id), experiences.map(item => item.id));
  assert.deepEqual(snapshot.events.map(item => item.id), events.map(item => item.id));
  assert.deepEqual(snapshot.ideas.map(item => item.id), ideas.map(item => item.id));
  assert.ok(parseCatalogSnapshot(snapshot));
});

test('runtime catalogue validation rejects malformed remote data', () => {
  const valid = embeddedCatalog('ankara');
  assert.ok(parseCatalogSnapshot(valid));
  assert.equal(CATALOG_SCHEMA_VERSION, 2);
  assert.equal(CATALOG_CACHE_NAMESPACE_VERSION, 2);
  assert.equal(catalogCacheKey('ankara'), '@napsak/catalog/v2/ankara');
  assert.notEqual(catalogCacheKey('ankara'), '@napsak/catalog/v1/ankara');
  assert.equal(parseCatalogSnapshot({ ...valid, schemaVersion: 1 }), undefined);
  assert.equal(parseCatalogSnapshot({ ...valid, schemaVersion: 999 }), undefined);
  assert.equal(parseCatalogSnapshot({ ...valid, places: [{ ...valid.places[0], sourceUrl: 'javascript:bad' }] }), undefined);
  assert.equal(parseCatalogSnapshot({ ...valid, places: [{ ...valid.places[0], provenance: [{ kind: 'official', label: 'Kaynak', note: 'Not', verifiedAt: '2026-09-18', url: 'javascript:bad' }] }] }), undefined);
  assert.equal(parseCatalogSnapshot({ ...valid, places: valid.places.map((place, index) => index ? place : { ...place, status: undefined }) }), undefined);
  assert.equal(parseCatalogSnapshot({ ...valid, experiences: [{ ...valid.experiences[0], cityId: 'istanbul' }] }), undefined);
  assert.equal(parseCatalogSnapshot({ ...valid, places: [] }), undefined);
  assert.equal(parseCatalogSnapshot({ ...valid, experiences: [{ ...valid.experiences[0], points: [{ ...valid.experiences[0].points[0], placeId: 'missing-place' }] }] }), undefined);
  const aliasImport = { ...valid.places[0], id: 'new-import', name: 'YILMAZ GÜNEY SAHNESİ' };
  assert.equal(parseCatalogSnapshot({ ...valid, places: [...valid.places, aliasImport] }), undefined);
  const hardExcludedExperience = {
    ...valid.experiences[0],
    points: [{ ...valid.experiences[0].points[0], placeId: 'yilmaz-guney-sahnesi' }],
  };
  assert.equal(parseCatalogSnapshot({ ...valid, experiences: [hardExcludedExperience] }), undefined);
  assert.equal(parseCatalogSnapshot({ ...valid, experiences: [{ ...valid.experiences[0], lifecycle: 'event_linked', eventId: 'missing-event' }] }), undefined);
  const publicIdCollision = { ...valid.places[0], id: valid.ideas[0].id };
  assert.equal(parseCatalogSnapshot({ ...valid, places: [...valid.places, publicIdCollision] }), undefined);
  const referencedId = valid.experiences[0].points[0].placeId;
  const deprecatedHistorical = {
    ...valid,
    places: valid.places.map(place => place.id === referencedId ? { ...place, status: 'deprecated' } : place),
  };
  assert.ok(parseCatalogSnapshot(deprecatedHistorical));
});

test('unified feed mixes places and ideas while preserving hard interest eligibility', () => {
  const mixed = recommendAll({ places, ideas, mood: 'Meraklı', interests: ['Sanat'], dismissed: [], limit: 5, seed: 31 });
  assert.equal(mixed.length, 5);
  assert.ok(mixed.some(item => item.kind === 'place'));
  assert.ok(mixed.some(item => item.kind === 'idea'));
  assert.ok(mixed.every(item => item.category === 'Sanat' || item.interests.includes('Sanat')));
});

test('content filters isolate place and idea feeds without fabricating events', () => {
  const common = { places, ideas, mood: 'Sosyal', interests: [], dismissed: [], limit: 5, seed: 12 };
  assert.ok(recommendAll({ ...common, filter: 'place' }).every(item => item.kind === 'place'));
  assert.ok(recommendAll({ ...common, filter: 'idea' }).every(item => item.kind === 'idea'));
  assert.deepEqual(recommendAll({ ...common, filter: 'event' }), []);
});

test('idea tab uses one selected-interest idea plus four independent discoveries', () => {
  const result = recommendAll({ places, ideas, filter: 'idea', mood: 'Enerjik', interests: ['Kahve'], dismissed: [], limit: 5, seed: 12 });
  const coffeeMatches = result.filter(item => item.category === 'Kahve' || item.interests.includes('Kahve'));
  const discoveries = result.filter(item => item.category !== 'Kahve' && !item.interests.includes('Kahve'));
  assert.equal(result.length, 5);
  assert.equal(coffeeMatches.length, 1);
  assert.equal(discoveries.length, 4);
  assert.ok(discoveries.every(item => item.reasons.includes('farklı bir şey keşfetmen için')));
});

test('idea discovery quota excludes every selected interest from the four discovery slots', () => {
  const selectedInterests = ['Kahve', 'Sanat'];
  const result = recommendAll({ places, ideas, filter: 'idea', mood: 'Meraklı', interests: selectedInterests, dismissed: [], limit: 5, seed: 19 });
  const matchesAnySelection = item => selectedInterests.some(interest => item.category === interest || item.interests.includes(interest));
  assert.equal(result.filter(matchesAnySelection).length, 1);
  assert.equal(result.filter(item => !matchesAnySelection(item)).length, 4);
});

test('place-only unified feed preserves PR #8 place ranking and diversity order', () => {
  const common = { places, mood: 'Sosyal', interests: [], dismissed: [], budget: '₺₺', groupSize: '3–4 kişi', limit: 5, seed: 12 };
  const legacy = recommendPlaces(common).map(item => item.id);
  const unified = recommendAll({ ...common, ideas, filter: 'place' }).map(item => item.id);
  assert.deepEqual(unified, legacy);
});

test('unified rotation avoids the previous mixed batch when enough candidates remain', () => {
  const options = { places, ideas, mood: 'Sakin', interests: [], dismissed: [], limit: 5, seed: 40 };
  const first = recommendAll(options);
  const second = recommendAll({ ...options, seed: 41, previousBatch: first.map(item => item.id) });
  assert.equal(second.filter(item => first.some(previous => previous.id === item.id)).length, 0);
});

test('dismissed idea ids stay out and idea-only recommendations are deterministic', () => {
  const first = recommendAll({ places, ideas, filter: 'idea', mood: 'Meraklı', interests: ['Etkinlik'], dismissed: [], limit: 5, seed: 22 });
  const repeated = recommendAll({ places, ideas, filter: 'idea', mood: 'Meraklı', interests: ['Etkinlik'], dismissed: [], limit: 5, seed: 22 });
  assert.deepEqual(first.map(item => item.id), repeated.map(item => item.id));
  const hidden = first[0].id;
  assert.ok(!recommendAll({ places, ideas, filter: 'idea', mood: 'Meraklı', interests: ['Etkinlik'], dismissed: [hidden], limit: 10, seed: 22 }).some(item => item.id === hidden));
});

test('different-things rotation produces a fresh idea batch', () => {
  const options = { places, ideas, filter: 'idea', mood: 'Sakin', interests: ['Kahve'], dismissed: [], limit: 5, seed: 50 };
  const first = recommendAll(options);
  const next = recommendAll({ ...options, seed: 51, previousBatch: first.map(item => item.id) });
  assert.equal(next.length, 5);
  assert.equal(next.filter(item => item.category === 'Kahve' || item.interests.includes('Kahve')).length, 1);
  assert.equal(next.filter(item => first.some(previous => previous.id === item.id)).length, 0);
});

test('recommendations are deterministic for a seed and injectable random source', () => {
  const options = { places, mood: 'Meraklı', interests: ['Sanat'], dismissed: [], limit: 8, seed: 17 };
  assert.deepEqual(recommendPlaces(options).map(place => place.id), recommendPlaces(options).map(place => place.id));
  const low = recommendPlaces({ ...options, random: () => 0 });
  const high = recommendPlaces({ ...options, random: () => 0.999 });
  assert.equal(low.length, high.length);
  assert.ok(low.every(place => Number.isFinite(place.score)));
});

test('recommendations preserve dismissals and promote category and district variety', () => {
  const dismissed = places.slice(0, 3).map(place => place.id);
  const results = recommendPlaces({ places, mood: 'Sosyal', interests: [], dismissed, limit: 10, seed: 3 });
  assert.ok(results.every(place => !dismissed.includes(place.id)));
  assert.ok(new Set(results.map(place => place.category)).size >= 3);
  assert.ok(new Set(results.map(place => place.district)).size >= 3);
  assert.deepEqual(recommendPlaces({ places, interests: [], dismissed: places.map(place => place.id) }), []);
});

test('rotation avoids the previous batch and safely falls back for a small pool', () => {
  const options = { places, mood: 'Meraklı', interests: ['Sanat'], dismissed: [], limit: 5, seed: 7 };
  const first = recommendPlaces(options);
  const second = recommendPlaces({ ...options, seed: 8, previousBatch: first.map(place => place.id) });
  assert.equal(second.filter(place => first.some(previous => previous.id === place.id)).length, 0);
  const small = places.filter(place => isPlaceRecommendationEligible(place) && place.interests.includes('Kahve')).slice(0, 3);
  assert.equal(recommendPlaces({ places: small, interests: ['Kahve'], dismissed: [], limit: 5, previousBatch: small.map(place => place.id) }).length, 3);
});


const { deserializePreferences, migratePreferences, serializePreferences, shouldRefreshContext } = require('../.test-build/persistence.js');
const { resolveFirebaseRuntimeSettings } = require('../.test-build/firebase/config.js');
const { runUserDataDeletion } = require('../.test-build/userDataDeletion.js');
const { isSafeScreenName, normalizeOperationalError, resolveObservabilitySettings, sanitizeObservabilityEvent } = require('../.test-build/observabilityPolicy.js');

test('migration reads legacy preference data while adding new optional fields safely', () => {
  assert.deepEqual(migratePreferences({ saved: ['a', 'a'], dismissed: ['b'], mood: 'Sakin', interests: ['Lezzet'], onboardingCompleted: true }), {
    saved: ['a'], dismissed: ['b'], mood: 'Sakin', interests: ['Lezzet'], budget: undefined, groupSize: undefined, duration: undefined, contextConfirmedAt: undefined, onboardingCompleted: true,
  });
  assert.deepEqual(migratePreferences({ budget: '₺₺', groupSize: '3–4 kişi', interests: ['Invalid'] }).budget, '₺₺');
  assert.equal(migratePreferences({ duration: '1–2 saat' }).duration, '1–2 saat');
  assert.equal(migratePreferences({ duration: 'Sonsuza kadar' }).duration, undefined);
});

test('duration survives the exact preference serialization round trip', () => {
  const preferences = migratePreferences({ mood: 'Sosyal', interests: ['Sanat'], duration: '3–4 saat', contextConfirmedAt: '2026-09-07T09:00:00.000Z', onboardingCompleted: true });
  assert.equal(deserializePreferences(serializePreferences(preferences)).duration, '3–4 saat');
  assert.equal(deserializePreferences(serializePreferences(preferences)).contextConfirmedAt, '2026-09-07T09:00:00.000Z');
  assert.deepEqual(deserializePreferences('{broken'), {
    saved: [], dismissed: [], interests: [], onboardingCompleted: false,
  });
});

test('context refresh is due after six hours, on a new day, or for legacy users', () => {
  assert.equal(shouldRefreshContext(undefined, new Date('2026-09-07T12:00:00Z')), true);
  assert.equal(shouldRefreshContext('2026-09-07T08:00:00Z', new Date('2026-09-07T13:59:59Z')), false);
  assert.equal(shouldRefreshContext('2026-09-07T08:00:00Z', new Date('2026-09-07T14:00:00Z')), true);
  const previousLocalDay = new Date(2026, 8, 6, 23, 30);
  const nextLocalDay = new Date(2026, 8, 7, 0, 10);
  assert.equal(shouldRefreshContext(previousLocalDay.toISOString(), nextLocalDay), true);
});

const completeFirebaseEnv = {
  EXPO_PUBLIC_FIREBASE_API_KEY: 'api-key-value',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'napsak-project.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'napsak-project',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:123:web:abc',
};

test('firebase config permits intentional local development and parses a complete dev setup', () => {
  assert.deepEqual(resolveFirebaseRuntimeSettings({}), { environment: 'development', mode: 'local' });
  assert.deepEqual(resolveFirebaseRuntimeSettings({
    ...completeFirebaseEnv,
    EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: '192.168.1.20:8080',
  }), {
    environment: 'development', mode: 'firebase',
    config: { apiKey: 'api-key-value', authDomain: 'napsak-project.firebaseapp.com', projectId: 'napsak-project', appId: '1:123:web:abc', storageBucket: undefined, messagingSenderId: undefined },
    emulator: { host: '192.168.1.20', port: 8080 },
  });
});

test('firebase config rejects partial, placeholder and invalid environment values', () => {
  assert.throws(() => resolveFirebaseRuntimeSettings({ EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'napsak-dev' }), /partial/i);
  assert.throws(() => resolveFirebaseRuntimeSettings({ EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: '127.0.0.1:8080' }), /requires a complete/i);
  assert.throws(() => resolveFirebaseRuntimeSettings({ ...completeFirebaseEnv, EXPO_PUBLIC_FIREBASE_API_KEY: 'replace-with-key' }), /placeholder/i);
  assert.throws(() => resolveFirebaseRuntimeSettings({ EXPO_PUBLIC_APP_ENV: 'staging' }), /development or production/i);
  assert.throws(() => resolveFirebaseRuntimeSettings({ ...completeFirebaseEnv, EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: 'localhost' }), /reachable-host:port/i);
});

test('production preflight requires real production Firebase config and forbids emulator wiring', () => {
  assert.throws(() => resolveFirebaseRuntimeSettings({ EXPO_PUBLIC_APP_ENV: 'production' }), /require a complete/i);
  assert.throws(() => resolveFirebaseRuntimeSettings({ ...completeFirebaseEnv, EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'napsak-dev' }), /development\/test/i);
  assert.throws(() => resolveFirebaseRuntimeSettings({ ...completeFirebaseEnv, EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: '127.0.0.1:8080' }), /cannot connect/i);
  const production = resolveFirebaseRuntimeSettings({ ...completeFirebaseEnv, EXPO_PUBLIC_APP_ENV: 'production' });
  assert.equal(production.mode, 'firebase');
  assert.equal(production.environment, 'production');
});

test('user data deletion runs remote, local and anonymous Auth steps in privacy-safe order', async () => {
  const order = [];
  const result = await runUserDataDeletion({
    deleteRemoteUserState: async () => { order.push('remote'); },
    clearLocalUserState: async () => { order.push('local'); },
    deleteAnonymousAccount: async () => { order.push('auth'); },
  });
  assert.deepEqual(order, ['remote', 'local', 'auth']);
  assert.deepEqual(result, { remoteUserStateDeleted: true, anonymousAccountDeleted: true, anonymousAccountDeletionFailed: false });
});

test('remote deletion failure preserves retryable local state and stops later steps', async () => {
  const order = [];
  await assert.rejects(runUserDataDeletion({
    deleteRemoteUserState: async () => { order.push('remote'); throw new Error('offline'); },
    clearLocalUserState: async () => { order.push('local'); },
    deleteAnonymousAccount: async () => { order.push('auth'); },
  }), /offline/);
  assert.deepEqual(order, ['remote']);
});

test('anonymous Auth deletion failure is reported after user state is cleared', async () => {
  const order = [];
  let reported;
  const result = await runUserDataDeletion({
    clearLocalUserState: async () => { order.push('local'); },
    deleteAnonymousAccount: async () => { order.push('auth'); throw new Error('requires recent login'); },
    onAnonymousAccountDeletionError: error => { reported = error; },
  });
  assert.deepEqual(order, ['local', 'auth']);
  assert.deepEqual(result, { remoteUserStateDeleted: false, anonymousAccountDeleted: false, anonymousAccountDeletionFailed: true });
  assert.match(reported.message, /recent login/);
});

test('observability stays disabled without a DSN and validates Sentry destinations', () => {
  assert.deepEqual(resolveObservabilitySettings({}), { environment: 'development', mode: 'disabled' });
  const dsn = 'https://publickey@o123.ingest.sentry.io/456';
  assert.deepEqual(resolveObservabilitySettings({ EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_SENTRY_DSN: dsn }), {
    environment: 'production', mode: 'sentry', dsn,
  });
  assert.throws(() => resolveObservabilitySettings({ EXPO_PUBLIC_SENTRY_DSN: 'replace-with-sentry-dsn' }), /non-placeholder/i);
  assert.throws(() => resolveObservabilitySettings({ EXPO_PUBLIC_SENTRY_DSN: 'https://key@tracking.example.com/123' }), /sentry.io/i);
});

test('observability strips personal and free-form fields before sending', () => {
  const event = sanitizeObservabilityEvent({
    user: { id: 'anonymous-uid' },
    request: { url: 'https://example.com/?location=secret' },
    breadcrumbs: [{ message: 'Kullanıcı tercihi' }],
    extra: { mood: 'Sakin' },
    message: 'raw message',
    transaction: 'private/path',
    fingerprint: ['private-value'],
    tags: { app_area: 'render', failure_code: 'react_render_failed', private_tag: 'secret' },
    exception: { values: [{ type: 'TypeError', value: 'user supplied text', stacktrace: { frames: [] } }] },
  });
  assert.equal(event.user, undefined);
  assert.equal(event.request, undefined);
  assert.equal(event.breadcrumbs, undefined);
  assert.equal(event.extra, undefined);
  assert.equal(event.message, undefined);
  assert.equal(event.transaction, undefined);
  assert.equal(event.fingerprint, undefined);
  assert.deepEqual(event.tags, { app_area: 'render', failure_code: 'react_render_failed' });
  assert.equal(event.exception.values[0].value, 'Application error');
});

test('operational errors keep useful stack frames without retaining raw messages', () => {
  const raw = new TypeError('uid=secret location=39.9');
  const normalized = normalizeOperationalError(raw, 'local_persistence', 'preference_save_failed');
  assert.equal(normalized.name, 'TypeError');
  assert.equal(normalized.message, 'local_persistence:preference_save_failed');
  assert.ok(!normalized.stack.includes('uid=secret'));
  assert.throws(() => normalizeOperationalError(raw, 'render', 'Not Safe'), /snake_case/i);
});

test('screen tags accept only stable non-personal identifiers', () => {
  assert.equal(isSafeScreenName('guides_insider'), true);
  assert.equal(isSafeScreenName('saved'), true);
  assert.equal(isSafeScreenName('user@example.com'), false);
  assert.equal(isSafeScreenName('39.9208,32.8541'), false);
});

test('product analytics accepts only versioned aggregate events', () => {
  assert.deepEqual(createProductAnalyticsEvent({
    name: 'recommendation_action',
    properties: { action: 'save', itemKind: 'place', rank: 2 },
  }), {
    name: 'recommendation_action',
    properties: { action: 'save', itemKind: 'place', rank: 2 },
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
  });
  assert.deepEqual(createProductAnalyticsEvent({
    name: 'location_permission_result', properties: { result: 'denied' },
  }).properties, { result: 'denied' });
  assert.deepEqual(createProductAnalyticsEvent({
    name: 'performance_sampled', properties: { metric: 'recommendation_compute', durationBucket: 'lt_10_ms' },
  }).properties, { metric: 'recommendation_compute', durationBucket: 'lt_10_ms' });
});

test('product analytics rejects personal, content-identifying and unknown fields', () => {
  for (const forbidden of [
    { name: 'screen_viewed', properties: { screen: 'results', userId: 'anonymous-uid' } },
    { name: 'preference_flow_completed', properties: { mode: 'onboarding', mood: 'Sakin' } },
    { name: 'recommendation_action', properties: { action: 'save', itemKind: 'place', itemId: 'secret-place' } },
    { name: 'location_permission_result', properties: { result: 'granted', coordinates: '39.9,32.8' } },
    { name: 'performance_sampled', properties: { metric: 'app_ready', durationBucket: '50_199_ms', durationMs: 75 } },
  ]) assert.throws(() => createProductAnalyticsEvent(forbidden), /forbidden property/i);
});

test('product analytics rejects invalid counts, ranks and enum values', () => {
  assert.throws(() => createProductAnalyticsEvent({ name: 'recommendation_batch_viewed', properties: { filter: 'all', count: 6, trigger: 'initial' } }), /invalid/i);
  assert.throws(() => createProductAnalyticsEvent({ name: 'recommendation_action', properties: { action: 'save', itemKind: 'place', rank: 0 } }), /invalid/i);
  assert.throws(() => createProductAnalyticsEvent({ name: 'screen_viewed', properties: { screen: 'profile' } }), /allowlisted/i);
  assert.throws(() => createProductAnalyticsEvent({ name: 'external_action', properties: { action: 'share', itemKind: 'place' } }), /invalid/i);
  assert.throws(() => createProductAnalyticsEvent({ name: 'performance_sampled', properties: { metric: 'location_lookup', durationBucket: 'lt_10_ms' } }), /invalid/i);
});

test('performance durations use coarse privacy-safe buckets', () => {
  assert.equal(performanceDurationBucket(0), 'lt_10_ms');
  assert.equal(performanceDurationBucket(10), '10_49_ms');
  assert.equal(performanceDurationBucket(50), '50_199_ms');
  assert.equal(performanceDurationBucket(200), '200_999_ms');
  assert.equal(performanceDurationBucket(1_000), 'gte_1000_ms');
  assert.equal(RECOMMENDATION_P95_BUDGET_MS, 25);
  assert.throws(() => performanceDurationBucket(-1), /invalid_duration/);
  assert.throws(() => performanceDurationBucket(Number.NaN), /invalid_duration/);
});
