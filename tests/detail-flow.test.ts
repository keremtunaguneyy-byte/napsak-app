import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { embeddedCatalog } from '../src/data/catalog';
import { contentInteractionReducer as reduce, exclusiveContentInteractions } from '../src/contentInteractions';
import { createDismissUndo, DETAIL_UNDO_MS, DETAIL_UNDO_EXIT_MS, detailExternalActions, detailNavigationReducer as nav, resolveDetail } from '../src/detailFlow';
import { deserializePreferences, emptyPreferences, loadPreferences, PREFERENCE_STORAGE_KEY, migratePreferences, savePreferences, serializePreferences } from '../src/persistence';
import { createRemoteUserState } from '../src/firebase/userRepository';
import { enqueueUserSync, flushUserSync, USER_SYNC_QUEUE_KEY } from '../src/firebase/userSync';
import { ArtworkResolver } from '../src/components/gezek/ArtworkResolver';
import { DETAIL_ASSET_XML } from '../src/components/gezek/detailAssetXml';

const catalog = embeddedCatalog('ankara');
const plan = catalog.experiences.find(item => item.id === 'xp-kugulu-segmenler')!;
const origin = { screen: 'results' as const, filter: 'experience' as const, seed: 17, scrollY: 430, focusKey: plan.id };

test('Home and Saved snapshots survive nested Plan → Place → Back, root Back and Close', () => {
  for (const screen of ['results', 'saved'] as const) {
    const root = nav(undefined, { type: 'open', origin: { ...origin, screen }, route: { kind: 'experience', id: plan.id } })!;
    const nested = nav(root, { type: 'push', route: { kind: 'place', id: plan.points[1].placeId }, scrollY: 315, focusKey: 'stop:1' })!;
    assert.equal(nested.history.at(-1)?.id, plan.points[1].placeId);
    assert.deepEqual(nested.origin, { ...origin, screen });
    const back = nav(nested, { type: 'back' })!;
    assert.equal(back.history.length, 1);
    assert.equal(back.history[0].id, plan.id);
    assert.equal(back.history[0].scrollY, 315);
    assert.equal(back.history[0].returnFocusKey, 'stop:1');
    assert.equal(nav(back, { type: 'back' }), undefined);
    assert.equal(nav(nested, { type: 'close' }), undefined);
    assert.deepEqual(root.origin, { ...origin, screen }, 'snapshot must not be mutated');
  }
});

test('exact IDs resolve even when titles collide, rank changes or item is dismissed; stops retain catalog order', () => {
  const sameTitle = catalog.experiences.map(item => ({ ...item, title: plan.title }));
  const resolved = resolveDetail({ kind: 'experience', id: plan.id }, sameTitle.reverse(), catalog.places)!;
  assert.equal(resolved.id, plan.id);
  assert.deepEqual('points' in resolved && resolved.points.map(point => point.placeId), plan.points.map(point => point.placeId));
  for (const point of plan.points) assert.equal(resolveDetail({ kind: 'place', id: point.placeId }, [], catalog.places)?.id, point.placeId);
  assert.equal(resolveDetail({ kind: 'experience', id: plan.title }, catalog.experiences, catalog.places), undefined);
  assert.equal(resolveDetail({ kind: 'experience', id: plan.id }, catalog.experiences, []), undefined);
  assert.equal(resolveDetail({ kind: 'place', id: 'missing-id' }, [], catalog.places), undefined);
});

