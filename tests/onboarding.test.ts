import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { canContinueOnboarding, commitOnboarding, createOnboardingSession, firstRunRequired, onboardingReducer, onboardingSnapshot, ONBOARDING_PREPARING_MS, ONBOARDING_STEPS, onboardingFooterClearance } from '../src/onboarding';
import { deserializePreferences, emptyPreferences, PREFERENCE_STORAGE_KEY, serializePreferences } from '../src/persistence';
import { applyPreferenceEditor, preferenceEditorReducer } from '../src/preferenceEditor';
import { recommendAll } from '../src/recommendations';
import { embeddedCatalog } from '../src/data/catalog';
import type { PersistedPreferences } from '../src/persistence';
const now = new Date('2026-10-13T12:00:00+03:00');
const initial: PersistedPreferences = { ...emptyPreferences, saved: ['saved-place'], dismissed: ['hidden-idea'] };
const valid: PersistedPreferences = { ...initial, mood: 'Sakin', interests: ['Kahve', 'Sanat'], budget: 'Ücretsiz', groupSize: '2 kişi', duration: '1–2 saat' };
const ready = () => onboardingReducer(onboardingReducer(createOnboardingSession(valid), { type: 'next' }), { type: 'prepared' });

test('fresh empty storage opens Welcome; completed legacy users with empty interests bypass first run', () => {
  assert.equal(createOnboardingSession(deserializePreferences('{}')).step, 'welcome');
  assert.equal(firstRunRequired(emptyPreferences), true);
  assert.equal(firstRunRequired({ ...initial, mood: 'Sakin', interests: [], onboardingCompleted: true }), false);
  assert.equal(firstRunRequired({ ...initial, onboardingCompleted: true }), false);
});

test('incomplete legacy snapshot with zero interests resumes Interests and cannot continue', () => {
  const session = createOnboardingSession({ ...valid, interests: [] });
  assert.equal(session.step, 'interest'); assert.equal(canContinueOnboarding(session), false);
  assert.equal(onboardingReducer(session, { type: 'next' }), session);
});

test('zero disables, one enables, deselecting the last disables, with no maximum', () => {
  let session = createOnboardingSession({ ...valid, interests: [] });
  assert.equal(canContinueOnboarding(session), false);
  session = onboardingReducer(session, { type: 'change', value: { interests: ['Kahve'] } });
  assert.equal(canContinueOnboarding(session), true);
  session = onboardingReducer(session, { type: 'change', value: { interests: [] } });
  assert.equal(canContinueOnboarding(session), false);
  session = onboardingReducer(session, { type: 'change', value: { interests: ['Kahve', 'Sanat', 'Doğa', 'Lezzet', 'Etkinlik'] } });
  assert.equal(canContinueOnboarding(session), true); assert.equal(session.draft.interests.length, 5);
});

test('exact ordered flow and complete Back chain preserve every draft selection', () => {
  let session = createOnboardingSession(initial);
  const steps = [session.step];
  session = onboardingReducer(session, { type: 'next' }); steps.push(session.step);
  for (const value of [{ mood: valid.mood }, { interests: valid.interests }, { budget: valid.budget }, { groupSize: valid.groupSize }, { duration: valid.duration }]) {
    session = onboardingReducer(session, { type: 'change', value });
    session = onboardingReducer(session, { type: 'next' }); steps.push(session.step);
  }
  assert.deepEqual(steps, ONBOARDING_STEPS);
  assert.equal(onboardingReducer(session, { type: 'back' }), session);
  let back = createOnboardingSession(valid);
  const draft = back.draft;
  for (const step of ['group', 'budget', 'interest', 'mood', 'welcome']) {
    back = onboardingReducer(back, { type: 'back' }); assert.equal(back.step, step); assert.equal(back.draft, draft); assert.equal(back.direction, 'back');
  }
  assert.equal(onboardingReducer(back, { type: 'back' }), back);
  for (let i = 0; i < 5; i++) back = onboardingReducer(back, { type: 'next' });
  assert.deepEqual(back.draft, draft); assert.equal(back.step, 'duration');
});

test('back/forward through Interests preserves multiple choices and session-local changes', () => {
  const source = { ...valid, interests: [] };
  let session = createOnboardingSession(source);
  session = onboardingReducer(session, { type: 'change', value: { interests: ['Kahve', 'Sanat'] } });
  session = onboardingReducer(session, { type: 'next' }); session = onboardingReducer(session, { type: 'back' });
  assert.equal(session.step, 'interest'); assert.deepEqual(session.draft.interests, ['Kahve', 'Sanat']); assert.deepEqual(source.interests, []);
  session = onboardingReducer(session, { type: 'back' }); session = onboardingReducer(session, { type: 'next' });
  assert.deepEqual(session.draft.interests, ['Kahve', 'Sanat']);
});

