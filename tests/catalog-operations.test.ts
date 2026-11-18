import assert from 'node:assert/strict';
import { CLASSICS_COLLECTION_ID } from '../src/ankara101';
import { GUIDE_PRESENTATIONS, PRODUCTION_GUIDE_IDS } from '../src/ankara101Reader';
import { insiderRoutes } from '../src/data/insiderRoutes';
import { parseCatalogSnapshot } from '../src/data/catalogValidation';
import { resolveSavedEntries } from '../src/saved';
import { savedDestinations } from '../scripts/catalogOperations/savedDestinations';
import { guideMedia, guideRegistry } from '../scripts/catalogOperations/guideMedia';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  assert.equal(lifecycle(c, records(c), now).event.eligible, 3); // Optional end errors do not change the production start gate.
  assert.equal(health.upcomingCount, 3);
  assert.deepEqual(health.records.map(r => r.endState), ['future', 'unspecified', 'unspecified', 'invalid']);
  assert.equal(health.records[2].startQuality, 'runtime_parseable_noncanonical');
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
  assert.equal(nearTitles('bir iki uc dort', 'bir iki uc dort bes alti'), false); // 4/6 stays below 3/4.
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
  c.guides.push({ ...c.guides[0], id: 'unmapped-guide' });
  assert.deepEqual(artwork(c, records(c)).guides.unexpectedCatalogIds, ['unmapped-guide']);
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

test('embedded snapshot and public default batches survive auditing without mutation', async () => {
  const c = embeddedCatalog(), original = JSON.stringify(c);
  const batches = () => (['event', 'experience', 'idea', 'place'] as const).map(filter => recommendAll({ ...c, filter, seed: 71,
    interests: ['Sanat'], dismissed: [], now: new Date('2026-10-12T21:00:00Z') }).map(i => i.id));
  const before = batches();
  await audit(c, now, await meta());
  assert.equal(JSON.stringify(c), original);
  assert.deepEqual(batches(), before);
});

test('Saved reports the effective destination for both reserved keys and normal cross-kind shadowing', async () => {
  const c = fresh(), reserved = [CLASSICS_COLLECTION_ID, insiderRoutes[0].id];
  assert.deepEqual(resolveSavedEntries(reserved, c.ideas, c.guides, insiderRoutes).map(e => e.type), ['route', 'classics']);
  reserved.forEach((id, i) => { c.ideas[i].id = id; });
  assert.ok(parseCatalogSnapshot(c));
  const result = await audit(c, now, await meta());
  assert.equal(result.savedDestinations.passed, false);
  assert.deepEqual(result.savedDestinations.issues.map(i => [i.code, i.id, i.destinations.map(d => [d.family, d.selected])]), [
    ['saved_destination_collision', CLASSICS_COLLECTION_ID, [['classics', false], ['idea', true]]],
    ['saved_destination_collision', insiderRoutes[0].id, [['idea', true], ['route', false]]],
  ]);
  assert.ok(markdown(result).includes('saved_destination_collision'));
  c.ideas[2].id = c.events[0].id;
  assert.equal(savedDestinations(c).issues.find(i => i.id === c.events[0].id)?.destinations.find(d => d.selected)?.family, 'event');
  // City metadata is outside Saved. A deprecated public Place still participates.
  const independent = fresh();
  independent.cities[0].id = independent.ideas[0].id;
  assert.deepEqual(savedDestinations(independent).issues, []);
  independent.places[0] = { ...independent.places[0], id: CLASSICS_COLLECTION_ID, status: 'deprecated' };
  assert.equal(savedDestinations(independent).issues[0].destinations.find(d => d.selected)?.family, 'place');
});

