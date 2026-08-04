const test = require('node:test');
const assert = require('node:assert/strict');
const { distanceInKm, resolveSavedPlaces, toggleId, uniqueIds } = require('../.test-build/domain.js');
const { recommendPlaces } = require('../.test-build/recommendations.js');

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
const { KNOWN_INTERESTS, KNOWN_MOODS } = require('../.test-build/types.js');

test('catalog has at least 40 complete, uniquely identified Ankara entries', () => {
  assert.ok(places.length >= 40);
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
