const test = require('node:test');
const assert = require('node:assert/strict');
const { distanceInKm, uniqueIds } = require('../.test-build/domain.js');
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

const fixture = (overrides) => ({
  id: 'place', name: 'Place', district: 'Çankaya', address: 'Adres', category: 'Doğa',
  moods: ['Sakin'], editorialScore: 4, note: 'Not', latitude: 39.9, longitude: 32.85,
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
