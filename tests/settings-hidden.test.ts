import assert from 'node:assert/strict';
import test from 'node:test';
import { embeddedCatalog } from '../src/data/catalog';
import { resolveHiddenItems, hiddenPresentation, hiddenFocusAfterRemoval } from '../src/hiddenItems';
import { contentInteractionReducer } from '../src/contentInteractions';
import { managementBack, managementTab, ManagementSession } from '../src/managementNavigation';
import { createSettingsDeletion } from '../src/settingsDeletion';
import { SETTINGS_HIDDEN_COPY as T } from '../src/settingsHiddenCopy';
import { applyPreferenceEditor, preferenceEditorReducer, preferenceReturnFocus } from '../src/preferenceEditor';
import { emptyPreferences, savePreferences, loadPreferences, PreferenceStorage } from '../src/persistence';
import { createHomeFilterRuns, createHomeSnapshotCache, homeSnapshotSlot, homeSnapshotKey, homeDismissalKeys, homeCatalogKeys, HOME_FILTERS } from '../src/homeFilterSnapshots';
import type { UserDataDeletionResult } from '../src/userDataDeletion';

const catalog = embeddedCatalog();
const items = [...catalog.experiences, ...catalog.places, ...catalog.events, ...catalog.ideas];
const ids = ['xp-kugulu-segmenler', 'erimtan', 'event-cso-iki-keman-bir-miras-2026-10-16', 'idea-stromae-racine-carree'];
const now = new Date('2026-10-23T12:00:00+03:00');