test('atomic save/dismiss transitions reject saving a dismissed ID and restore to unsaved', () => {
  let state = reduce({ saved: [], dismissed: [] }, { type: 'toggleSave', id: plan.id });
  state = reduce(state, { type: 'dismiss', id: plan.id });
  assert.deepEqual(state, { saved: [], dismissed: [plan.id] });
  assert.equal(reduce(state, { type: 'toggleSave', id: plan.id }), state);
  state = reduce(state, { type: 'restore', id: plan.id });
  assert.deepEqual(state, { saved: [], dismissed: [] });
  assert.deepEqual(exclusiveContentInteractions({ saved: ['a', 'b', 'a'], dismissed: ['b', 'b'] }), { saved: ['a'], dismissed: ['b'] });
  for (let i = 0; i < 200; i++) {
    state = reduce(state, { type: (['toggleSave', 'dismiss', 'restore'] as const)[i % 3], id: String(i % 7) });
    assert.ok(!state.saved.some(id => state.dismissed.includes(id)));
  }
});

test('dismiss → local write/reload → remote queue keeps v5, chronology and existing allowlist', async () => {
  const data = new Map<string, string>();
  const storage = { getItem: async (key: string) => data.get(key) ?? null, setItem: async (key: string, value: string) => { data.set(key, value); }, removeItem: async (key: string) => { data.delete(key); } };
  const state = reduce({ saved: ['kept', plan.id], dismissed: [] }, { type: 'dismiss', id: plan.id });
  const preferences = { ...emptyPreferences, ...state };
  await savePreferences(preferences, storage);
  assert.deepEqual(await loadPreferences(storage), migratePreferences(preferences));
  assert.ok(data.has(PREFERENCE_STORAGE_KEY));
  const remote = createRemoteUserState(preferences);
  assert.deepEqual(remote.saved, ['kept']);
  assert.deepEqual(remote.dismissed, [plan.id]);
  await enqueueUserSync('test-owner', preferences, storage);
  const queue = JSON.parse(data.get(USER_SYNC_QUEUE_KEY)!);
  assert.equal(queue.ownerUid, 'test-owner');
  assert.deepEqual(queue.payload, remote);
  const writes: unknown[] = [];
  await flushUserSync('test-owner', { load: async () => undefined, save: async (uid, value) => { writes.push({ uid, value }); }, delete: async () => {} }, storage);
  assert.deepEqual(writes, [{ uid: 'test-owner', value: remote }]);
  assert.equal(data.has(USER_SYNC_QUEUE_KEY), false);
  const restored = { ...preferences, ...reduce(state, { type: 'restore', id: plan.id }) };
  assert.deepEqual(deserializePreferences(serializePreferences(restored)).saved, ['kept']);
  assert.deepEqual(deserializePreferences(serializePreferences({ ...preferences, saved: ['kept', plan.id] })).saved, ['kept']);
});

test('eight-second latest dismissal resets timer, consumes undo once, ignores stale expiry and clears on exit/unmount', () => {
  let now = 0;
  let sequence = 0;
  const pending = new Map<number, { deadline: number; callback: () => void }>();
  const notices: unknown[] = [], restored: string[] = [];
  const controller = createDismissUndo(n => notices.push(n), id => restored.push(id), (cb, ms) => {
    assert.ok(ms === DETAIL_UNDO_MS || ms === DETAIL_UNDO_EXIT_MS);
    pending.set(++sequence, { deadline: now + ms, callback: cb });
    return sequence as unknown as ReturnType<typeof setTimeout>;
  }, id => { pending.delete(id as unknown as number); });
  controller.dismiss('a');
  const stale = pending.get(1)!.callback;
  now = 7000;
  controller.dismiss('b');
  assert.equal(pending.size, 1);
  assert.equal(pending.get(2)?.deadline, 15000);
  stale();
  assert.deepEqual(notices.at(-1), { id: 'b', sequence: 2 });
  controller.undo(); controller.undo();
  assert.deepEqual(restored, ['b']);
  assert.equal(pending.size, 0);
  controller.dismiss('c'); const expire = pending.get(3)!.callback; pending.delete(3); expire();
  assert.deepEqual(notices.at(-1), { id: 'c', sequence: 3, exiting: true });
  controller.undo();
  assert.deepEqual(restored, ['b'], 'Undo is unavailable after exactly eight seconds');
  assert.equal(pending.get(4)?.deadline, now + DETAIL_UNDO_EXIT_MS);
  const staleExit = pending.get(4)!.callback;
  controller.dismiss('replacement');
  staleExit();
  assert.deepEqual(notices.at(-1), { id: 'replacement', sequence: 4 });
  controller.clear();
  assert.equal(notices.at(-1), undefined);
  assert.deepEqual(restored, ['b'], 'expiry must not undo persistence');
  controller.dismiss('d'); controller.clear(); controller.undo();
  assert.equal(pending.size, 0);
  assert.deepEqual(restored, ['b']);
});

