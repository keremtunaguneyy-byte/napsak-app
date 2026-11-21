import { CatalogMeta, CatalogSnapshot } from '../../src/data/catalog';
import { KNOWN_INTERESTS } from '../../src/types';
import { artwork } from './artwork';
import { compatibility } from './compatibility';
import { districtInventory, supply, taxonomy } from './coverage';
import { eventHealth, geography, lifecycle } from './health';
import { compare, identities, occurrenceTime, kinds, records, verificationBand } from './records';
import { savedDestinations } from './savedDestinations';
import { sources } from './sources';

type Gap = { tier: number; area: string; metric: string; affected: number; total: number; followUp: string };

export async function audit(c: CatalogSnapshot, now: Date, meta: CatalogMeta) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid audit instant');
  const rows = records(c);
  const inventory = lifecycle(c, rows, now), events = eventHealth(c, now);
  const geo = geography(c), identity = identities(rows), evidence = sources(rows, now);
  const saved = savedDestinations(c);
  const media = artwork(c, rows), version = await compatibility(c, rows, meta);
  // Only schema-valid rows can be offered to ranking. Preserve production input order and stop order.
  const valid = new Set(rows.filter(r => r.valid).map(r => r.item));
  const scenarios = supply({ ...c, places: c.places.filter(p => valid.has(p)), experiences: c.experiences.filter(e => valid.has(e)),
    ideas: c.ideas.filter(i => valid.has(i)), events: c.events.filter(e => valid.has(e) && Number.isFinite(occurrenceTime(e.startsAt))) }, now);
  const plansWithReservations = c.experiences.filter(e => ['recommended', 'required'].includes(e.reservation));
  const olderReservationEvidence = plansWithReservations.filter(e => verificationBand(e.lastVerifiedAt, now) === '>90d').map(e => e.id).sort();
  const gaps: Gap[] = [];
  function add(tier: number, area: string, metric: string, affected: number, total: number, followUp: string) {
    if (affected > 0) gaps.push({ tier, area, metric, affected, total, followUp });
  }
  add(1, 'Saved', 'ambiguous destination IDs', saved.issues.length, saved.distinctIds, 'source verification');
  add(1, 'catalog', 'snapshot rejected by runtime validator', Number(!version.snapshotValid), 1, 'staging/publish/rollback');
  add(1, 'catalog', 'embedded cache round-trip failed', Number(!version.cacheRoundTrip), 1, 'staging/publish/rollback');
  add(1, 'catalog', 'incompatible embedded metadata', Number(!version.metadataCompatible), 1, 'staging/publish/rollback');
  add(1, 'recommendation artwork', 'records with unresolved artwork or icons',
    new Set(media.unresolved.map(ref => ref.split('/')[0])).size, rows.length - c.guides.length, 'media/artwork');
  add(1, 'experience', 'ordered route integrity failures', geo.failures.length, geo.plansChecked, 'source verification');
  add(1, 'event', 'expired at start', events.expiredCount, events.totalCount, 'Event freshness');
  add(1, 'event', 'source verification older than 7 days', events.staleVerificationCount, events.totalCount, 'Event freshness');
  for (const s of scenarios) {
    const followUp = s.filter === 'event' ? 'Event freshness' : 'catalog expansion';
    add(2, s.filter, 'empty preference scenarios', s.empty, s.scenarios, followUp);
    add(3, s.filter, 'partial preference scenarios', s.partial, s.scenarios, followUp);
  }
  add(2, 'media', 'approved Guides failing presentation or media checks', media.guides.missingGuideMedia.length, media.guides.total, 'media/artwork');
  add(3, 'recommendation artwork', 'records without semantic mapping', media.missingMappings.length, rows.length - c.guides.length, 'media/artwork');
  add(3, 'source-bearing records', 'all valid source URLs point to host roots', evidence.rootOnlyCount, evidence.sourceBearingRecords, 'source verification');
  add(3, 'reservation-bearing plans', 'oldest linked evidence over 90 days', olderReservationEvidence.length, plansWithReservations.length, 'source verification');
  gaps.sort((a, b) => a.tier - b.tier || b.affected / b.total - a.affected / a.total || compare(a.area, b.area) || compare(a.metric, b.metric));
  return { reportSchema: 3, asOf: now.toISOString(), inventory, events, geography: { ...geo, districts: districtInventory(rows) }, identities: identity, savedDestinations: saved,
    interestColumns: [...KNOWN_INTERESTS].sort(), taxonomy: taxonomy(rows.filter(r => r.valid)), scenarios,
    sources: { ...evidence, plansWithReservations: plansWithReservations.length, olderReservationEvidence },
    artwork: media, compatibility: version, gaps };
}

