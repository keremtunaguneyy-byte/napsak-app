import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { embeddedCatalog } from '../src/data/catalog';
import { ankara101Chapters, ankara101EditorialFont, ankara101FontState, ankara101Return, GUIDE_PRESENTATIONS, openAnkara101Reader, PRODUCTION_GUIDE_IDS, resolveAnkara101Reader } from '../src/ankara101Reader';
import { CLASSICS_COLLECTION_ID } from '../src/ankara101';
import { resolveSavedEntries } from '../src/saved';
import { insiderRoutes } from '../src/data/insiderRoutes';
import { contentInteractionReducer } from '../src/contentInteractions';
import { deserializePreferences, migratePreferences, serializePreferences } from '../src/persistence';

const catalog = embeddedCatalog('ankara');
test('every approved ID resolves current catalog content, exact sources, native presentation and static media independent of title', () => {
  const registry = readFileSync('src/components/gezek/ankara101Assets.ts', 'utf8');
  assert.equal(PRODUCTION_GUIDE_IDS.length, 12);
  for (const id of PRODUCTION_GUIDE_IDS) {
    const result = resolveAnkara101Reader(catalog.guides, id)!;
    assert.ok(result);
    assert.equal(result.guide, catalog.guides.find(g => g.id === id));
    const changed = { ...result.guide, title: 'A different visible title', sourceUrl: `https://example.org/current/${id}` };
    const next = resolveAnkara101Reader([changed], id)!;
    assert.equal(next.config, result.config);
    assert.equal(next.guide.sourceUrl, changed.sourceUrl);
    assert.ok(registry.includes(JSON.stringify(result.config.mediaKey)));
    const chapters = ankara101Chapters(result.guide, result.config);
    assert.deepEqual(chapters.flatMap(c => c.paragraphs), result.guide.paragraphs);
    if (result.config.routeAt === 'split') assert.deepEqual(chapters.flatMap(c => c.stops), result.guide.routeStops ?? []);
    if (!result.guide.routeStops?.length) assert.ok(chapters.every(c => c.stops.length === 0));
  }
});
test('unavailable or title-only records cannot resolve or open another Guide', () => {
  for (const id of [undefined, '', 'missing', catalog.guides[0].title, CLASSICS_COLLECTION_ID]) assert.equal(resolveAnkara101Reader(catalog.guides, id), undefined);
  const removed = catalog.guides.filter(g => g.id !== PRODUCTION_GUIDE_IDS[0]);
  assert.equal(openAnkara101Reader(removed, PRODUCTION_GUIDE_IDS[0], { screen: 'guides', scrollY: 0 }), undefined);
});
test('all twelve sessions return the exact index or Saved scroll/focus origin on Back, Close and Android Back, even after unsave/restart', () => {
  for (const id of PRODUCTION_GUIDE_IDS) for (const screen of ['guides', 'saved'] as const) {
    const origin = { screen, id, scrollY: 763 };
    const session = openAnkara101Reader(catalog.guides, id, origin)!;
    const state = contentInteractionReducer({ saved: [id], dismissed: [] }, { type: 'toggleSave', id });
    const prefs = deserializePreferences(serializePreferences(migratePreferences({ ...state, interests: ['Doğa'], onboardingCompleted: true })))!;
    assert.ok(!prefs.saved.includes(id));
    for (const action of ['back', 'close', 'androidBack'] as const) assert.deepEqual(ankara101Return(session, action), origin);
    assert.equal(session.guideId, id);
    assert.notEqual(session.origin, origin);
  }
});
test('legacy saved collection and Insider identities survive exact-ID reader integration', () => {
  const rows = resolveSavedEntries([CLASSICS_COLLECTION_ID, insiderRoutes[0].id, ...PRODUCTION_GUIDE_IDS], [], catalog.guides, insiderRoutes);
  assert.equal(rows.filter(r => r.type === 'guide').length, 12);
  assert.ok(rows.some(r => r.type === 'classics'));
  assert.ok(rows.some(r => r.type === 'route'));
  const app = readFileSync('App.tsx', 'utf8');
  assert.match(app, /<LegacyInsiderEntry/);
  assert.match(app, /entry.type === 'classics' \? 'landing' : 'insider'/);
});
test('Saved collection has nested Back to index and Close to its Saved origin', () => {
  const index = { screen: 'guides' as const, id: PRODUCTION_GUIDE_IDS[2], scrollY: 1073 };
  const saved = { screen: 'saved' as const, id: CLASSICS_COLLECTION_ID, scrollY: 412 };
  const session = openAnkara101Reader(catalog.guides, PRODUCTION_GUIDE_IDS[2], index, saved)!;
  assert.deepEqual(ankara101Return(session, 'back'), index);
  assert.deepEqual(ankara101Return(session, 'androidBack'), index);
  assert.deepEqual(ankara101Return(session, 'close'), saved);
});
test('approved files retain exact checksums, source dimensions and nonempty XML; all slots are mapped', () => {
  const manifest = JSON.parse(readFileSync('docs/ankara101/asset-manifest.json', 'utf8'));
  assert.equal(manifest.length, 26);
  for (const a of manifest) {
    const bytes = readFileSync(a.file.replace('assets/', 'assets/ankara101/production/'));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), a.sha256);
    if (a.file.endsWith('.png')) assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [1536, 1024]);
    else assert.match(bytes.toString(), /<svg[\s>]/);
  }
  for (const id of PRODUCTION_GUIDE_IDS) assert.ok(GUIDE_PRESENTATIONS[id].hero.height > 0 && GUIDE_PRESENTATIONS[id].nodes.mobile_412);
});
test('exact-size motif exports preserve Figma stroke weights and the already-clipped background bounds', () => {
  const ledger = JSON.parse(readFileSync('docs/ankara101/figma-motif-instance-exports.json', 'utf8'));
  const registry = readFileSync('src/components/gezek/ankara101InstanceAssets.ts', 'utf8');
  assert.equal(ledger.records.length, 22);
  for (const r of ledger.records) {
    const bytes = readFileSync(r.file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), r.sha256);
    assert.ok(registry.includes(JSON.stringify(bytes.toString()).slice(1, -1)));
    assert.match(bytes.toString(), new RegExp(`width="${r.exportWidth}" height="${r.exportHeight}"`));
    if (r.role === 'interlude') {
      assert.ok([54, 132].includes(r.exportWidth));
      assert.equal(r.exportWidth, r.w);
      assert.equal(r.exportHeight, r.h);
      assert.equal(GUIDE_PRESENTATIONS[r.guideId].interludeMotif, `${r.guideId}-interlude`);
    } else {
      assert.deepEqual([r.x, r.w, r.exportWidth, r.exportHeight], [-100, 260, 160, 260]);
      assert.equal(GUIDE_PRESENTATIONS[r.guideId].groundMotif, `${r.guideId}-ground`);
    }
  }
});
test('font loading is bounded, failure has no late typography swap, and official font roles remain scoped', () => {
  assert.equal(ankara101FontState(false, undefined, false), 'loading');
  assert.equal(ankara101FontState(true, undefined, false), 'ready');
  assert.equal(ankara101FontState(false, new Error(), false), 'failed');
  assert.equal(ankara101FontState(false, undefined, true), 'failed');
  assert.equal(ankara101FontState(true, undefined, true), 'failed');
  const fonts = JSON.parse(readFileSync('assets/ankara101/fonts/provenance.json', 'utf8'));
  assert.match(fonts.reconciliation, /DM Serif Display/);
  for (const c of Object.values(GUIDE_PRESENTATIONS)) for (const [style, size] of [[c.style, c.titleSize], [c.style, 21], [c.layout === 'castle' ? 'Bold' : c.style, 25]] as const) {
    const font = ankara101EditorialFont(c.font, style, size);
    assert.ok(statSync(`assets/ankara101/fonts/${font}.ttf`).size > 10000, `${font} resolves for ${c.title}`);
  }
  for (const r of fonts.records) {
    assert.ok(statSync(`assets/ankara101/fonts/${r.file}`).size > 10000);
    assert.equal(createHash('sha256').update(readFileSync(`assets/ankara101/fonts/${r.file}`)).digest('hex'), r.sha256);
    if (r.family === 'bricolagegrotesque') assert.deepEqual([r.axes.wdth, r.axes.opsz], [100, 14]);
    if (r.family === 'fraunces') assert.deepEqual([r.axes.WONK, r.axes.SOFT], [1, 0]);
  }
  const reader = readFileSync('src/components/gezek/Ankara101ReaderHost.tsx', 'utf8');
  assert.doesNotMatch(reader, /allowFontScaling=\{false\}|maxHeight|maximumHeight/);
  assert.match(reader, /paddingBottom: castle \? 40 : 48/);
});