test('answers cannot mutate other fields and preparation ignores answer/navigation actions', () => {
  const session = createOnboardingSession({ ...valid, interests: [] });
  const changed = onboardingReducer(session, { type: 'change', value: { interests: ['Doğa'], mood: 'Enerjik' } });
  assert.equal(changed.draft.mood, 'Sakin'); assert.deepEqual(changed.draft.interests, ['Doğa']);
  const prepared = ready();
  assert.equal(onboardingReducer(prepared, { type: 'change', value: { budget: '₺₺' } }), prepared);
  assert.equal(onboardingReducer(prepared, { type: 'next' }), prepared);
});

test('atomic commit writes once, preserves interactions, and publishes success only after the promise', async () => {
  let release!: () => void;
  const writes: PersistedPreferences[] = [];
  let complete = false;
  const pending = commitOnboarding(initial, ready(), async value => { writes.push(value); await new Promise<void>(resolve => { release = resolve; }); }, now).then(value => { complete = true; return value; });
  assert.equal(writes.length, 1); assert.equal(complete, false); assert.equal(initial.onboardingCompleted, false);
  assert.equal(writes[0].onboardingCompleted, true); assert.equal(writes[0].saved, initial.saved); assert.equal(writes[0].dismissed, initial.dismissed);
  release(); const next = await pending;
  assert.equal(complete, true); assert.equal(next.contextConfirmedAt, now.toISOString());
  assert.deepEqual(next.interests, valid.interests); assert.equal(next.budget, 'Ücretsiz');
});

test('write failure leaves completion false and Ready can safely retry without losing drafts', async () => {
  const session = ready(), busy = onboardingReducer(session, { type: 'saving' });
  assert.equal(busy.busy, true); assert.equal(canContinueOnboarding(busy), false);
  assert.equal(onboardingReducer(busy, { type: 'back' }), busy);
  await assert.rejects(commitOnboarding(initial, busy, async () => { throw new Error('disk'); }, now), /disk/);
  assert.equal(initial.onboardingCompleted, false);
  const retry = onboardingReducer(busy, { type: 'failed' });
  assert.equal(canContinueOnboarding(retry), true); assert.deepEqual(retry.draft, session.draft);
});

test('invalid final state cannot write; completing/restarting remains compatible with v5', async () => {
  const bad = { ...ready(), draft: { ...ready().draft, interests: [] } };
  let calls = 0;
  await assert.rejects(commitOnboarding(initial, bad, async () => { calls++; }), /not ready/); assert.equal(calls, 0);
  const next = onboardingSnapshot(initial, ready(), now);
  const restarted = deserializePreferences(serializePreferences(next));
  assert.equal(firstRunRequired(restarted), false); assert.equal(PREFERENCE_STORAGE_KEY, '@napsak/preferences/v5');
  assert.deepEqual(restarted, next);
  assert.deepEqual(createOnboardingSession(deserializePreferences(serializePreferences(initial))).draft.interests, []);
});

test('Bedava is presentation-only; identical domain selections produce identical recommendation inputs/results', () => {
  const next = onboardingSnapshot(initial, ready(), now);
  assert.equal(next.budget, 'Ücretsiz');
  const catalog = embeddedCatalog('ankara');
  const options = { ...catalog, ...valid, now, seed: 13, previousBatch: [], limit: 5 };
  assert.deepEqual(recommendAll({ ...options, ...next }), recommendAll(options));
  assert.doesNotThrow(() => recommendAll({ ...options, interests: [] }));
  const source = readFileSync('src/components/gezek/OnboardingHost.tsx', 'utf8');
  assert.match(source, /value: 'Ücretsiz', label: 'Bedava'/);
});

test('PR #74 editor continues accepting empty interests independently of the first-run guard', () => {
  const origin = { source: 'home' as const, filter: 'experience' as const, seed: 1, previousBatch: [], scrollY: 34 };
  let session = preferenceEditorReducer(undefined, { type: 'open', preferences: createOnboardingSession(valid).draft, origin })!;
  session = preferenceEditorReducer(session, { type: 'field', field: 'interests' })!;
  session = preferenceEditorReducer(session, { type: 'change', value: { interests: [] } })!;
  session = preferenceEditorReducer(session, { type: 'applyField' })!;
  assert.deepEqual(applyPreferenceEditor({ ...valid, onboardingCompleted: true }, session).interests, []);
  assert.equal(applyPreferenceEditor({ ...valid, onboardingCompleted: true }, session).onboardingCompleted, true);
});

