import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { eventDiagnostics, resolveEventPresentation, runCatalogLoad } from '../src/eventPresentation';
import { applyPreferenceEditor, preferenceEditorReducer, preferenceReturnFocus, preferenceContentClearance } from '../src/preferenceEditor';
import { contentInteractionReducer } from '../src/contentInteractions';
import { recommendAll } from '../src/recommendations';
import { events } from '../src/data/events';
import { loadBestCatalog } from '../src/data/catalogService';
import { embeddedCatalog, catalogCacheKey } from '../src/data/catalog';
import { serializePreferences } from '../src/persistence';
import { KNOWN_BUDGETS, KNOWN_DURATIONS, KNOWN_GROUP_SIZES, KNOWN_INTERESTS, KNOWN_MOODS } from '../src/types';
import type { Event, Interest } from '../src/types';
const now = new Date('2026-10-13T12:00:00+03:00');
const safe = { loading: false, totalFailure: false, usable: true };
const base = { places: [], ideas: [], events, interests: [] as Interest[], filter: 'event' as const, dismissed: [] as string[], now, seed: 17, previousBatch: events.map(event => event.id), budget: 'Fark etmez' as const };
const state = (options: Parameters<typeof recommendAll>[0], loading = safe) => resolveEventPresentation({ ...loading, ...eventDiagnostics(options), dismissed: options.dismissed, visibleIds: recommendAll(options).map(event => event.id) });

test('truthful precedence covers failure, real busy, empty, dismissal, budget and populated', () => {
  assert.equal(state(base, { loading: true, totalFailure: true, usable: false }), 'load_error');
  assert.equal(state(base, { loading: true, totalFailure: true, usable: true }), 'loading');
  assert.equal(state(base, { ...safe, totalFailure: true }), 'populated');
  assert.equal(state({ ...base, events: [] }), 'no_current_catalog');
  assert.equal(state({ ...base, events: [], budget: 'Ücretsiz' }), 'no_current_catalog');
  assert.equal(state({ ...base, dismissed: events.map(event => event.id) }), 'all_dismissed');
  assert.equal(state({ ...base, budget: 'Ücretsiz' }), 'budget_no_match');
  assert.equal(state(base), 'populated');
  assert.throws(() => resolveEventPresentation({ ...safe, currentIds: ['a'], preDismissIds: ['a'], budgetRelaxedIds: ['a'], dismissed: [], visibleIds: [] }), /Unmapped/);
});

test('exhaustive valid preferences × current/empty/expired/free/mixed catalogs × dismissal scenarios', () => {
  const free = { ...events[0], id: 'test-free', priceLevel: 0 as const };
  const catalogs: Event[][] = [events, [], events.map(event => ({ ...event, startsAt: '2026-10-12T12:00:00+03:00' })), [free], [free, events[0]]];
  let combinations = 0, freeLeaks = 0;
  const realCounts: Record<string, number> = {};
  for (const mood of KNOWN_MOODS) for (let mask = 0; mask < 32; mask++) for (const budget of KNOWN_BUDGETS) for (const groupSize of KNOWN_GROUP_SIZES) for (const duration of KNOWN_DURATIONS) {
    const interests = KNOWN_INTERESTS.filter((_, index) => !!(mask & (1 << index)));
    for (const catalog of catalogs) for (const dismissed of [[], catalog.slice(0, 1).map(e => e.id), catalog.map(e => e.id)]) {
      const options = { ...base, events: catalog, mood, budget, groupSize, duration, interests, dismissed };
      const visible = recommendAll(options), diagnostics = eventDiagnostics(options);
      const reason = resolveEventPresentation({ ...safe, ...diagnostics, dismissed, visibleIds: visible.map(event => event.id) });
      if (budget === 'Ücretsiz') freeLeaks += visible.filter(event => event.priceLevel !== 0).length;
      if (reason === 'no_current_catalog') assert.equal(diagnostics.currentIds.length, 0);
      if (reason === 'all_dismissed') assert.ok(diagnostics.preDismissIds.length && diagnostics.preDismissIds.every(id => dismissed.includes(id)));
      if (reason === 'budget_no_match') assert.equal(diagnostics.preDismissIds.length, 0);
      if (reason === 'populated') assert.ok(visible.length);
      if (catalog === events && !dismissed.length) realCounts[reason] = (realCounts[reason] ?? 0) + 1;
      combinations++;
    }
  }
  assert.equal(combinations, 192_000);
  assert.equal(freeLeaks, 0);
  assert.deepEqual(realCounts, { budget_no_match: 2560, populated: 10240 });
});

test('all nine production Event dismissal subsets, budgets, and rotation fallback classify without leakage', () => {
  for (const budget of KNOWN_BUDGETS) for (let mask = 0; mask < 512; mask++) {
    const dismissed = events.filter((_, index) => mask & (1 << index)).map(event => event.id);
    const options = { ...base, budget, dismissed };
    const reason = state(options);
    const visible = recommendAll(options);
    if (budget === 'Ücretsiz') assert.equal(visible.length, 0);
    else assert.equal(reason, mask === 511 ? 'all_dismissed' : 'populated');
  }
});