test('Maps uses ordered coordinates, source is conditional and artwork ignores visible title', () => {
  const actions = detailExternalActions(plan);
  const url = new URL(actions.maps!);
  assert.equal(url.searchParams.get('origin'), `${plan.points[0].latitude},${plan.points[0].longitude}`);
  assert.equal(url.searchParams.get('destination'), `${plan.points.at(-1)!.latitude},${plan.points.at(-1)!.longitude}`);
  assert.equal(detailExternalActions({ ...plan, points: [], sources: [] }).maps, undefined);
  assert.equal(detailExternalActions({ ...plan, sources: [] }).source, undefined);
  const place = catalog.places[0];
  assert.equal(detailExternalActions({ ...place, latitude: NaN }).maps, undefined);
  assert.equal(detailExternalActions({ ...place, sourceUrl: '' }).source, undefined);
  assert.deepEqual(ArtworkResolver({ ...plan, title: 'unrelated' } as typeof plan, 'Hero'), ArtworkResolver(plan, 'Hero'));
});

test('actual host wires Android Back, modal focus, decorative artwork, wrapped content and measured footer clearance', () => {
  const host = readFileSync('src/components/gezek/DetailHost.tsx', 'utf8');
  assert.match(host, /onRequestClose=\{\(\) => p.onNavigate\(\{ type: 'back' \}\)\}/);
  assert.match(host, /accessibilityViewIsModal/);
  assert.match(host, /focusDetailControl/);
  assert.match(host, /frame.returnFocusKey/);
  assert.match(host, /accessibilityElementsHidden importantForAccessibility="no-hide-descendants"/);
  assert.match(host, /Math.max\(DETAIL_CONTENT_CLEARANCE, footerHeight \+ 16\)/);
  assert.match(host, /accessibilityState=\{\{ selected, busy, disabled \}\}/);
  assert.doesNotMatch(host, /numberOfLines|animationType="slide"/);
  const app = readFileSync('App.tsx', 'utf8');
  assert.match(app, /scrollTo\(\{ y: origin.scrollY, animated: false \}\)/);
  assert.match(app, /history.at\(-1\)\?\.id/);
});

test('detail controls retain local manifest hashes and intrinsic geometry', () => {
  const manifest = JSON.parse(readFileSync('assets/gezek/detail/manifest.json', 'utf8'));
  for (const [name, asset] of Object.entries(DETAIL_ASSET_XML)) {
    const raw = readFileSync(`assets/gezek/detail/svg/${name}.svg`);
    assert.ok(raw.length > 0);
    assert.equal(asset.xml, raw.toString());
    assert.equal(createHash('sha256').update(raw).digest('hex'), manifest.files[`${name}.svg`]);
    assert.ok(asset.width >= 20 && asset.width <= 24);
    assert.equal(asset.width, asset.height);
  }
});


