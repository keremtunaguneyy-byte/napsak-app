import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { embeddedCatalog } from '../src/data/catalog';
import { EmbeddedContentRepository } from '../src/data/contentRepository';
import { recommendAll } from '../src/recommendations';
import { artwork } from '../scripts/catalogOperations/artwork';
import { compatibility, sourceCityOrphans } from '../scripts/catalogOperations/compatibility';
import { eventHealth, geography, lifecycle } from '../scripts/catalogOperations/health';
import { identities, instant, nearTitles, records, verificationBand } from '../scripts/catalogOperations/records';
import { audit, markdown } from '../scripts/catalogOperations/report';
import { sources, sourceUrl } from '../scripts/catalogOperations/sources';
import { districtInventory } from '../scripts/catalogOperations/coverage';

const now = new Date('2026-11-18T00:00:00+03:00');
const fresh = () => structuredClone(embeddedCatalog());
const meta = () => new EmbeddedContentRepository().getCatalogMeta('ankara');

test('committed evidence regenerates byte-for-byte and top-level catalog ordering does not affect measurements', async () => {
  const c = fresh(), m = await meta();
  const expected = await audit(c, now, m);
  const root = 'docs/evidence/catalog-operations-quality/';
  const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
  assert.equal(json(expected), readFileSync(root + 'audit.json', 'utf8'));
  assert.equal(markdown(expected), readFileSync(root + 'summary.md', 'utf8'));
  for (const group of [c.events, c.experiences, c.guides, c.ideas, c.places]) group.reverse();
  const reversed = await audit(c, now, m);
  assert.equal(json(reversed), json(expected));
  assert.equal(markdown(reversed), markdown(expected));
  assert.deepEqual(Object.keys(reversed.inventory), ['event', 'experience', 'guide', 'idea', 'place']);
  assert.deepEqual(reversed.interestColumns, [...reversed.interestColumns].sort());
});

test('Event start equality, optional end, day rollover and seven-day freshness have independent outcomes', () => {
  const c = fresh(), start = now.toISOString(), justAfter = new Date(now.getTime() + 1).toISOString();
  c.events = [
    { ...c.events[0], id: 'a', startsAt: start, endsAt: justAfter, verifiedAt: '2026-11-11' },
    { ...c.events[1], id: 'b', startsAt: justAfter, endsAt: undefined, verifiedAt: '2026-11-19' },
    { ...c.events[1], id: 'c', startsAt: '2026-11-31T13:00:00Z', verifiedAt: '2026-02-29' },
    { ...c.events[1], id: 'd', startsAt: justAfter, endsAt: start },
  ];
  const health = eventHealth(c, now);
  assert.equal(health.expiredCount, 1);
  assert.equal(lifecycle(c, records(c), now).event.eligible, 2); // Optional end errors do not change the production start gate.
  assert.equal(health.upcomingCount, 2);
  assert.deepEqual(health.records.map(r => r.endState), ['future', 'unspecified', 'unspecified', 'invalid']);
  assert.deepEqual(health.issues.find(i => i.code === 'invalid_start')?.eventIds, ['c']);
  assert.deepEqual(lifecycle(c, records(c), now).event.states, Object.assign(Object.create(null), { expired: 1, future: 1, invalid: 2 }));
  assert.equal(health.records[0].verification, '0-7d');
  assert.ok(eventHealth(c, new Date(now.getTime() + 1)).issues.find(i => i.code === 'stale_verification')?.eventIds?.includes('a'));
  assert.ok(Number.isNaN(instant('2026-01-05T09:00:00')));
});

test('all ordered stops, orphan references, repeated non-first stops and Ankara bounds have distinct diagnostics', () => {
  const c = fresh(), route = c.experiences.find(e => e.points.length > 1)!;
  route.points.push({ ...route.points[1] }, { ...route.points[0], placeId: 'unknown' });
  route.latitude += 1;
  c.places[0].latitude = NaN;
  c.places[1].longitude = 70;
  c.places[0].district = '';
  const geo = geography(c);
  assert.ok(geo.invalid.includes(c.places[0].id));
  assert.ok(geo.outsideAnkara.includes(c.places[1].id));
  assert.equal(districtInventory(records(c)).place.unknown, 1);
  const message = geo.failures.find(r => r.id === route.id)!.reasons.join(' ');
  assert.match(message, /missing\/ambiguous Place linkage/);
  assert.match(message, /repeated ordered Place/);
  assert.match(message, /coordinates differ from first Place/);
  assert.ok(lifecycle(c, records(c), now).experience.flagged.includes('experience:' + route.id));
});

test('stable IDs, Turkish title normalization and the inclusive token threshold produce review leads', () => {
  assert.equal(nearTitles('bir iki uc', 'bir iki uc dort'), true);
  assert.equal(nearTitles('bir iki uc', 'bir iki uc dort bes'), false);
  assert.equal(nearTitles('bir iki', 'iki bir'), false);
  assert.equal(nearTitles('bir iki uc', 'bir iki uc'), false);
  const c = fresh();
  c.places = [{ ...c.places[0], id: 'reused', name: 'İĞDE MÜZESİ' }, { ...c.places[1], id: 'reused', name: 'igde muzesi' }];
  const id = identities(records(c));
  assert.deepEqual(id.duplicateIds[0], { value: 'reused', keys: ['place:reused', 'place:reused'] });
  assert.ok(id.exactTitles.some(g => g.value === 'igde muzesi'));
});