test('budget-relaxed diagnostics are isolated from visible free results and input state', () => {
  const options = { ...base, budget: 'Ücretsiz' as const, dismissed: [events[0].id], interests: ['Doğa'] as Interest[] };
  const before = JSON.stringify(options);
  const diagnosis = eventDiagnostics(options);
  assert.equal(diagnosis.preDismissIds.length, 0);
  assert.equal(diagnosis.budgetRelaxedIds.length, 9);
  assert.equal(recommendAll(options).length, 0);
  assert.equal(JSON.stringify(options), before);
});

test('Event restore uses the full eligible set beyond five ranked cards and preserves saved and non-Event dismissals', () => {
  const unrelated = ['place-id', 'experience-id', 'idea-id', 'expired-event'];
  const initial = { saved: ['saved-place', 'saved-idea'], dismissed: [...unrelated, ...events.map(event => event.id)] };
  const eligible = eventDiagnostics(base).preDismissIds;
  assert.equal(eligible.length, 9);
  const restored = contentInteractionReducer(initial, { type: 'restoreEvents', ids: eligible });
  assert.equal(restored.saved, initial.saved);
  assert.deepEqual(restored.dismissed, unrelated);
  assert.equal(state({ ...base, dismissed: restored.dismissed }), 'populated');
});

test('failed remote refresh with usable embedded/cache fallback never becomes total load error', async () => {
  const remote = { getCatalogMeta: async () => { throw new Error('offline'); }, getCatalog: async () => { throw new Error('unexpected'); } };
  const embedded = await loadBestCatalog('ankara', remote);
  assert.equal(embedded.source, 'embedded');
  assert.equal(state({ ...base, events: embedded.snapshot.events }, { ...safe, totalFailure: true }), 'populated');
  const snapshot = { ...embeddedCatalog('ankara'), catalogVersion: '2026-10-13.1' };
  const cache = await loadBestCatalog('ankara', remote, { getItem: async key => key === catalogCacheKey('ankara') ? JSON.stringify(snapshot) : null, setItem: async () => {} });
  assert.equal(cache.source, 'cache');
  assert.equal(state({ ...base, events: cache.snapshot.events }), 'populated');
});

test('retry busy settles immediately with success, failure or safe fallback; no prototype delay', async () => {
  const changes: Array<{ loading: boolean; totalFailure: boolean; usable: boolean; snapshot?: string }> = [];
  const publish = (state: typeof safe, snapshot?: string) => changes.push({ ...state, snapshot });
  let resolve!: (value: string) => void;
  const pending = runCatalogLoad(() => new Promise<string>(done => { resolve = done; }), undefined, publish);
  assert.deepEqual(changes[0], { loading: true, totalFailure: false, usable: false, snapshot: undefined });
  resolve('ready'); await pending;
  assert.deepEqual(changes[1], { loading: false, totalFailure: false, usable: true, snapshot: 'ready' });
  changes.length = 0;
  await runCatalogLoad(async () => { throw new Error('offline'); }, undefined, publish);
  assert.deepEqual(changes[1], { loading: false, totalFailure: true, usable: false, snapshot: undefined });
  changes.length = 0;
  await runCatalogLoad(async () => { throw new Error('offline'); }, 'safe', publish);
  assert.equal(changes.at(-1)?.snapshot, 'safe'); assert.equal(changes.at(-1)?.usable, true);
  const source = readFileSync('src/eventPresentation.ts', 'utf8');
  assert.ok(!source.includes('setTimeout'));
});

const preferences = { saved: ['saved'], dismissed: ['dismissed'], mood: 'Sakin' as const, interests: ['Doğa'] as Interest[], budget: 'Ücretsiz' as const, groupSize: '2 kişi' as const, duration: '1–2 saat' as const, onboardingCompleted: true, contextConfirmedAt: '2026-10-13T09:00:00Z' };
const origin = { source: 'home' as const, filter: 'event' as const, seed: 123, previousBatch: ['previous'], scrollY: 420 };
const open = (budgetOnly = false) => preferenceEditorReducer(undefined, { type: 'open', preferences, origin: { ...origin, source: budgetOnly ? 'event_empty' : 'home' }, budgetOnly })!;

test('editor Cancel, Back and Close never mutate persisted preferences or the actual Home context', () => {
  const before = serializePreferences(preferences);
  let session = open(); session = preferenceEditorReducer(session, { type: 'field', field: 'mood' })!;
  session = preferenceEditorReducer(session, { type: 'change', value: { mood: 'Enerjik', budget: '₺' } })!;
  const back = preferenceEditorReducer(session, { type: 'back' })!;
  assert.equal(back.mode, 'overview'); assert.equal(back.draft.mood, 'Sakin'); assert.equal(back.draft.budget, 'Ücretsiz');
  assert.deepEqual(back.origin, origin);
  assert.equal(preferenceEditorReducer(back, { type: 'back' }), undefined);
  assert.equal(preferenceEditorReducer(session, { type: 'close' }), undefined);
  assert.equal(preferenceEditorReducer(open(true), { type: 'back' }), undefined);
  assert.equal(preferenceEditorReducer(open(true), { type: 'cancelField' }), undefined);
  assert.equal(serializePreferences(preferences), before);
});

