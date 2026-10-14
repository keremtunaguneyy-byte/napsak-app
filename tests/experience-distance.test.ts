import { createLocationValidityMonitor, LOCATION_REVALIDATION_DEBOUNCE_MS } from '../src/locationValidity';
import { createRecommendationLocationResolver, RECOMMENDATION_LOCATION_TIMEOUT_MS } from '../src/recommendationLocation';
import { homeDisplayItems } from '../src/components/gezek/gezekHomePresentation';
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


const settled = () => new Promise<void>(resolve => setImmediate(resolve));
function validityFixture(overrides: Partial<Parameters<typeof createLocationValidityMonitor>[0]> = {}) {
  let nextTimer = 0, clears = 0, serviceCalls = 0, permissionCalls = 0;
  const timers = new Map<ReturnType<typeof setTimeout>, () => void>();
  const monitor = createLocationValidityMonitor({
    servicesEnabled: async () => { serviceCalls++; return true; },
    foregroundPermission: async () => { permissionCalls++; return { status: 'granted' }; },
    invalidateLocation: () => { clears++; },
    schedule: (cb, delay) => { assert.equal(delay, LOCATION_REVALIDATION_DEBOUNCE_MS); const timer = ++nextTimer as unknown as ReturnType<typeof setTimeout>; timers.set(timer, cb); return timer; },
    cancel: timer => { timers.delete(timer); }, ...overrides,
  });
  return { monitor, timers, counts: () => ({ clears, serviceCalls, permissionCalls }),
    flush: async () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(cb => cb()); await settled(); } };
}
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('read-only active/focus checks debounce a burst and preserve valid location', async () => {
  const f = validityFixture();
  f.monitor.pause(); f.monitor.resume(); f.monitor.resume(); f.monitor.resume();
  assert.equal(f.timers.size, 1);
  await f.flush();
  assert.deepEqual(f.counts(), { clears: 0, serviceCalls: 1, permissionCalls: 1 });
  f.monitor.dispose();
});
test('disabled services and revoked/undetermined permissions fail closed on return', async () => {
  for (const [services, status] of [[false, 'granted'], [true, 'denied'], [true, 'undetermined']] as const) {
    const f = validityFixture({ servicesEnabled: async () => services, foregroundPermission: async () => ({ status }) });
    f.monitor.pause(); f.monitor.resume(); await f.flush(); assert.equal(f.counts().clears, 1); f.monitor.dispose();
  }
});
test('either failed status read fails closed, including synchronous native errors', async () => {
  for (const failed of ['servicesEnabled', 'foregroundPermission'] as const) {
    const f = validityFixture({ [failed]: () => { throw new Error('Native status read failed'); } });
    f.monitor.resume(); await f.flush(); assert.equal(f.counts().clears, 1); f.monitor.dispose();
  }
});
test('a status check cannot clear an explicit location acquired after that check began', async () => {
  const oldServices = deferred<boolean>();
  const f = validityFixture({ servicesEnabled: () => oldServices.promise });
  f.monitor.resume(); await f.flush();
  f.monitor.locationChanged(); // Explicit request begins.
  f.monitor.locationChanged(); // A new valid GPS result commits.
  oldServices.resolve(false); await settled();
  assert.equal(f.counts().clears, 0); assert.equal(f.timers.size, 0); f.monitor.dispose();
});
test('duplicate in-flight signals share a single native check without a trailing duplicate', async () => {
  const services = deferred<boolean>(); let calls = 0;
  const f = validityFixture({ servicesEnabled: () => { calls++; return services.promise; } });
  f.monitor.resume(); await f.flush();
  for (let i = 0; i < 10; i++) f.monitor.resume();
  assert.equal(calls, 1); assert.equal(f.timers.size, 0);
  services.resolve(true); await settled();
  assert.equal(f.timers.size, 0); assert.equal(f.counts().clears, 0); f.monitor.dispose();
});
test('rapid departure/return ignores the old response and serializes the newest check', async () => {
  const first = deferred<boolean>(); let calls = 0;
  const f = validityFixture({ servicesEnabled: () => ++calls === 1 ? first.promise : Promise.resolve(true) });
  f.monitor.resume(); await f.flush();
  f.monitor.pause(); f.monitor.resume(); f.monitor.pause(); f.monitor.resume();
  assert.equal(calls, 1);
  first.resolve(false); await settled();
  assert.equal(f.counts().clears, 0); assert.equal(f.timers.size, 1);
  await f.flush(); assert.equal(calls, 2); assert.equal(f.counts().clears, 0); f.monitor.dispose();
});
test('one failed read cannot release the serial gate before the other native read settles', async () => {
  const first = deferred<boolean>(); let calls = 0;
  const f = validityFixture({ servicesEnabled: () => { calls++; return first.promise; }, foregroundPermission: async () => { throw new Error('Read failed'); } });
  f.monitor.resume(); await f.flush(); f.monitor.resume();
  assert.equal(f.counts().clears, 0); assert.equal(calls, 1);
  first.resolve(true); await settled(); assert.equal(f.counts().clears, 1); f.monitor.dispose();
});
test('pause cancels a scheduled check; unmount cancels timers and rejects late updates', async () => {
  const f = validityFixture(); f.monitor.resume(); f.monitor.pause(); await f.flush();
  assert.equal(f.counts().serviceCalls, 0); f.monitor.resume(); f.monitor.dispose(); await f.flush();
  assert.equal(f.counts().serviceCalls, 0);
  const pending = deferred<boolean>(); const g = validityFixture({ servicesEnabled: () => pending.promise });
  g.monitor.resume(); await g.flush(); g.monitor.dispose(); pending.resolve(false); await settled();
  assert.equal(g.counts().clears, 0); assert.equal(g.timers.size, 0);
});
test('Place presentation clears cached distance without changing the scored batch or its ordering', () => {
  const scored = recommendAll({ ...options, ideas: [], events: [], filter: 'place', coordinates, limit: 5 });
  const before = structuredClone(scored);
  const visible = homeDisplayItems(scored, coordinates);
  assert.ok(visible.every(item => item.kind === 'place' && item.distance !== undefined));
  const invalidated = homeDisplayItems(scored);
  assert.ok(invalidated.every(item => item.kind === 'place' && item.distance === undefined && !homeItemMeta(item).includes(' km')));
  assert.deepEqual(invalidated.map(item => [item.id, item.score, item.reasons]), before.map(item => [item.id, item.score, item.reasons]));
  assert.deepEqual(scored, before);
  assert.ok(homeDisplayItems(scored, { latitude: NaN, longitude: 32 }).every(item => item.kind === 'place' && item.distance === undefined));
});