test('Guide contract detects absent approved IDs, missing literal bindings, unresolved assets and alternate artwork', () => {
  const c = fresh(), id = PRODUCTION_GUIDE_IDS[0], key = GUIDE_PRESENTATIONS[id].mediaKey;
  const registry = readFileSync(guideRegistry, 'utf8');
  const intact = guideMedia(c.guides, registry);
  assert.equal(intact.passed, true);
  assert.equal(intact.resolved, PRODUCTION_GUIDE_IDS.length);
  assert.deepEqual(intact.missingGuideMedia, []);
  const target = intact.records.find(r => r.id === id)!;
  assert.equal(target.media, 'guide_media_explicit');
  assert.equal(target.fallback, false);
  const absent = guideMedia(c.guides.filter(g => g.id !== id), registry);
  assert.equal(absent.passed, false);
  assert.equal(absent.total, PRODUCTION_GUIDE_IDS.length);
  assert.equal(absent.resolved, absent.total - 1);
  assert.deepEqual(absent.missingGuideMedia, [id]);
  assert.deepEqual(absent.records.find(r => r.id === id)?.issues, ['guide_catalog_missing']);

  const line = registry.split('\n').find(l => l.includes(JSON.stringify(key)) && l.includes('require('))!;
  assert.ok(line);
  const revised = (replacement: string) => guideMedia(c.guides, registry.replace(line, replacement));
  for (const replacement of ['', '// ' + line]) {
    const report = revised(replacement);
    assert.equal(report.passed, false);
    assert.deepEqual(report.missingGuideMedia, [id]);
    assert.deepEqual(report.records.find(r => r.id === id)?.issues, ['guide_media_binding_missing', 'guide_media_fallback']);
  }
  assert.deepEqual(revised(line.replaceAll("'", '"')), intact);
  const unresolved = revised(line.replace(target.binding!, './missing.png'));
  assert.equal(unresolved.passed, false);
  assert.equal(unresolved.resolved, intact.total - 1);
  assert.equal(unresolved.records.find(r => r.id === id)?.media, 'guide_media_unresolved');
  const alternate = revised(line.replace(target.binding!, intact.records.find(r => r.id !== id)!.binding!));
  assert.deepEqual(alternate.records.find(r => r.id === id)?.issues, ['guide_media_alternate_asset', 'guide_media_fallback']);
});

test('public Event supply follows the supplied clock across the exact start with a fixed wall clock', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2040-01-01T00:00:00Z') });
  const c = fresh();
  const start = new Date('2027-03-02T09:00:00Z');
  c.events = c.events.slice(0, 5).map(e => ({ ...e, startsAt: '2027-03-02T12:00:00.0000+03:00',
    endsAt: undefined, verifiedAt: '2027-03-01', priceLevel: 0 }));
  const m = await meta();
  const before = await audit(c, new Date(+start - 1), m);
  const after = await audit(c, start, m);
  const batches = (r: typeof before) => r.scenarios.find(s => s.filter === 'event')!;
  assert.deepEqual([before.inventory.event.eligible, before.events.upcomingCount, batches(before).full], [5, 5, 25]);
  assert.deepEqual([after.inventory.event.eligible, after.events.upcomingCount, batches(after).empty], [0, 0, 25]);
  assert.match(markdown(before), /short_catalog_horizon.*required 7/);
});

test('a coordinate mismatch isolated to the second stop is reported even with a correct anchor', () => {
  const c = fresh(), plan = c.experiences.find(e => e.points.length > 1)!;
  assert.deepEqual(geography(c).failures, []);
  plan.points[1].latitude += 0.00001;
  assert.deepEqual(geography(c).failures, [{ id: plan.id, reasons: ['stop 2: coordinates differ from linked Place'] }]);
});

test('route label and malformed source diagnostics preserve the rest of the report', async () => {
  const c = fresh(), plan = c.experiences[0];
  plan.points[0].name = 'Different destination';
  plan.sources = [null as unknown as typeof plan.sources[number]];
  const result = await audit(c, now, await meta());
  assert.deepEqual(result.geography.failures, [{ id: plan.id, reasons: ['stop 1: label differs from linked Place and aliases'] }]);
  assert.ok(result.sources.issues.includes('experience:' + plan.id + ':invalid-source-entry-1'));
  assert.equal(result.compatibility.snapshotValid, false);
});

test('CLI replays both canonical files in independent processes and host time zones', t => {
  const out = mkdtempSync(join(tmpdir(), 'gezek-audit-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  for (const [index, zone] of ['UTC', 'UTC', 'America/Los_Angeles', 'Europe/Istanbul'].entries()) {
    const runDir = join(out, String(index));
    execFileSync(process.execPath, ['--import', 'tsx', 'scripts/auditCatalogOperations.ts', now.toISOString(), runDir],
      { env: { ...process.env, TZ: zone } });
    for (const name of ['audit.json', 'summary.md']) {
      assert.deepEqual(readFileSync(join(runDir, name)), readFileSync(join('docs/evidence/catalog-operations-quality', name)), zone + ' ' + name);
    }
  }
});
