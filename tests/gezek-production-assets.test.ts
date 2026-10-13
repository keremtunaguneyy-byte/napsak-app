import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PRODUCTION_ASSET_INDEX as index } from '../src/components/gezek/productionAssetIndex';
import { PRODUCTION_ASSET_XML as assets } from '../src/components/gezek/productionAssetXml';
import { ArtworkResolver, ARTWORK_DIMENSIONS, discoveryDestinations } from '../src/components/gezek/ArtworkResolver';
import { ContextualIconResolver } from '../src/components/gezek/ContextualIconResolver';
import { execFileSync } from 'node:child_process';
import { reviewedEventMapping, EVENT_ARTWORK_TAXONOMY } from '../scripts/eventArtworkContract';
import { runRecommendationQualityBaseline } from '../src/recommendationQuality';
import { embeddedCatalog } from '../src/data/catalog';

test('every package record and live recommendation item resolves with intact responsive geometry', () => {
  assert.equal(Object.keys(index.content).length, 392);
  assert.equal(Object.keys(index.artwork).length, 125);
  assert.equal(Object.keys(index.icons).length, 46);
  for (const [identity, mapping] of Object.entries(index.content)) {
    const [kind, id] = identity.split(':');
    assert.ok(ContextualIconResolver(mapping.icon_key));
    for (const layout of ['Hero', 'Square', 'Compact'] as const) {
      const visual = ArtworkResolver({ kind, id }, layout);
      assert.equal(visual.type, 'artwork', identity);
      if (visual.type === 'artwork') {
        assert.equal(visual.artwork_key, mapping.artwork_key);
        const asset = assets[visual.path];
        assert.equal(asset.width, ARTWORK_DIMENSIONS[layout].width);
        assert.equal(asset.height, ARTWORK_DIMENSIONS[layout].height);
      }
    }
  }
  const c = embeddedCatalog('ankara');
  for (const item of [...c.experiences, ...c.events, ...c.ideas, ...c.places.map(p => ({ ...p, kind: 'place' }))]) {
    for (const layout of ['Hero', 'Square', 'Compact'] as const) assert.equal(ArtworkResolver(item, layout).type, 'artwork', item.id);
  }
});

test('generated assets equal local files and recorded checksums, including verified proof exports', () => {
  const hashes = JSON.parse(readFileSync('assets/gezek/production/asset-checksums.json', 'utf8'));
  for (const [path, asset] of Object.entries(assets)) {
    const xml = readFileSync(`assets/gezek/production/${path}`, 'utf8');
    assert.equal(asset.xml, xml, path);
    assert.equal(createHash('sha256').update(xml).digest('hex'), hashes[path], path);
  }
  const verification = JSON.parse(readFileSync('assets/gezek/production/figma-export-verification.json', 'utf8'));
  const ledger = JSON.parse(readFileSync('assets/gezek/production/figma-node-ledger.json', 'utf8'));
  const manifest = JSON.parse(readFileSync('assets/gezek/production/asset-export-manifest.json', 'utf8'));
  for (const family of ledger.artwork.filter((a: { asset_authority: string; figma_node_id: string }) => a.asset_authority === 'figma-proof-component' || a.figma_node_id === '810:102')) {
    const exports = verification.artwork.filter((e: { key: string }) => e.key === family.artwork_key);
    assert.equal(exports.length, 3);
    assert.ok(exports.every((e: { setId: string }) => e.setId === family.figma_node_id));
    assert.equal(manifest.artwork.find((a: { artwork_key: string }) => a.artwork_key === family.artwork_key).export_status, 'verified-figma-export');
  }
});

test('fallback order rejects unverified media and never guesses from titles', () => {
  const item = { id: 'xp-kugulu-segmenler', kind: 'experience', artwork_key: 'event/concert-live/v01' };
  const media = { source: 1, sourceCredit: 'official source', licenseEvidence: 'verified license', focalPoint: { x: 0.5, y: 0.5 } };
  assert.equal(ArtworkResolver(item, 'Hero', { 'experience:xp-kugulu-segmenler': media }).type, 'media');
  const visual = ArtworkResolver(item, 'Hero', { 'experience:xp-kugulu-segmenler': { ...media, licenseEvidence: '' } });
  assert.equal(visual.type, 'artwork');
  if (visual.type === 'artwork') assert.equal(visual.artwork_key, 'experience/xp-kugulu-segmenler/hero-v1');
  assert.equal(ArtworkResolver({ kind: 'place', id: 'new-item', artwork_key: 'place/urban-park/urban-green/v01' }, 'Compact').type, 'artwork');
  assert.deepEqual(ArtworkResolver({ kind: 'place', id: 'unknown', artwork_key: 'invalid' }, 'Square'), { type: 'neutral', layout: 'Square' });
  assert.equal(ContextualIconResolver('unknown'), undefined);
  for (const filter of ['experience', 'place', 'event', 'idea'] as const) {
    const destinations = discoveryDestinations(filter);
    assert.equal(destinations.length, 3);
    assert.ok(!destinations.includes(filter));
  }
});


