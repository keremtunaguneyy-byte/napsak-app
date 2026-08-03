const test = require('node:test');
const assert = require('node:assert/strict');
const { distanceInKm, uniqueIds } = require('../.test-build/domain.js');

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
