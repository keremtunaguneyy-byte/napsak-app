import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PRODUCTION_ASSET_INDEX as index } from '../src/components/gezek/productionAssetIndex';
import { PRODUCTION_ASSET_XML as assets } from '../src/components/gezek/productionAssetXml';
import { ArtworkResolver, ARTWORK_DIMENSIONS, discoveryDestinations } from '../src/components/gezek/ArtworkResolver';
import { ContextualIconResolver } from '../src/components/gezek/ContextualIconResolver';
import { embeddedCatalog } from '../src/data/catalog';

test('every package record and live recommendation item resolves with intact responsive geometry', () => {
  assert.equal(Object.keys(index.content).length, 384);
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
  for (const item of [...c.experiences, ...c.events, ...c.ideas, ...c.places.map(p => ({ ...p, kind: 'place' }))]) assert.equal(ArtworkResolver(item, 'Hero').type, 'artwork', item.id);
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