test('current Events carry reviewed structured mappings and unknown Events fail closed without title reads', () => {
  const inventory = JSON.parse(readFileSync('assets/gezek/production/figma-asset-manifest.json', 'utf8'));
  assert.equal(Object.keys(EVENT_ARTWORK_TAXONOMY).length, 12);
  for (const event of embeddedCatalog('ankara').events) {
    const row = inventory.items.find((row: { id: string }) => row.id === event.id);
    assert.equal(row.title, event.title);
    assert.deepEqual(index.content[`event:${event.id}` as keyof typeof index.content], reviewedEventMapping(row));
    for (const layout of ['Hero', 'Square', 'Compact'] as const) {
      const hostileTitle = { ...event, get title(): string { throw new Error('Runtime read title'); } };
      const resolution = ArtworkResolver(hostileTitle, layout);
      assert.equal(resolution.type, 'artwork');
      if (resolution.type === 'artwork') assert.ok(assets[resolution.path]);
    }
  }
  for (const id of ['future-unknown', '']) {
    assert.deepEqual(ArtworkResolver({ kind: 'event', id, artwork_key: 'event/concert-live/v01' }, 'Hero'), { type: 'neutral', layout: 'Hero' });
  }
  const row = inventory.items.find((row: { id: string }) => row.id === embeddedCatalog('ankara').events[1].id);
  assert.equal(reviewedEventMapping({ ...row, artwork_key: undefined }).artwork_key, 'event/concert-classical-acoustic/v01');
  for (const invalid of [{ reviewed_at: undefined }, { classification_basis: '' }, { visual_subtype: 'unknown' }, { icon_component_key: 'icon/event/game' }, { photo_family: '' }, { artwork_key: 'event/theatre-play/v01' }]) {
    assert.throws(() => reviewedEventMapping({ ...row, ...invalid }));
  }
});

test('asset generation is byte-identical and acoustic export authority stays intact', () => {
  const paths = ['src/components/gezek/productionAssetIndex.ts', 'src/components/gezek/productionAssetXml.ts', 'assets/gezek/production/asset-checksums.json'];
  const before = paths.map(path => readFileSync(path));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/buildGezekAssets.ts']);
  paths.forEach((path, i) => assert.deepEqual(readFileSync(path), before[i], path));
  const ledger = JSON.parse(readFileSync('assets/gezek/production/figma-node-ledger.json', 'utf8'));
  const acoustic = ledger.artwork.find((row: { artwork_key: string }) => row.artwork_key === 'event/concert-classical-acoustic/v01');
  assert.equal(acoustic.figma_node_id, '810:102');
  for (const layout of ['Hero', 'Square', 'Compact'] as const) assert.equal(index.artwork['event/concert-classical-acoustic/v01'][layout], `svg/artwork/event/concert-classical-acoustic/v01/${layout.toLowerCase()}.svg`);
});


test('Experience, Place and Idea inventory remains unchanged from audited main', () => {
  const inventory = JSON.parse(readFileSync('assets/gezek/production/figma-asset-manifest.json', 'utf8'));
  const untouched = inventory.items.filter((row: { kind: string }) => row.kind !== 'event');
  assert.equal(createHash('sha256').update(JSON.stringify(untouched)).digest('hex'), '6fd6f7317b9980a0754e0435a27b72d78ab061a03070f2c357b219246f431aeb');
});

test('Event facts remain byte-identical to audited current catalog', () => {
  assert.equal(createHash('sha256').update(readFileSync('src/data/events.ts')).digest('hex'), 'ca2909fa3cf56a91498ae5752fd866e827e16655859777c91316c4c6c25c03d7');
});

test('recommendation golden output equals audited main, including ordering and reasons', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(runRecommendationQualityBaseline())).digest('hex'), '098ae0e27173866454765c13f31dac50aca8f9dbafff4c9518f03e9d52ec1676');
});


test('approved acoustic SVG bytes are preserved from the authoritative export', () => {
  const approvedHashes = {
    "svg/artwork/event/concert-classical-acoustic/v01/hero.svg": "fbddc1133d4450667e0cc7b7aef86b7158ff20cdfaec405d7305f233eb85773a",
    "svg/artwork/event/concert-classical-acoustic/v01/square.svg": "3d3f8e8cecf6c6cc2e7727b483b457d77a58ddabe09439a264f7321485570300",
    "svg/artwork/event/concert-classical-acoustic/v01/compact.svg": "bb083e96e909883cb3d9bbc50237000c0f889ea37f314eee96735178b8b2c74c"
};
  for (const [path, hash] of Object.entries(approvedHashes)) assert.equal(createHash('sha256').update(assets[path].xml).digest('hex'), hash);
  const event = embeddedCatalog('ankara').events[1];
  const hint = { ...event, artwork_key: 'event/concert-live/v01' };
  const resolution = ArtworkResolver(hint, 'Hero');
  assert.equal(resolution.type, 'artwork');
  if (resolution.type === 'artwork') assert.equal(resolution.artwork_key, 'event/concert-classical-acoustic/v01');
  assert.equal(ArtworkResolver(event, 'Hero', { [`event:${event.id}`]: { source: 1, sourceCredit: 'official', licenseEvidence: 'approved', focalPoint: { x: 0.5, y: 0.5 } } }).type, 'media');
});