function preflightFixture(overrides: Partial<Parameters<typeof createRecommendationLocationResolver>[0]> = {}) {
  let cached: typeof coordinates | undefined = coordinates;
  let clears = 0, services = 0, permissions = 0;
  const timers = new Map<ReturnType<typeof setTimeout>, () => void>();
  let nextTimer = 0;
  const resolver = createRecommendationLocationResolver({
    cachedLocation: () => cached,
    servicesEnabled: async () => { services++; return true; },
    foregroundPermission: async () => { permissions++; return { status: 'granted' }; },
    invalidateLocation: () => { clears++; cached = undefined; },
    schedule: (callback, delay) => {
      assert.equal(delay, RECOMMENDATION_LOCATION_TIMEOUT_MS);
      const id = ++nextTimer as unknown as ReturnType<typeof setTimeout>; timers.set(id, callback); return id;
    },
    cancel: id => { timers.delete(id); }, ...overrides,
  });
  return { resolver, timers, counts: () => ({ clears, services, permissions }),
    publish: (next?: typeof coordinates) => { resolver.locationChanged(); cached = next; } };
}
test('batch preflight skips native APIs/deadlines when there is no cached fix', async () => {
  const f = preflightFixture(); f.publish();
  assert.equal(await f.resolver.resolve(), undefined);
  assert.deepEqual(f.counts(), { clears: 0, services: 0, permissions: 0 }); assert.equal(f.timers.size, 0);
});
test('every successive located batch reads both services and permission again', async () => {
  const f = preflightFixture();
  for (let i = 0; i < 3; i++) assert.equal(await f.resolver.resolve(), coordinates);
  assert.deepEqual(f.counts(), { clears: 0, services: 3, permissions: 3 }); assert.equal(f.timers.size, 0);
});
test('batch preflight fails closed on disabled, denied, malformed and failed native reads', async () => {
  for (const override of [
    { servicesEnabled: async () => false },
    ...['denied', 'undetermined', ''].map(status => ({ foregroundPermission: async () => ({ status }) })),
    { foregroundPermission: async () => undefined as unknown as { status: string } },
    ...(['servicesEnabled', 'foregroundPermission'] as const).map(key => ({ [key]: () => { throw new Error('Native error'); } })),
  ]) {
    const f = preflightFixture(override);
    assert.equal(await f.resolver.resolve(), undefined); assert.equal(f.counts().clears, 1);
    assert.equal(f.resolver.cachedLocation(), undefined); assert.equal(f.timers.size, 0);
  }
});
test('hung services or permission hits one deadline, clears cache and ignores late success/rejection', async () => {
  for (const kind of ['servicesEnabled', 'foregroundPermission'] as const) {
    const held = deferred<never>(); const f = preflightFixture({ [kind]: () => held.promise });
    const pending = f.resolver.resolve(); await settled(); assert.equal(f.timers.size, 1);
    [...f.timers.values()][0](); assert.equal(await pending, undefined);
    assert.equal(f.counts().clears, 1); assert.equal(f.timers.size, 0);
    held.reject(new Error('Late native failure')); await settled();
    assert.equal(f.resolver.cachedLocation(), undefined); assert.equal(f.counts().clears, 1);
  }
});
test('concurrent batches share only the pending check and do not trust its result on a later action', async () => {
  const held = deferred<boolean>(); let reads = 0;
  const f = preflightFixture({ servicesEnabled: () => { reads++; return held.promise; } });
  const a = f.resolver.resolve(), b = f.resolver.resolve(); await settled();
  assert.equal(reads, 1); assert.equal(f.counts().permissions, 1); assert.equal(f.timers.size, 1);
  held.resolve(true); assert.equal(await a, coordinates); assert.equal(await b, coordinates);
  assert.equal(await f.resolver.resolve(), coordinates); assert.equal(reads, 2);
});
test('superseding/unmounting cancels the deadline and prevents old preflight clearing a newer fix', async () => {
  const held = deferred<boolean>(); const f = preflightFixture({ servicesEnabled: () => held.promise });
  const pending = f.resolver.resolve(); await settled();
  const newer = { latitude: 40, longitude: 33 }; f.publish(newer);
  assert.equal(await pending, undefined); assert.equal(f.timers.size, 0);
  held.resolve(false); await settled(); assert.equal(f.resolver.cachedLocation(), newer); assert.equal(f.counts().clears, 0);
  const next = f.resolver.resolve(); f.resolver.locationChanged();
  assert.equal(await next, undefined); assert.equal(f.counts().clears, 0); assert.equal(f.timers.size, 0);
});
test('status recovery alone cannot restore discarded location or proximity scores', async () => {
  let enabled = false;
  const f = preflightFixture({ servicesEnabled: async () => enabled });
  const safe = await f.resolver.resolve();
  assert.equal(safe, undefined);
  const locationless = recommendExperiences({ ...options, coordinates: safe });
  assert.deepEqual(locationless, recommendExperiences(options));
  enabled = true;
  assert.equal(await f.resolver.resolve(), undefined); assert.equal(f.counts().permissions, 1);
  f.publish(coordinates); assert.equal(await f.resolver.resolve(), coordinates);
});