test('overview Apply stores the approved draft atomically; onboarding and interactions remain true/preserved', () => {
  let session = preferenceEditorReducer(open(), { type: 'field', field: 'interests' })!;
  session = preferenceEditorReducer(session, { type: 'change', value: { interests: ['Kahve', 'Sanat'] } })!;
  session = preferenceEditorReducer(session, { type: 'applyField' })!;
  const applied = applyPreferenceEditor(preferences, session);
  assert.deepEqual(applied.interests, ['Kahve', 'Sanat']); assert.equal(applied.budget, 'Ücretsiz');
  assert.equal(applied.onboardingCompleted, true); assert.equal(applied.saved, preferences.saved); assert.equal(applied.dismissed, preferences.dismissed);
  assert.deepEqual(session.origin, origin);
});

test('budget-only Apply mutates budget only, even if a multi-field update is attempted', () => {
  const session = preferenceEditorReducer(open(true), { type: 'change', value: { budget: '₺', mood: 'Enerjik', interests: ['Kahve'] } })!;
  const applied = applyPreferenceEditor(preferences, session);
  assert.deepEqual(applied, { ...preferences, budget: '₺' });
  assert.equal(preferenceReturnFocus('event_empty', false), 'event_action');
  assert.equal(preferenceReturnFocus('event_empty', true), 'event_result');
  assert.equal(preferenceReturnFocus('home', true), 'preference');
  assert.equal(preferenceContentClearance(84), 112); assert.equal(preferenceContentClearance(200), 216);
});

test('presentation uses instant modal replacement for normal/reduced motion and never adds decorative date controls', () => {
  const editor = readFileSync('src/components/gezek/PreferenceEditor.tsx', 'utf8');
  const panel = readFileSync('src/components/gezek/EventEmptyStatePanel.tsx', 'utf8');
  const home = readFileSync('src/components/gezek/GezekHome.tsx', 'utf8');
  assert.ok(editor.includes('animationType="none"'));
  assert.ok(editor.includes('preferenceContentClearance(footerHeight)'));
  assert.ok(panel.includes("disabled={state === 'loading'}"));
  assert.ok(panel.includes('accessibilityElementsHidden importantForAccessibility="no-hide-descendants"'));
  assert.ok(!/Yarın|Hafta sonu|EventTimeFilter/.test(home));
});

test('downloaded Figma assets retain bytes, root dimensions and complete local registries', async () => {
  const { createHash } = await import('node:crypto');
  const { PREFERENCE_ASSETS } = await import('../src/components/gezek/preferenceAssetXml');
  const manifest = JSON.parse(readFileSync('assets/gezek/preferences/manifest.json', 'utf8')) as Array<{ file: string; sha256: string; width: number; height: number }>;
  const controls = readFileSync('src/components/gezek/PreferenceControls.tsx', 'utf8');
  assert.equal(manifest.length, 24);
  for (const asset of manifest) {
    const raw = readFileSync('assets/gezek/preferences/' + asset.file);
    assert.ok(raw.length);
    assert.equal(createHash('sha256').update(raw).digest('hex'), asset.sha256);
    if (asset.file.endsWith('.png')) { assert.equal(raw.readUInt32BE(16), 48); assert.equal(raw.readUInt32BE(20), 48); }
    else {
      const local = PREFERENCE_ASSETS[asset.file.replace('.svg', '') as keyof typeof PREFERENCE_ASSETS];
      assert.equal(local.xml, raw.toString()); assert.equal(local.width, asset.width); assert.equal(local.height, asset.height);
    }
  }
  assert.ok(!controls.includes('https://www.figma.com/api/mcp/asset'));
});

test('all Preference Editor close controls reuse the approved SVG, never a baseline-dependent text glyph', async () => {
  const source = readFileSync('src/components/gezek/PreferenceEditor.tsx', 'utf8');
  assert.ok(!/\u00d7|\\u00d7|&#(?:215|x0*d7);/i.test(source), 'No raw, escaped or HTML-encoded multiplication glyph in the editor');
  const closeControls = [...source.matchAll(/<TouchableOpacity\b[^>]*accessibilityLabel="Tercih düzenleyiciyi kapat"[^>]*>([\s\S]*?)<\/TouchableOpacity>/g)];
  assert.equal(closeControls.length, 2, 'Overview and the single shared field/budget-only sheet');
  for (const [, children] of closeControls) {
    assert.match(children, /<PreferenceCloseIcon\s*\/>/);
    assert.ok(!children.includes('<Text'), 'Close mark must not depend on a font baseline');
  }
  const { DETAIL_ASSET_XML } = await import('../src/components/gezek/detailAssetXml');
  assert.equal(DETAIL_ASSET_XML.close.xml, readFileSync('assets/gezek/detail/svg/close.svg', 'utf8'));
  assert.match(DETAIL_ASSET_XML.close.xml, /stroke="#102452"/);
  assert.match(DETAIL_ASSET_XML.close.xml, /stroke-linecap="round"/);
  assert.match(source, /const icon = DETAIL_ASSET_XML\.close/);
});