test('revisiting Plan A truncates Plan–Place cycles and preserves the surviving scroll, focus and reasons', () => {
  const root = nav(undefined, { type: 'open', origin, route: { kind: 'experience', id: plan.id, reasons: ['original reason'] } })!;
  const nested = nav(root, { type: 'push', route: { kind: 'place', id: plan.points[0].placeId }, scrollY: 312, focusKey: 'stop:0' })!;
  const revisited = nav(nested, { type: 'push', route: { kind: 'experience', id: plan.id, reasons: ['new reason'] }, scrollY: 480, focusKey: 'related' })!;
  assert.deepEqual(revisited.history, [nested.history[0]]);
  assert.deepEqual(revisited.history[0], { kind: 'experience', id: plan.id, reasons: ['original reason'], scrollY: 312, returnFocusKey: 'stop:0' });
  assert.equal(nav(revisited, { type: 'back' }), undefined);
  assert.deepEqual(revisited.origin, origin);
  const distinct = nav(nested, { type: 'push', route: { kind: 'experience', id: 'plan-b' }, scrollY: 280, focusKey: 'plan:b' })!;
  assert.deepEqual(distinct.history.map(f => f.id), [plan.id, plan.points[0].placeId, 'plan-b']);
  const placeAgain = nav(distinct, { type: 'push', route: { kind: 'place', id: plan.points[0].placeId }, scrollY: 90, focusKey: 'stop:b' })!;
  assert.deepEqual(placeAgain.history, distinct.history.slice(0, 2));
  assert.equal(nav(distinct, { type: 'close' }), undefined);
  assert.deepEqual(nav(distinct, { type: 'push', route: distinct.history.at(-1)!, scrollY: 9, focusKey: 'same' })!.history, distinct.history);
});

test('Plan metadata never renders the stable Experience ID and bookmarks use approved tokens', () => {
  const host = readFileSync('src/components/gezek/DetailHost.tsx', 'utf8');
  assert.doesNotMatch(host, /\[plan\.id\]|>\{(?:plan|frame|item)\.id\}</);
  assert.match(host, /\{place && <View style=\{s.chips\}>/);
  assert.match(DETAIL_ASSET_XML.save.xml, /d="M6 3H16V19L11 15.5L6 19V3Z"/);
  assert.match(DETAIL_ASSET_XML.save.xml, /fill="none" stroke="#102452"/);
  assert.match(DETAIL_ASSET_XML.saved.xml, /fill="#3F65FC" stroke="#3F65FC"/);
  const manifest = JSON.parse(readFileSync('assets/gezek/detail/manifest.json', 'utf8'));
  assert.equal(manifest.userApprovedOverrides.save.figmaSynchronization, 'pending');
  assert.equal(manifest.userApprovedOverrides.saved.figmaSynchronization, 'pending');
});

test('native snackbar exit honors reduced motion and stops animations on replacement and unmount', () => {
  const component = readFileSync('src/components/gezek/UndoNoticeTransition.tsx', 'utf8');
  assert.match(component, /isReduceMotionEnabled/);
  assert.match(component, /reduceMotionChanged/);
  assert.match(component, /notice.exiting && reducedMotion\) return null/);
  assert.match(component, /duration: DETAIL_UNDO_EXIT_MS, useNativeDriver: true/);
  assert.match(component, /return \(\) => animation.stop\(\)/);
  assert.match(component, /notice.sequence, notice.exiting/);
  assert.match(component, /subscription.remove\(\)/);
});


test('expiry ends undo at 8000 ms and removes presentation 180 ms later without restoring', () => {
  let callback: (() => void) | undefined;
  let current: import('../src/detailFlow').UndoNotice | undefined;
  const durations: number[] = [];
  const restored: string[] = [];
  const controller = createDismissUndo(notice => { current = notice; }, id => restored.push(id), (cb, ms) => {
    callback = cb; durations.push(ms); return 1 as unknown as ReturnType<typeof setTimeout>;
  }, () => { callback = undefined; });
  controller.dismiss('a');
  callback!();
  assert.equal(current?.exiting, true);
  controller.undo();
  assert.deepEqual(restored, []);
  callback!();
  assert.equal(current, undefined);
  assert.deepEqual(durations, [8000, 180]);
  assert.deepEqual(restored, []);
});