test('source checks cover nested provenance, within- and cross-record reuse and honest age bands', () => {
  for (const [value, expected] of [[undefined, 'missing'], ['2026-02-29', 'invalid'], ['2026-11-19', 'future'],
    ['2026-11-11', '0-7d'], ['2026-11-10', '>7-30d'], ['2026-10-18', '>30-90d'], ['2026-08-01', '>90d']] as const) {
    assert.equal(verificationBand(value, now), expected);
  }
  assert.equal(sourceUrl('').issue, 'missing');
  for (const url of ['https://', 'https://a b.com', 'http://example.org']) assert.equal(sourceUrl(url).issue, 'malformed');
  assert.equal(sourceUrl('https://example.org/?page=1#section').url, 'https://example.org/?page=1');
  const c = fresh();
  const p = { ...c.places[0], sourceUrl: 'https://example.org/', verifiedAt: '' };
  p.provenance = [{ kind: 'official', label: 'x', note: 'sample', url: 'https://example.org/#same', verifiedAt: '2026-11-19' }];
  c.places = [p, { ...c.places[1], sourceUrl: p.sourceUrl, provenance: undefined }];
  const s = sources(records(c).filter(r => r.kind === 'place'), now);
  assert.equal(s.issues.length, 3);
  assert.equal(s.rootOnlyCount, 2);
  assert.equal(s.repeatedWithinRecord.length, 1);
  assert.equal(s.reusedAcrossRecords, 1);
  assert.equal(s.hosts['example.org'], 3);
});

test('each supported layout partitions explicit, family, media and neutral; missing paths stay visible', () => {
  const c = fresh();
  c.places = [{ ...c.places[0], id: 'unreviewed' }];
  const a = artwork(c, records(c), () => false);
  assert.deepEqual(a.missingMappings, ['place:unreviewed']);
  for (const layout of ['Compact', 'Hero', 'Square']) {
    assert.equal(a.byKind.place[layout].neutral, 1);
    assert.equal(a.byKind.experience[layout].explicit, c.experiences.length);
    assert.equal(a.byKind.event[layout].family, c.events.length);
    assert.ok(a.unresolved.some(key => key.includes('/' + layout + ' ')));
  }
  c.guides[0].id = 'unmapped-guide';
  assert.deepEqual(artwork(c, records(c)).guides.missingGuideMedia, ['unmapped-guide']);
});

test('actual cache serialization, city ownership, metadata and version boundaries', async () => {
  const c = fresh(), m = await meta();
  const other = { ...c.places[0], cityId: 'not-in-registry' };
  assert.deepEqual(sourceCityOrphans(c.cities, { event: [], experience: [], guide: [], place: [other] }), ['place:' + other.id]);
  const good = await compatibility(c, records(c), m);
  assert.deepEqual(good.comparator, { equal: 0, revision10After2: 1, previousDay: -1, invalidDay: null, paddedRevision: null });
  assert.equal(good.cacheRoundTrip, true);
  assert.equal(good.cacheKey, '@napsak/catalog/v3/ankara');
  c.cities = [];
  const bad = await compatibility(c, records(c), { ...m, schemaVersion: -1 });
  assert.equal(bad.metadataCompatible, false);
  assert.equal(bad.cacheRoundTrip, false);
  assert.ok(bad.orphanCityRecords.includes('place:' + c.places[0].id));
  c.catalogVersion = '2026-02-30.1';
  assert.equal((await compatibility(c, records(c), m)).versionValid, false);
});

test('reviewed embedded snapshot and public default batches survive auditing without mutation', async () => {
  const c = embeddedCatalog(), original = JSON.stringify(c);
  // Captured on c4ec589 before implementation. A reviewed catalog release can explicitly rebaseline this contract.
  assert.equal(createHash('sha256').update(original).digest('hex'), '66cd7b2fbeab3592d2f8dc8720aaea5732b9d9cc2b8940cf2521ea444d9515da');
  const batches = () => (['event', 'experience', 'idea', 'place'] as const).map(filter => recommendAll({ ...c, filter, seed: 71,
    interests: ['Sanat'], dismissed: [], now: new Date('2026-10-12T21:00:00Z') }).map(i => i.id));
  const before = batches();
  assert.deepEqual(before, [
    ['event-amadeus-congresium-2026-10-16', 'event-ankara-kadin-orkestrasi-csoada-2026-11-02', 'event-bir-aile-provasi-ataturk-sanat-2026-11-01', 'event-cso-iki-keman-bir-miras-2026-10-16', 'event-falda-carmen-xl-ataturk-sanat-2026-10-31'],
    ['xp-gordion-halfday', 'xp-millet-kutuphanesi-derin-calisma', 'xp-anitkabir-maltepe', 'xp-kecioren-cocuk-sanat-muzesi-rehber', 'xp-gokyay-satranc-taslari'],
    ['idea-skill-swap', 'idea-soup-bread-table', 'idea-hourly-weather-observation', 'idea-jump-rope-rounds', 'idea-coffee-temperature-tasting'],
    ['cubuk-1-baraji-rekreasyon-alani', 'mta-tabiat-tarihi', 'mamak-fuzyon-bilim-merkezi', 'beypazari-tarihi-carsi', 'hamamonu'],
  ]);
  await audit(c, now, await meta());
  assert.equal(JSON.stringify(c), original);
  assert.deepEqual(batches(), before);
});
