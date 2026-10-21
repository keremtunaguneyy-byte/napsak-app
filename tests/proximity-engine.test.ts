import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as engine from '../src/recommendations';
import { recommendationProximityScore } from '../src/recommendationProximity';
import { auditNow, catalog, defaultFingerprint, origins, parityOptions } from './helpers/proximityScenarios';
import type { Experience, Place } from '../src/types';

const base = { ...catalog, interests: [], dismissed: [], now: auditNow, seed: 37, limit: 1000 };
const ids = (items: { id: string }[]) => items.map(item => item.id);
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test('B2 is continuous at all approved distances and distinguishes 18 from 80 km by -124', () => {
  for (const kind of ['experience', 'place'] as const) {
    for (const [distance, expected] of [[0, 0], [2, -4], [5, -10], [8, -16], [11.2, -22.4], [18, -36], [30, -60], [80, -160]]) {
      assert.equal(recommendationProximityScore(kind, distance, 'nearby'), expected);
    }
    assert.equal(recommendationProximityScore(kind, 80, 'nearby') - recommendationProximityScore(kind, 18, 'nearby'), -124);
    for (const distance of [0, 2, 5, 8, 11.2, 18, 30, 80]) {
      const expected = Math.max(0, 14 - distance * (kind === 'place' ? 1.75 : 1.25));
      assert.equal(recommendationProximityScore(kind, distance), expected);
      assert.equal(recommendationProximityScore(kind, distance, 'default'), expected);
    }
  }
});

test('pure contribution returns finite locationless zero for absent or invalid distances', () => {
  for (const policy of ['default', 'nearby'] as const) for (const kind of ['place', 'experience'] as const) {
    for (const distance of [undefined, NaN, Infinity, -Infinity, -1]) assert.equal(recommendationProximityScore(kind, distance, policy), 0);
    assert.ok(Number.isFinite(recommendationProximityScore(kind, Number.MAX_VALUE, policy)));
  }
});

for (const policy of [undefined, 'default'] as const) {
  test(`${policy ?? 'omitted'} policy matches the pre-edit full JSON baseline across 1,920 cases / 28,800 calls`, () => {
    const { baselineCommit: _base, ...expected } = JSON.parse(readFileSync(new URL('../docs/evidence/proximity-engine-b2/default-baseline.json', import.meta.url), 'utf8'));
    assert.deepEqual(defaultFingerprint(engine, policy), expected);
  });
}

test('B2 replaces A and changes only raw proximity scores, with identical reasons/data per candidate', () => {
  for (const coordinates of origins) for (const kind of ['place', 'experience'] as const) {
    const run = kind === 'place' ? engine.recommendPlaces : engine.recommendExperiences;
    const a = run({ ...base, coordinates });
    const b = run({ ...base, coordinates, proximityPolicy: 'nearby' });
    assert.deepEqual(new Set(ids(a)), new Set(ids(b)));
    for (const item of b) {
      const original = a.find(candidate => candidate.id === item.id)!;
      const { score, ...rest } = item;
      const { score: originalScore, ...originalRest } = original;
      assert.deepEqual(rest, originalRest);
      close(score, originalScore - Math.max(0, 14 - item.distance! * (kind === 'place' ? 1.75 : 1.25)) - 2 * item.distance!);
    }
  }
});

test('public API forwards B2 for both spatial surfaces and mixed feed', () => {
  for (const filter of ['place', 'experience'] as const) {
    const options = { ...base, coordinates: origins[2], proximityPolicy: 'nearby' as const, limit: 5 };
    const direct = filter === 'place' ? engine.recommendPlaces(options).map(item => ({ ...item, kind: 'place' })) : engine.recommendExperiences(options);
    assert.deepEqual(engine.recommendAll({ ...options, filter }), direct);
    const mixed = engine.recommendAll({ ...options, filter: 'all', ideas: [], events: [], limit: 1000 });
    for (const item of mixed) {
      const source = item.kind === 'place' ? engine.recommendPlaces({ ...options, limit: 1000 }) : engine.recommendExperiences({ ...options, limit: 1000 });
      assert.equal(item.score, source.find(candidate => candidate.id === item.id)!.score);
    }
  }
});

test('locationless B2 equals locationless A; invalid origins safely follow that path', () => {
  const invalid = [undefined, { latitude: NaN, longitude: 32 }, { latitude: 39, longitude: Infinity },
    { latitude: 91, longitude: 32 }, { latitude: 39, longitude: -181 }];
  for (const filter of ['experience', 'place', 'all', 'event', 'idea'] as const) {
    const expected = engine.recommendAll({ ...base, filter });
    for (const coordinates of invalid) for (const proximityPolicy of ['default', 'nearby'] as const) {
      assert.deepEqual(engine.recommendAll({ ...base, filter, coordinates, proximityPolicy }), expected);
    }
  }
});

test('invalid candidate coordinates omit distance without removing candidates or producing invalid scores', () => {
  for (const invalid of [{ latitude: NaN, longitude: 32 }, { latitude: 39, longitude: Infinity }, { latitude: -91, longitude: 32 }, { latitude: 39, longitude: 181 }]) {
    const options = { ...base, places: [{ ...catalog.places[0], ...invalid }], experiences: [{ ...catalog.experiences[0], ...invalid }], coordinates: origins[0] };
    // Keep linked Place eligibility unchanged for the Experience case.
    for (const proximityPolicy of ['default', 'nearby'] as const) {
      const place = engine.recommendPlaces({ ...options, proximityPolicy });
      const experience = engine.recommendExperiences({ ...options, places: catalog.places, proximityPolicy });
      assert.equal(place.length, 1); assert.equal(experience.length, 1);
      for (const item of [...place, ...experience]) { assert.equal(item.distance, undefined); assert.ok(Number.isFinite(item.score)); }
    }
  }
});