test('Hidden resolves four stable kind/ID pairs in dismissal order, omits stale/Guides without pruning', () => {
  const dismissed = [ids[2], 'missing-record', ids[1], ids[0], catalog.guides[0].id, ids[3]];
  const original = [...dismissed];
  const rows = resolveHiddenItems(items, dismissed);
  assert.deepEqual(rows.map(r => [r.kind, r.id]), [['event', ids[2]], ['place', ids[1]], ['experience', ids[0]], ['idea', ids[3]]]);
  assert.deepEqual(dismissed, original);
  assert.deepEqual(resolveHiddenItems(items, ['stale']), []);
  assert.equal(hiddenPresentation(rows[0], now).status, T.expired);
});
test('hard-excluded records are omitted, inactive resolvable Place can be restored without eligibility bypass', () => {
  const place = catalog.places.find(p => p.id === 'erimtan')!;
  const inactive = { ...place, status: 'verification_required' as const };
  const rows = resolveHiddenItems([inactive], [place.id]);
  assert.equal(rows.length, 1);
  assert.equal(hiddenPresentation(rows[0], now).status, T.inactive);
  const removed = { ...place, id: 'yilmaz-guney-sahnesi' };
  // The catalog policy's actual hard exclusions remain authoritative.
  assert.deepEqual(resolveHiddenItems([removed], [removed.id]), []);
});
test('individual restore is exclusive/unsaved, touches only intended ID, final row becomes displayably empty', () => {
  let state = { saved: ['keep', ids[0]], dismissed: [...ids, 'stale'] };
  for (const id of ids) {
    const previous = state;
    state = contentInteractionReducer(state, { type: 'restore', id });
    assert.deepEqual(state.dismissed, previous.dismissed.filter(value => value !== id));
    assert.ok(!state.saved.includes(id));
  }
  assert.deepEqual(state.saved, ['keep']); assert.deepEqual(state.dismissed, ['stale']);
  assert.deepEqual(resolveHiddenItems(items, state.dismissed), []);
  assert.deepEqual(contentInteractionReducer(state, { type: 'restoreAll' }), { saved: ['keep'], dismissed: [] });
});
test('bulk uses entire collection (including unresolved/foreign) and preserves saved exactly', () => {
  const state = { saved: ['saved', ids[0]], dismissed: [...ids, 'unresolved', catalog.guides[0].id] };
  const next = contentInteractionReducer(state, { type: 'restoreAll' });
  assert.deepEqual(next.dismissed, []); assert.equal(next.saved, state.saved);
});
test('focus follows next, previous, then empty; no dismissal timestamp is invented', () => {
  assert.equal(hiddenFocusAfterRemoval(ids, ids[1]), ids[2]);
  assert.equal(hiddenFocusAfterRemoval(ids, ids[3]), ids[2]);
  assert.equal(hiddenFocusAfterRemoval([ids[0]], ids[0]), undefined);
});
test('each restore invalidates only its owning A/B2 slots, without seed/history changes', () => {
  for (const [index, id] of ids.entries()) {
    const affected = HOME_FILTERS[index];
    const runs = createHomeFilterRuns();
    runs[affected] = { run: 7, revision: 3, previousBatch: ['previous'] };
    const before = homeDismissalKeys(catalog, ids), after = homeDismissalKeys(catalog, ids.filter(value => value !== id));
    const catalogKeys = homeCatalogKeys(catalog), cache = createHomeSnapshotCache<object>();
    for (const filter of HOME_FILTERS) for (const mode of ['default', 'nearby'] as const) {
      const slot = homeSnapshotSlot(filter, mode);
      const key = (dismissal: string) => homeSnapshotKey(filter, runs[filter], catalogKeys[filter], 'prefs', dismissal, now);
      const value = {}; cache.write(slot, key(before[filter]), value);
      assert.equal(cache.read(slot, key(after[filter])), filter === affected ? undefined : value);
    }
    assert.deepEqual(runs[affected], { run: 7, revision: 3, previousBatch: ['previous'] });
  }
});
test('restore persists across restart; failed local write leaves immediate reducer state without rollback', async () => {
  const data = new Map<string, string>();
  let fail = false;
  const storage: PreferenceStorage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { if (fail) throw Error('disk'); data.set(key, value); }, removeItem: async key => { data.delete(key); } };
  const original = { ...emptyPreferences, onboardingCompleted: true, saved: ['keep'], dismissed: [...ids] };
  await savePreferences(original, storage);
  const next = { ...original, ...contentInteractionReducer(original, { type: 'restore', id: ids[0] }) };
  await savePreferences(next, storage); assert.equal(JSON.stringify(await loadPreferences(storage)), JSON.stringify(next));
  fail = true;
  const optimistic = { ...next, ...contentInteractionReducer(next, { type: 'restoreAll' }) };
  await assert.rejects(savePreferences(optimistic, storage));
  assert.deepEqual(optimistic.dismissed, []); assert.deepEqual((await loadPreferences(storage)).dismissed, next.dismissed);
});
test('Home/Saved/Ankara origins: nested Back, full Close caller, matching bottom selection', () => {
  for (const screen of ['results', 'saved', 'guides'] as const) {
    const session: ManagementSession = { origin: { screen, scrollY: 321, filter: 'place', focus: 'settings' }, hiddenFrom: 'settings' };
    assert.equal(managementBack('settings', session), screen);
    assert.equal(managementBack('hidden', session), 'settings');
    assert.equal(managementTab(session.origin), screen === 'results' ? 'home' : screen);
    assert.deepEqual(session.origin, { screen, scrollY: 321, filter: 'place', focus: 'settings' });
  }
  assert.equal(managementBack('hidden', { origin: { screen: 'results', filter: 'idea', scrollY: 92, focus: 'hidden' }, hiddenFrom: 'results' }), 'results');
});
test('Settings editor drafts/Cancel write nothing; one compatible Apply preserves completion and origin', () => {
  const current = { ...emptyPreferences, onboardingCompleted: true, mood: 'Sakin' as const, interests: ['Doğa' as const] };
  let session = preferenceEditorReducer(undefined, { type: 'open', preferences: current, origin: { source: 'settings', filter: 'place', seed: 5, previousBatch: ['p'], scrollY: 80 } })!;
  session = preferenceEditorReducer(session, { type: 'field', field: 'budget' })!;
  session = preferenceEditorReducer(session, { type: 'change', value: { budget: '₺₺' } })!;
  assert.equal(current.budget, undefined);
  const cancelled = preferenceEditorReducer(session, { type: 'back' })!;
  assert.equal(cancelled.draft.budget, undefined);
  assert.equal(preferenceEditorReducer(cancelled, { type: 'close' }), undefined);
  session = preferenceEditorReducer(session, { type: 'applyField' })!;
  const result = applyPreferenceEditor(current, session);
  assert.equal(result.budget, '₺₺'); assert.equal(result.onboardingCompleted, true);
  assert.equal(session.origin.source, 'settings'); assert.equal(preferenceReturnFocus('settings', true), 'settings');
});