test('selected hero warming is single, bounded, cancels stale navigation and retains only three recent hints', async () => {
  const { createAnkara101ImageOpening, ANKARA101_IMAGE_HOLD_MS } = await import('../src/ankara101Media');
  const requests: any[] = [], timers: { callback: () => void; stopped: boolean; ms: number }[] = [], commits: string[] = [];
  const opening = createAnkara101ImageOpening(r => requests.push(r), (callback, ms) => {
    const timer = { callback, ms, stopped: false }; timers.push(timer); return () => { timer.stopped = true; };
  });
  const start = (id: string) => opening.start(id, 353, 232, () => commits.push(id));
  start('a'); const first = requests.at(-1);
  assert.deepEqual([first.width, first.height, timers[0].ms], [353, 232, ANKARA101_IMAGE_HOLD_MS]);
  start('b'); const second = requests.at(-1);
  assert.ok(timers[0].stopped);
  opening.finish(first.token, true); assert.deepEqual(commits, []);
  opening.finish(second.token, true); assert.deepEqual(commits, ['b']);
  start('b'); assert.deepEqual(commits, ['b', 'b']); // warm hint: no new decode request
  assert.equal(timers.length, 2);
  start('c'); timers.at(-1)!.callback(); assert.equal(commits.at(-1), 'c'); // 200 ms maximum hold
  opening.finish(requests.findLast(r => r?.mediaKey === 'c').token, true);
  assert.equal(commits.length, 3); // late decode cannot route twice
  start('d'); const cancelled = requests.at(-1); opening.cancel();
  opening.finish(cancelled.token, true); timers.at(-1)!.callback(); assert.equal(commits.length, 3);
  for (const id of ['e', 'f', 'g']) opening.remember(id);
  start('b'); assert.equal(requests.at(-1).mediaKey, 'b'); // fourth hint was evicted
  opening.cancel(); assert.ok(timers.every(t => t.stopped));
});
test('index decode work follows the viewport, caps four thumbnails, and never warms all twelve', async () => {
  const { visibleAnkara101Media } = await import('../src/ankara101Media');
  const frames = Object.fromEntries(PRODUCTION_GUIDE_IDS.map((id, i) => [id, { y: i * 200, height: 184 }]));
  assert.deepEqual(visibleAnkara101Media(frames, -600, 450), []);
  const nearby = visibleAnkara101Media(frames, 600, 700);
  assert.ok(nearby.length <= 4);
  assert.ok(!nearby.includes(PRODUCTION_GUIDE_IDS[0]) && !nearby.includes(PRODUCTION_GUIDE_IDS[11]));
  assert.equal(visibleAnkara101Media(frames, 0, 99999).length, 4);
});
