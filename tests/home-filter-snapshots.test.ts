import test from 'node:test';
import assert from 'node:assert/strict';
import { embeddedCatalog } from '../src/data/catalog';
import { recommendAll } from '../src/recommendations';
import { contentInteractionReducer } from '../src/contentInteractions';
import { HOME_FILTERS, createHomeFilterRuns, createHomeSnapshotCache, homeCatalogKeys, homeDismissalKeys, homeSnapshotKey, invalidateHomeFilters, rotateHomeFilter } from '../src/homeFilterSnapshots';
import type { ResultFilter } from '../src/resultFilters';

const catalog = embeddedCatalog('ankara');
const now = new Date('2026-10-15T12:00:00+03:00');
const preferences = { interests: [], budget: 'Fark etmez' as const, mood: 'Sakin' as const, duration: 'Fark etmez' as const };
const catalogKeys = homeCatalogKeys(catalog);
const dismissKeys = homeDismissalKeys(catalog, []);
const prefs = JSON.stringify(preferences);

test('four first visits compute once; 20 warm cycles preserve exact batch objects, IDs and ordering', () => {
  const runs = createHomeFilterRuns(), cache = createHomeSnapshotCache<ReturnType<typeof recommendAll>>();
  const calls = Object.fromEntries(HOME_FILTERS.map(f => [f, 0]));
  const visit = (filter: ResultFilter) => {
    const key = homeSnapshotKey(filter, runs[filter], catalogKeys[filter], prefs, dismissKeys[filter], now);
    let value = cache.read(filter, key);
    if (!value) { calls[filter]++; value = recommendAll({ ...catalog, ...preferences, filter, dismissed: [], now, seed: runs[filter].run, previousBatch: runs[filter].previousBatch, limit: 5 }); cache.write(filter, key, value); }
    return value;
  };
  const first = Object.fromEntries(HOME_FILTERS.map(f => [f, visit(f)]));
  for (let cycle = 0; cycle < 20; cycle++) for (const filter of HOME_FILTERS) {
    assert.equal(visit(filter), first[filter]);
    assert.deepEqual(visit(filter).map(i => i.id), first[filter].map(i => i.id));
  }
  assert.deepEqual(calls, { experience: 1, place: 1, event: 1, idea: 1 });
});
test('explicit refresh advances only active seed and records that filter’s ordered previous batch', () => {
  const runs = createHomeFilterRuns();
  const refreshed = rotateHomeFilter(runs, 'place', ['p2', 'p1']);
  assert.deepEqual(refreshed.place, { run: 1, revision: 0, previousBatch: ['p2', 'p1'] });
  for (const filter of ['experience', 'event', 'idea'] as const) assert.equal(refreshed[filter], runs[filter]);
  assert.deepEqual(runs.place.previousBatch, []);
});
test('Preference Apply invalidates all four without rotating; Cancel leaves all keys valid', () => {
  const original = rotateHomeFilter(createHomeFilterRuns(), 'idea', ['original']);
  const cache = createHomeSnapshotCache<object>();
  const keys = (runs: typeof original) => HOME_FILTERS.map(f => homeSnapshotKey(f, runs[f], catalogKeys[f], prefs, dismissKeys[f], now));
  keys(original).forEach((key, index) => cache.write(HOME_FILTERS[index], key, { index }));
  // Cancel has no cache/run mutation; fields remain only in the editor reducer.
  keys(original).forEach((key, index) => assert.ok(cache.read(HOME_FILTERS[index], key)));
  const applied = invalidateHomeFilters(original);
  keys(applied).forEach((key, index) => assert.equal(cache.read(HOME_FILTERS[index], key), undefined));
  assert.equal(applied.idea.run, 1); assert.deepEqual(applied.idea.previousBatch, ['original']);
});
test('equivalent selected catalogs/fetchedAt do not invalidate; payload changes invalidate affected kinds', () => {
  const clone = structuredClone(catalog); clone.fetchedAt = '2030-01-01T00:00:00Z';
  assert.deepEqual(homeCatalogKeys(clone), catalogKeys);
  clone.events[0].note += ' reviewed';
  const changed = homeCatalogKeys(clone);
  assert.notEqual(changed.event, catalogKeys.event); assert.notEqual(changed.experience, catalogKeys.experience);
  assert.equal(changed.place, catalogKeys.place); assert.equal(changed.idea, catalogKeys.idea);
  clone.catalogVersion = '2026-10-15.1';
  for (const filter of HOME_FILTERS) assert.notEqual(homeCatalogKeys(clone)[filter], catalogKeys[filter]);
});
test('dismiss/Undo affect only the owning surface; restored content is unsaved', () => {
  const item = catalog.places[0];
  const initial = { saved: [item.id], dismissed: [] as string[] };
  const hidden = contentInteractionReducer(initial, { type: 'dismiss', id: item.id });
  const keys = homeDismissalKeys(catalog, hidden.dismissed);
  assert.notEqual(keys.place, dismissKeys.place);
  for (const filter of ['experience', 'event', 'idea'] as const) assert.equal(keys[filter], dismissKeys[filter]);
  const restored = contentInteractionReducer(hidden, { type: 'restore', id: item.id });
  assert.deepEqual(restored, { saved: [], dismissed: [] }); assert.deepEqual(homeDismissalKeys(catalog, restored.dismissed), dismissKeys);
});
test('Saved and location presentation are absent from snapshot identity', () => {
  const state = createHomeFilterRuns();
  const cache = createHomeSnapshotCache<object>();
  const key = homeSnapshotKey('place', state.place, catalogKeys.place, prefs, dismissKeys.place, now);
  const value = { ids: ['visible'], coordinatesAtAcquisition: undefined };
  cache.write('place', key, value);
  const saved = contentInteractionReducer({ saved: [], dismissed: [] }, { type: 'toggleSave', id: 'visible' });
  assert.deepEqual(saved.saved, ['visible']);
  assert.equal(cache.read('place', homeSnapshotKey('place', state.place, catalogKeys.place, prefs, homeDismissalKeys(catalog, saved.dismissed).place, now)), value);
});
test('known eligibility boundary invalidates Event/Experience only; Event retry invalidates Event only', () => {
  const runs = createHomeFilterRuns(), cache = createHomeSnapshotCache<object>();
  for (const filter of HOME_FILTERS) cache.write(filter, homeSnapshotKey(filter, runs[filter], catalogKeys[filter], prefs, dismissKeys[filter], now), {});
  const later = new Date(now.getTime() + 60_000);
  for (const filter of HOME_FILTERS) assert.equal(!!cache.read(filter, homeSnapshotKey(filter, runs[filter], catalogKeys[filter], prefs, dismissKeys[filter], later)), filter === 'place' || filter === 'idea');
  const retry = invalidateHomeFilters(runs, ['event']);
  for (const filter of HOME_FILTERS) assert.equal(!!cache.read(filter, homeSnapshotKey(filter, retry[filter], catalogKeys[filter], prefs, dismissKeys[filter], now)), filter !== 'event');
});
test('identical direct inputs retain deterministic scoring and output through cache and explicit rotation', () => {
  let runs = createHomeFilterRuns();
  const cache = createHomeSnapshotCache<ReturnType<typeof recommendAll>>();
  for (const filter of HOME_FILTERS) for (let refresh = 0; refresh < 3; refresh++) {
    const options = { ...catalog, ...preferences, filter, dismissed: [], now, seed: runs[filter].run, previousBatch: runs[filter].previousBatch, coordinates: { latitude: 39.92, longitude: 32.85 }, limit: 5 };
    const key = homeSnapshotKey(filter, runs[filter], catalogKeys[filter], prefs, dismissKeys[filter], now);
    const direct = recommendAll(options); cache.write(filter, key, recommendAll(options));
    assert.deepEqual(cache.read(filter, key), direct);
    assert.deepEqual(recommendAll(options), direct);
    runs = rotateHomeFilter(runs, filter, direct.map(item => item.id));
  }
});