test('runtime uses separate draft host, shared Android Back reducer, guarded write, and existing editor destinations', () => {
  const app = readFileSync('App.tsx', 'utf8');
  assert.match(app, /if \(onboardingSession && !onboardingCompleted\) return <OnboardingHost/);
  assert.match(app, /if \(!hydrated \|\| !onboardingCompleted\) return/);
  assert.match(app, /await commitOnboarding\(current, onboardingSession, persistPreferences\)/);
  assert.match(app, /if \(!alreadyCommitted\) persistPreferences/);
  assert.ok(app.indexOf('await commitOnboarding') < app.indexOf('setOnboardingCompleted(true)'));
  assert.match(app, /onEditPreferences=\{editHomePreferences\}/); assert.match(app, /onReset=\{editHomePreferences\}/);
  assert.match(app, /hardwareBackPress[\s\S]*onboardingReducer\(current, \{ type: 'back' \}\)/);
  assert.match(app, /onboardingCommitBusy\.current/);
  assert.match(app, /if \(!committed\) onboardingCommitBusy\.current = false/);
  assert.match(app, /renderedOnboardingGeneration !== onboardingGeneration\.current/);
  assert.match(app, /resetAfterDataDeletion = \(\) => \{\s*onboardingGeneration\.current \+= 1;\s*onboardingCommitBusy\.current = false/);
  assert.doesNotMatch(app, /__finishOnboarding|__departedFinish|globalThis|window\./);
  assert.match(app, /if \(onboardingSession.step === 'welcome'\) return false/);
});

test('scalable layout/44 px targets, explicit selected/busy/disabled semantics, local art and OS motion fallback', () => {
  const host = readFileSync('src/components/gezek/OnboardingHost.tsx', 'utf8');
  for (const text of ['disabled={disabled}', 'accessibilityState={{ disabled, busy: session.busy }}', 'accessibilityState={{ selected: checked, checked }}', 'accessibilityRole="radiogroup"', 'accessibilityRole="progressbar"', 'focusDetailControl', 'accessibilityElementsHidden importantForAccessibility="no-hide-descendants"', 'isReduceMotionEnabled', 'reduceMotionChanged', 'onboardingFooterClearance(footerHeight)', 'minHeight: 52', 'minWidth: 44', 'fontScale > 1.4', 'StatusBar style="dark"', 'backgroundColor: C.canvas']) assert.ok(host.includes(text), text);
  assert.ok(!/Alert|toast|https:\/\/|allowFontScaling=\{false\}|numberOfLines=/.test(host));
  assert.equal(ONBOARDING_PREPARING_MS, 4800); assert.equal(onboardingFooterClearance(160), 176);
});

test('exact local asset manifest/registry preserve every nonempty export and root geometry', async () => {
  const { ONBOARDING_ASSETS } = await import('../src/components/gezek/onboardingAssetXml');
  const { ONBOARDING_BACKGROUND_LAYERS } = await import('../src/components/gezek/onboardingArtwork');
  const manifest = JSON.parse(readFileSync('assets/gezek/onboarding/manifest.json', 'utf8')) as Array<{ file: string; width: number; height: number; sha256: string }>;
  assert.equal(manifest.length, 64);
  for (const asset of manifest) {
    const raw = readFileSync('assets/gezek/onboarding/' + asset.file); assert.ok(raw.length);
    assert.equal(createHash('sha256').update(raw).digest('hex'), asset.sha256);
    if (asset.file.endsWith('.svg')) {
      const local = ONBOARDING_ASSETS[asset.file.replace('.svg', '') as keyof typeof ONBOARDING_ASSETS];
      assert.equal(local.xml, raw.toString()); assert.equal(local.width, asset.width); assert.equal(local.height, asset.height);
    } else { assert.equal(raw.readUInt32BE(16), 52); assert.equal(raw.readUInt32BE(20), 52); }
  }
  for (const layers of Object.values(ONBOARDING_BACKGROUND_LAYERS)) for (const layer of layers) { assert.ok(ONBOARDING_ASSETS[layer.name as keyof typeof ONBOARDING_ASSETS]); for (const coordinate of [layer.x, layer.y, layer.w, layer.h]) assert.ok(Number.isFinite(coordinate)); }
});
