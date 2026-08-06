const test = require('node:test');
const assert = require('node:assert/strict');
const { dismissId, distanceInKm, resolveSavedPlaces, restoreId, toggleId, uniqueIds } = require('../.test-build/domain.js');
const { recommendAll, recommendPlaces } = require('../.test-build/recommendations.js');

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

test('uniqueIds removes invalid and duplicate values', () => {
  assert.deepEqual(uniqueIds(['1', '1', 2, null, '3']), ['1', '3']);
  assert.deepEqual(uniqueIds(null), []);
});

test('resolveSavedPlaces preserves save order and ignores stale or duplicate ids', () => {
  const catalogue = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }];
  assert.deepEqual(resolveSavedPlaces(catalogue, ['b', 'missing', 'a', 'b']), [catalogue[1], catalogue[0]]);
  assert.deepEqual(resolveSavedPlaces(catalogue, []), []);
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
  sourceUrl: 'https://example.com', verifiedAt: '2026-08-03', ...overrides,
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
const { KNOWN_INTERESTS, KNOWN_MOODS } = require('../.test-build/types.js');
const { events } = require('../.test-build/data/events.js');
const { DEFAULT_RESULT_FILTER, RESULT_FILTERS } = require('../.test-build/resultFilters.js');

test('result tabs omit the mixed feed and default to places', () => {
  assert.equal(DEFAULT_RESULT_FILTER, 'place');
  assert.deepEqual(RESULT_FILTERS.map(filter => filter.value), ['place', 'event', 'idea']);
  assert.ok(!RESULT_FILTERS.some(filter => filter.value === 'all' || filter.label === 'Hepsi'));
});

test('verified event catalogue has explicit Ankara time zones and trustworthy metadata', () => {
  assert.ok(events.length >= 10);
  assert.equal(new Set(events.map(event => event.id)).size, events.length);
  for (const event of events) {
    assert.equal(event.kind, 'event');
    assert.equal(event.city, 'Ankara');
    assert.match(event.startsAt, /[+-]\d\d:\d\d$/);
    assert.ok(Number.isFinite(Date.parse(event.startsAt)));
    assert.equal(new URL(event.sourceUrl).protocol, 'https:');
    assert.ok(event.sourceLabel && event.verifiedAt && event.note);
  }
});

test('event feed excludes expired events and admits future events regardless of general interests', () => {
  const now = new Date('2026-08-06T12:00:00+03:00');
  const expired = { ...events[0], id: 'expired', startsAt: '2026-08-05T22:00:00+03:00' };
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
    dismissed: [], limit: 5, now: new Date('2026-08-06T12:00:00+03:00'), seed: 60,
  };
  const first = recommendAll(common);
  const second = recommendAll({ ...common, seed: 61, previousBatch: first.map(item => item.id) });
  assert.equal(first.length, 5);
  assert.equal(second.length, 5);
  assert.equal(second.filter(item => first.some(previous => previous.id === item.id)).length, 0);
});

test('catalog has 120–150 complete, uniquely identified Ankara entries', () => {
  assert.ok(places.length >= 120 && places.length <= 150);
  assert.equal(new Set(places.map(place => place.id)).size, places.length);
  for (const place of places) {
    for (const field of ['id', 'name', 'district', 'address', 'note', 'sourceUrl', 'verifiedAt']) {
      assert.equal(typeof place[field], 'string', `${place.id}: ${field}`);
      assert.ok(place[field].trim(), `${place.id}: ${field} is required`);
    }
    assert.ok(place.editorialScore >= 0 && place.editorialScore <= 5, `${place.id}: editorialScore`);
    assert.ok([0, 1, 2, 3].includes(place.priceLevel), `${place.id}: priceLevel`);
  }
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
  const options = { places, ideas, filter: 'idea', mood: 'Sakin', interests: [], dismissed: [], limit: 5, seed: 50 };
  const first = recommendAll(options);
  const next = recommendAll({ ...options, seed: 51, previousBatch: first.map(item => item.id) });
  assert.equal(next.length, 5);
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
  const small = places.filter(place => place.interests.includes('Kahve')).slice(0, 3);
  assert.equal(recommendPlaces({ places: small, interests: ['Kahve'], dismissed: [], limit: 5, previousBatch: small.map(place => place.id) }).length, 3);
});


const { migratePreferences } = require('../.test-build/persistence.js');

test('migration reads legacy preference data while adding new optional fields safely', () => {
  assert.deepEqual(migratePreferences({ saved: ['a', 'a'], dismissed: ['b'], mood: 'Sakin', interests: ['Lezzet'], onboardingCompleted: true }), {
    saved: ['a'], dismissed: ['b'], mood: 'Sakin', interests: ['Lezzet'], budget: undefined, groupSize: undefined, onboardingCompleted: true,
  });
  assert.deepEqual(migratePreferences({ budget: '₺₺', groupSize: '3–4 kişi', interests: ['Invalid'] }).budget, '₺₺');
});
