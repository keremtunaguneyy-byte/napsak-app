import test from 'node:test';
import assert from 'node:assert/strict';
import { auditExperienceStarts } from '../scripts/auditExperienceStartCoordinates';
import { experiences } from '../src/data/experiences';
import { places } from '../src/data/places';
import { distanceInKm, formatDistanceInKm } from '../src/domain';
import { experienceStartDistanceLabel } from '../src/experienceStartDistance';
import { createLocationRequestGuard } from '../src/locationRequestGuard';
import { recommendExperiences, recommendAll } from '../src/recommendations';
import { homeItemMeta } from '../src/components/gezek/gezekHomePresentation';

const options = { experiences, places, interests: [], dismissed: [], seed: 7, limit: 52, now: new Date('2026-10-14T12:00:00+03:00') };
const coordinates = { latitude: 39.9208, longitude: 32.8541 };

test('all 52 ordered starts resolve uniquely and pass the full coordinate audit', () => {
  const audit = auditExperienceStarts(experiences, places);
  assert.equal(audit.length, 52);
  assert.deepEqual(audit.filter(row => !row.pass), []);
  assert.ok(audit.every(row => row.distanceKm === 0 && row.firstStopId === row.firstPlaceId));
});
test('audit diagnoses mismatches, absent/ambiguous links, no stops and invalid coordinates', () => {
  const plan = experiences[0];
  const fixtures = [{ ...plan, latitude: plan.latitude + .01 }, { ...plan, points: [] },
    { ...plan, points: [plan.points[0], plan.points[0]] }, { ...plan, longitude: NaN }];
  assert.ok(auditExperienceStarts(fixtures, places).every(row => !row.pass));
  assert.match(auditExperienceStarts([plan], [places.find(p => p.id === plan.points[0].placeId)!].flatMap(p => [p, p]))[0].reason, /ambiguous/);
  assert.match(auditExperienceStarts([plan], [])[0].reason, /missing/);
});
test('one-decimal distance boundaries preserve Place formatting and use Turkish decimal for starts', () => {
  for (const [value, expected] of [[0, '0.0 km'], [.04, '0.0 km'], [.05, '0.1 km'], [.95, '0.9 km'],
    [1, '1.0 km'], [1.25, '1.3 km'], [3.4, '3.4 km'], [9.96, '10.0 km'], [125.64, '125.6 km']] as const) {
    assert.equal(formatDistanceInKm(value), expected);
    assert.equal(formatDistanceInKm(value, 'tr-TR'), expected.replace('.', ','));
  }
  for (const invalid of [NaN, Infinity, -Infinity, -1]) assert.equal(formatDistanceInKm(invalid), undefined);
});
test('distance targets only the first ordered point, ignoring route anchor and other stops', () => {
  const plan = { ...experiences[0], latitude: -60, longitude: -80,
    points: [{ placeId: 'first', name: 'first', ...coordinates }, { placeId: 'last', name: 'last', latitude: 41, longitude: 34 }] };
  assert.equal(experienceStartDistanceLabel(plan, coordinates), 'Başlangıca 0,0 km');
  const elsewhere = { latitude: 40, longitude: 33 };
  assert.equal(experienceStartDistanceLabel(plan, elsewhere), `Başlangıca ${formatDistanceInKm(distanceInKm(elsewhere, plan.points[0]), 'tr-TR')}`);
  assert.notEqual(experienceStartDistanceLabel(plan, elsewhere), `Başlangıca ${formatDistanceInKm(distanceInKm(elsewhere, plan.points[1]), 'tr-TR')}`);
});
test('unavailable and invalid user/start coordinates omit the label', () => {
  assert.equal(experienceStartDistanceLabel(experiences[0]), undefined);
  assert.equal(experienceStartDistanceLabel({ ...experiences[0], points: [] }, coordinates), undefined);
  for (const invalid of [{ latitude: NaN, longitude: 32 }, { latitude: 91, longitude: 32 },
    { latitude: 39, longitude: Infinity }, { latitude: 39, longitude: -181 }]) {
    assert.equal(experienceStartDistanceLabel(experiences[0], invalid), undefined);
    assert.equal(experienceStartDistanceLabel({ ...experiences[0], points: [{ ...experiences[0].points[0], ...invalid }] }, coordinates), undefined);
  }
});
test('display-only location cannot mutate the recommendation batch, seed or previous IDs', () => {
  const previousBatch = ['previous'];
  const batch = recommendExperiences({ ...options, previousBatch });
  const original = structuredClone(batch);
  assert.equal(experienceStartDistanceLabel(batch[0]), undefined);
  assert.match(experienceStartDistanceLabel(batch[0], coordinates)!, /^Başlangıca \d+,\d km$/);
  batch.forEach(item => experienceStartDistanceLabel(item, coordinates));
  assert.deepEqual(batch, original);
  assert.equal(options.seed, 7);
  assert.deepEqual(previousBatch, ['previous']);
});
test('existing Experience eligibility is location-independent but scoring and explanations consume it', () => {
  const absent = recommendExperiences(options);
  const located = recommendExperiences({ ...options, coordinates });
  assert.deepEqual(absent.map(p => p.id).sort(), located.map(p => p.id).sort());
  for (const item of located) {
    const before = absent.find(p => p.id === item.id)!;
    const distance = distanceInKm(coordinates, item);
    assert.equal(item.distance, distance);
    assert.ok(Math.abs(item.score - before.score - Math.max(0, 14 - distance * 1.25)) < 1e-10);
    assert.equal(item.reasons.includes('başlangıç noktası sana yakın'), distance < 5);
  }
  const all = recommendAll({ ...options, ideas: [], events: [], filter: 'experience', coordinates });
  assert.deepEqual(all.map(p => p.id), located.map(p => p.id));
  assert.notDeepEqual(absent.map(p => p.id), located.map(p => p.id));
});
test('existing Place numeric precision and Home output are unchanged', () => {
  const place = { ...places[0], kind: 'place' as const, score: 0, reasons: [], distance: 1.25 };
  assert.ok(homeItemMeta(place).includes('1.3 km'));
  assert.equal(formatDistanceInKm(1.25), `${place.distance.toFixed(1)} km`);
});
test('request generations reject superseded, obsolete and unmounted callbacks', async () => {
  const guard = createLocationRequestGuard();
  const writes: string[] = [];
  let release!: () => void;
  const first = guard.begin();
  const pending = new Promise<void>(resolve => { release = resolve; }).then(() => { if (guard.isCurrent(first)) writes.push('old'); });
  const current = guard.begin();
  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(current), true);
  release(); await pending;
  guard.invalidate();
  assert.equal(guard.isCurrent(current), false);
  assert.deepEqual(writes, []);
});