export function markdown(r: Awaited<ReturnType<typeof audit>>) {
  const lines = ['# Ankara catalog operations audit', '', 'Reference instant `' + r.asOf + '`. Embedded version `' + r.compatibility.version + '`.', '',
    '| Content | Records | Eligible before preferences | Lifecycle |', '|---|---:|---:|---|'];
  for (const k of kinds) {
    const i = r.inventory[k];
    lines.push('| ' + [k, i.total, i.eligible ?? 'editorial', Object.entries(i.states).map(([s, n]) => s + ' ' + n).join(', ')].join(' | ') + ' |');
  }
  lines.push('', '## Measured gaps', '', '| Tier | Area | Metric | Affected / measured | Follow-up |', '|---:|---|---|---:|---|');
  for (const g of r.gaps) lines.push('| ' + [g.tier, g.area, g.metric, g.affected + ' / ' + g.total, g.followUp].join(' | ') + ' |');
  if (r.events.issues.length) {
    lines.push('', '## Event operations', '');
    for (const issue of r.events.issues) {
      const threshold = issue.actual !== undefined ? ' (actual ' + issue.actual + ', required ' + issue.required + ')' : '';
      lines.push('- `' + issue.code + '`' + threshold);
    }
  }
  lines.push('', '## Preference supply', '', '| Surface | Scenarios | Empty | Partial (1–4) | Full (5) |', '|---|---:|---:|---:|---:|');
  for (const s of r.scenarios) lines.push('| ' + [s.filter, s.scenarios, s.empty, s.partial, s.full].join(' | ') + ' |');
  lines.push('', '## Integrity and evidence', '',
    '- ' + (r.geography.plansChecked - r.geography.failures.length) + '/' + r.geography.plansChecked + ' routes passed ordered linkage and anchor checks across ' + r.geography.stopsChecked + ' stops.',
    '- ' + r.savedDestinations.issues.length + ' ambiguous Saved IDs across ' + r.savedDestinations.totalDestinations + ' destinations.',
    '- ' + r.identities.duplicateIds.length + ' stable-ID collision groups, ' + r.identities.exactTitles.length + ' groups share a normalized title, ' + r.identities.nearTitles.length + ' near-title pairs.',
    '- ' + r.sources.reusedAcrossRecords + ' distinct URLs appear on multiple records. ' + r.sources.issues.length + ' source field issues.',
    '- ' + r.artwork.unresolved.length + ' unresolved recommendation artwork references. ' + r.artwork.guides.resolved + '/' + r.artwork.guides.total + ' approved Guides have the expected reader presentation and media.',
    '- Runtime snapshot validation ' + (r.compatibility.snapshotValid ? 'passed' : 'failed') + '. In-memory cache round-trip ' + (r.compatibility.cacheRoundTrip ? 'passed' : 'failed') + '.');
  for (const issue of r.savedDestinations.issues) lines.push('- `' + issue.code + '` ' + issue.id + ' — ' +
    issue.destinations.map(d => d.family + ' ' + d.title + (d.selected ? ' (opens)' : '')).join(', '));
  for (const guide of r.artwork.guides.records.filter(g => g.issues.length)) lines.push('- ' + guide.id + ' — ' + guide.issues.join(', '));
  for (const id of r.artwork.guides.unexpectedPresentationIds) lines.push('- ' + id + ' — guide_presentation_unapproved');
  lines.push('', 'The [JSON evidence](audit.json) contains district and interest counts, all Event dates, source-host counts and resolver outcomes by layout. The [implementation report](../../CATALOG_OPERATIONS_QUALITY_FOUNDATION_REPORT.md) defines the denominators, severity and follow-up work.', '');
  return lines.join('\n');
}