test('Experience primary tier beats arbitrarily large distance penalties through direct and public paths', () => {
  const template = catalog.experiences[0];
  const primary: Experience = { ...template, id: 'primary-far', primaryInterests: ['Kahve'], secondaryInterests: [], latitude: 40.184, longitude: 31.351, editorialScore: 1, confidenceScore: .1 };
  const secondary: Experience = { ...template, id: 'secondary-near', primaryInterests: ['Sanat'], secondaryInterests: ['Kahve'], latitude: origins[0].latitude, longitude: origins[0].longitude };
  const options = { ...base, experiences: [secondary, primary], coordinates: origins[0], interests: ['Kahve' as const], proximityPolicy: 'nearby' as const, limit: 2 };
  const direct = engine.recommendExperiences(options);
  assert.deepEqual(ids(direct), ['primary-far', 'secondary-near']);
  assert.ok(direct[0].score < direct[1].score);
  assert.deepEqual(engine.recommendAll({ ...options, filter: 'experience' }), direct);
});

test('Place gains no primary-interest tier; a nearer secondary match can win', () => {
  const template = catalog.places[0];
  const primary: Place = { ...template, id: 'primary-far', category: 'Kahve', interests: [], latitude: 40.184, longitude: 31.351 };
  const secondary: Place = { ...template, latitude: origins[0].latitude, longitude: origins[0].longitude, id: 'secondary-near', category: 'Sanat', interests: ['Kahve'] };
  const options = { ...base, places: [primary, secondary], interests: ['Kahve' as const], coordinates: origins[0], proximityPolicy: 'nearby' as const, limit: 2 };
  assert.deepEqual(ids(engine.recommendPlaces(options)), ['secondary-near', 'primary-far']);
  assert.deepEqual(ids(engine.recommendAll({ ...options, filter: 'place' })), ['secondary-near', 'primary-far']);
});

test('B2 eligibility/finite scores/duplicates/free/duration and Event/Idea exact isolation across the broad matrix', () => {
  for (const options of parityOptions()) {
    const nearby = { ...options, proximityPolicy: 'nearby' as const, limit: 1000 };
    for (const run of [engine.recommendPlaces, engine.recommendExperiences]) {
      const a = run({ ...options, limit: 1000 });
      const b = run(nearby);
      assert.deepEqual(new Set(ids(a)), new Set(ids(b)));
      assert.equal(new Set(ids(b)).size, b.length);
      assert.ok(b.every(item => Number.isFinite(item.score)));
      if (options.budget === 'Ücretsiz') assert.ok(b.every(item => item.priceLevel === 0));
    }
    for (const filter of ['event', 'idea'] as const) {
      assert.deepEqual(engine.recommendAll({ ...nearby, filter }), engine.recommendAll({ ...options, filter, limit: 1000 }));
    }
  }
});

test('both policies preserve deterministic diversity and fresh-pool rotation, including fallback and empty supply', () => {
  for (const filter of ['place', 'experience'] as const) for (const proximityPolicy of ['default', 'nearby'] as const) {
    const options = { ...base, filter, proximityPolicy, coordinates: origins[0], limit: 5 };
    const first = engine.recommendAll(options);
    assert.deepEqual(engine.recommendAll(options), first);
    const secondOptions = { ...options, seed: 38, previousBatch: ids(first) };
    const second = engine.recommendAll(secondOptions);
    assert.deepEqual(engine.recommendAll(secondOptions), second);
    assert.ok(second.every(item => !ids(first).includes(item.id)));
    assert.equal(new Set(second.map(item => item.category)).size >= 2, true);
    const limitedCatalog = filter === 'place' ? { places: first as Place[] } : { experiences: first as Experience[] };
    assert.equal(engine.recommendAll({ ...secondOptions, ...limitedCatalog }).length, 5);
    assert.equal(engine.recommendAll({ ...options, dismissed: ids(engine.recommendAll({ ...options, limit: 1000 })) }).length, 0);
  }
});

test('small nearby pools keep far candidates, repeat fallback, and partial/empty behavior without paid leakage', () => {
  for (const filter of ['experience', 'place'] as const) {
    const options = { ...base, filter, coordinates: origins[0], proximityPolicy: 'nearby' as const, budget: 'Ücretsiz' as const, limit: 5 };
    const far = { latitude: origins[4].latitude + 1, longitude: origins[4].longitude };
    // Deliberately synthetic far fixture; not an audit origin or catalog edit.
    const selected = filter === 'place'
      ? { places: [{ ...catalog.places[0], ...far, priceLevel: 0 as const }] }
      : { experiences: [{ ...catalog.experiences[0], ...far, priceLevel: 0 as const }] };
    const first = engine.recommendAll({ ...options, ...selected });
    assert.equal(first.length, 1); assert.ok('distance' in first[0] && first[0].distance! > 30);
    assert.deepEqual(engine.recommendAll({ ...options, ...selected, previousBatch: ids(first) }), first);
    assert.deepEqual(engine.recommendAll({ ...options, ...selected, dismissed: ids(first) }), []);
  }
});

test('related-detail helper stays on A even if an options spread contains nearby', () => {
  for (const place of catalog.places) {
    const options = { ...base, coordinates: origins[0], proximityPolicy: 'nearby' as const };
    assert.deepEqual(engine.recommendExperiencesForPlace(place, options), engine.recommendExperiencesForPlace(place, { ...base, coordinates: origins[0] }));
  }
});