function deletionHarness() {
  let resolve!: (result: UserDataDeletionResult) => void, reject!: (error: Error) => void;
  const pending = new Promise<UserDataDeletionResult>((yes, no) => { resolve = yes; reject = no; });
  const alerts: { title: string; body: string; buttons: { text: string; style?: string; onPress?: () => void }[] }[] = [];
  let calls = 0, resets = 0, failures = 0, focus = 0;
  const busy: boolean[] = [];
  const controller = createSettingsDeletion({ alert: (title, body, buttons) => alerts.push({ title, body, buttons }), deleteData: () => { calls++; return pending; }, reset: () => resets++, busy: value => busy.push(value), failed: () => failures++, focusDelete: () => focus++ });
  return { controller, resolve, reject, alerts, busy, state: () => ({ calls, resets, failures, focus }), settle: () => new Promise(resolve => setImmediate(resolve)) };
}
for (const [name, result, title, body] of [
  ['local', { remoteUserStateDeleted: false, anonymousAccountDeleted: false, anonymousAccountDeletionFailed: false }, T.successTitle, T.successLocal],
  ['connected', { remoteUserStateDeleted: true, anonymousAccountDeleted: true, anonymousAccountDeletionFailed: false }, T.successTitle, T.successConnected],
  ['Auth partial', { remoteUserStateDeleted: true, anonymousAccountDeleted: false, anonymousAccountDeletionFailed: true }, T.partialTitle, T.partialBody],
] as const) test(`deletion ${name}: actual confirmed outcome, root survives screen departure, duplicate/late actions are inert`, async () => {
  const h = deletionHarness(); h.controller.request(); h.controller.request();
  assert.equal(h.alerts.length, 1); assert.equal(h.state().calls, 0);
  assert.deepEqual(h.alerts[0].buttons.map(b => [b.text, b.style]), [[T.cancel, 'cancel'], [T.confirm, 'destructive']]);
  const confirm = h.alerts[0].buttons[1].onPress!; confirm(); confirm(); h.controller.request();
  assert.equal(h.state().calls, 1); assert.equal(h.controller.busy(), true);
  h.resolve(result); await h.settle();
  assert.equal(h.state().resets, 1); assert.equal(h.alerts[1].title, title); assert.equal(h.alerts[1].body, body);
  assert.deepEqual(h.busy, [true, false]); confirm(); assert.equal(h.state().calls, 1);
  h.alerts[1].buttons[0].onPress!(); confirm(); assert.equal(h.state().calls, 1);
});
test('deletion Cancel does no writes; stale confirm after Cancel cannot start deletion', () => {
  const h = deletionHarness(); h.controller.request(); h.alerts[0].buttons[0].onPress!(); h.alerts[0].buttons[1].onPress!();
  assert.deepEqual(h.state(), { calls: 0, resets: 0, failures: 0, focus: 1 }); assert.deepEqual(h.busy, []);
});
for (const stage of ['identity', 'remote', 'cleanup']) test(`deletion ${stage} failure never falsely resets or promises all data preserved`, async () => {
  const h = deletionHarness(); h.controller.request(); h.alerts[0].buttons[1].onPress!(); h.reject(Error(stage)); await h.settle();
  assert.equal(h.state().resets, 0); assert.equal(h.state().failures, 1);
  assert.equal(h.alerts[1].title, T.failureTitle); assert.equal(h.alerts[1].body, T.failureBody);
  h.alerts[1].buttons[0].onPress!(); assert.equal(h.state().focus, 1);
});
test('unmounted root ignores late completion and previously retained confirmation callbacks', async () => {
  const h = deletionHarness(); h.controller.request(); h.alerts[0].buttons[1].onPress!(); h.controller.dispose();
  h.resolve({ remoteUserStateDeleted: false, anonymousAccountDeleted: false, anonymousAccountDeletionFailed: false }); await h.settle();
  assert.equal(h.state().resets, 0); assert.equal(h.alerts.length, 1);
});
