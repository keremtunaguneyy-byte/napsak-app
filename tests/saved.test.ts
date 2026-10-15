import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { embeddedCatalog } from '../src/data/catalog';
import { insiderRoutes } from '../src/data/insiderRoutes';
import { CLASSICS_COLLECTION_ID } from '../src/ankara101';
import { contentInteractionReducer } from '../src/contentInteractions';
import { detailNavigationReducer, eventDetailTiming, resolveDetail } from '../src/detailFlow';
import { deserializePreferences, migratePreferences, serializePreferences } from '../src/persistence';
import { resolveSavedEntries, savedFocusAfterRemoval, savedPresentation } from '../src/saved';

const catalog = embeddedCatalog('ankara');
const items = [...catalog.experiences, ...catalog.places, ...catalog.events, ...catalog.ideas];
const ids = [catalog.experiences[0].id, catalog.places[0].id, catalog.events[0].id, catalog.ideas[0].id, catalog.guides[0].id, CLASSICS_COLLECTION_ID, insiderRoutes[0].id];
const resolve = (saved: string[]) => resolveSavedEntries(saved, items, catalog.guides, insiderRoutes);

test('all seven Saved shapes resolve in mixed newest-first order; unknown IDs are omitted', () => {
  const saved = [...ids, 'deleted-id'];
  const rows = resolve(saved);
  assert.deepEqual(rows.map(r => r.id), ids.slice().reverse());
  assert.deepEqual(rows.map(r => r.type), ['route', 'classics', 'guide', 'catalog', 'catalog', 'catalog', 'catalog']);
  assert.deepEqual(saved, [...ids, 'deleted-id']);
  assert.deepEqual(resolve(['deleted-id']), []);
});
test('remove/resave moves to top; dismiss removes saved and Restore is unsaved', () => {
  let state = { saved: [...ids], dismissed: [] as string[] };
  state = contentInteractionReducer(state, { type: 'toggleSave', id: ids[0] });
  state = contentInteractionReducer(state, { type: 'toggleSave', id: ids[0] });
  assert.equal(resolve(state.saved)[0].id, ids[0]);
  state = contentInteractionReducer(state, { type: 'dismiss', id: ids[0] });
  assert.ok(!state.saved.includes(ids[0]));
  assert.equal(contentInteractionReducer(state, { type: 'toggleSave', id: ids[0] }), state);
  state = contentInteractionReducer(state, { type: 'restore', id: ids[0] });
  assert.ok(!state.saved.includes(ids[0]) && !state.dismissed.includes(ids[0]));
});
test('last-item Unsave resolves Empty; next logical focus prefers next then previous', () => {
  assert.deepEqual(resolve(contentInteractionReducer({ saved: [ids[0]], dismissed: [] }, { type: 'toggleSave', id: ids[0] }).saved), []);
  assert.equal(savedFocusAfterRemoval(ids, ids[2]), ids[3]);
  assert.equal(savedFocusAfterRemoval(ids, ids.at(-1)!), ids.at(-2));
  assert.equal(savedFocusAfterRemoval([ids[0]], ids[0]), undefined);
});
test('Unsave survives existing serialization/restart with no schema addition', () => {
  const state = contentInteractionReducer({ saved: ids, dismissed: [] }, { type: 'toggleSave', id: ids[0] });
  const restarted = deserializePreferences(serializePreferences(migratePreferences({ ...state, interests: ['Doğa'], onboardingCompleted: true })));
  assert.deepEqual(restarted?.saved, ids.slice(1));
  assert.deepEqual(resolve(restarted!.saved).map(e => e.id), ids.slice(1).reverse());
});
test('Saved Event timing matches unavailable Detail while retaining the expired row and catalog metadata', () => {
  const event = catalog.events[0];
  const row = resolve([event.id])[0];
  const before = new Date(Date.parse(event.startsAt) - 1);
  const after = new Date(Date.parse(event.endsAt ?? event.startsAt) + 1);
  assert.equal(savedPresentation(row, before).kind, 'ETKİNLİK · YAKLAŞAN');
  assert.equal(savedPresentation(row, after).status, 'Başlangıç zamanı geçti');
  assert.equal(eventDetailTiming(event, after).expired, true);
  const ongoing = { ...event, endsAt: new Date(Date.parse(event.startsAt) + 3_600_000).toISOString() };
  assert.equal(savedPresentation({ type: 'catalog', id: event.id, item: ongoing }, new Date(Date.parse(event.startsAt) + 1)).kind, 'ETKİNLİK');
  assert.equal(resolveDetail({ kind: 'event', id: event.id }, catalog.experiences, catalog.places, catalog.events), event);
  assert.equal(resolve([event.id]).length, 1);
});
test('Saved presentation uses current catalog fields without title matching, reasons, or saved dates', () => {
  const rows = resolve(ids);
  for (const row of rows) assert.ok(savedPresentation(row).title);
  const plan = catalog.experiences[0];
  assert.match(savedPresentation(resolve([plan.id])[0]).metadata, new RegExp(`${plan.points.length} durak`));
  const guide = catalog.guides[0];
  assert.equal(savedPresentation(resolve([guide.id])[0]).title, guide.title);
  assert.equal(savedPresentation(resolve([CLASSICS_COLLECTION_ID])[0]).metadata, `${catalog.guides.length} bölüm`);
});
test('each recommendation kind preserves Saved origin through Back/Close; nested Place pops Plan', () => {
  for (const screen of ['saved', 'results'] as const) for (const kind of ['experience', 'place', 'event', 'idea'] as const) {
    const origin = { screen, filter: 'experience' as const, seed: 47, scrollY: 612, focusKey: `${kind}:exact-id` };
    const root = detailNavigationReducer(undefined, { type: 'open', origin, route: { kind, id: 'exact-id' } })!;
    const nested = detailNavigationReducer(root, { type: 'push', route: { kind: 'place', id: 'nested' }, scrollY: 280, focusKey: 'stop:1' })!;
    assert.deepEqual(nested.origin, origin);
    assert.equal(detailNavigationReducer(nested, { type: 'back' })?.history[0].id, 'exact-id');
    assert.equal(detailNavigationReducer(nested, { type: 'close' }), undefined);
    assert.equal(detailNavigationReducer(root, { type: 'back' }), undefined);
  }
});
test('Saved count removed from navigation contract and App; layout uses wrapping, independent actions and end clearance', () => {
  const app = readFileSync('App.tsx', 'utf8');
  const nav = readFileSync('src/components/gezek/GezekHome.tsx', 'utf8');
  const screen = readFileSync('src/components/gezek/SavedScreen.tsx', 'utf8');
  assert.doesNotMatch(app, /savedCount=|saved\.length/);
  assert.doesNotMatch(nav, /savedCount|\$\{.*\} kayıt/);
  assert.doesNotMatch(screen, /numberOfLines|saved\.length/);
  assert.match(screen, /event\.stopPropagation\(\)/);
  assert.match(screen, /paddingBottom: 24/);
  assert.match(screen, /fontScale >= 1\.3/);
});
