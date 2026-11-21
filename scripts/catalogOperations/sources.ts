import { Experience } from '../../src/types';
import { collisions, compare, counts, Item, kinds, Row, verificationBand } from './records';

export function sourceUrl(value?: string) {
  if (value == null || value === '') return { issue: 'missing' };
  try {
    if (typeof value !== 'string' || !value.trim()) return { issue: 'malformed' };
    const u = new URL(value);
    if (!/^https:\/\//.test(value) || /\s/.test(value) || !u.hostname || u.username || u.password) return { issue: 'malformed' };
    u.hash = '';
    return { url: u.href, host: u.hostname, root: u.pathname === '/' && !u.search };
  } catch { return { issue: 'malformed' }; }
}

function isExperienceItem(item: Item): item is Experience {
  return 'kind' in item && item.kind === 'experience';
}

export function sources(rows: Row[], now: Date) {
  const references: [string, string][] = [], hosts: string[] = [], rootOnlyRecords: string[] = [];
  const issues: string[] = [], repeatedWithinRecord: string[] = [];
  const referenceDates: string[] = [], recordDates: [string, string][] = [];
  let sourceBearingRecords = 0;
  for (const { item, kind, key } of rows) {
    if ('kind' in item && item.kind === 'idea') continue; // Optional action links are not evidence.
    sourceBearingRecords++;
    const isPlan = isExperienceItem(item);
    const refs: { url?: string; date?: string; optional: boolean }[] = isPlan ? []
      : [{ url: item.sourceUrl, date: item.verifiedAt, optional: false }];
    const extra = isPlan ? item.sources : 'provenance' in item ? item.provenance : undefined;
    if (Array.isArray(extra)) {
      for (const [i, entry] of extra.entries()) {
        if (entry && typeof entry === 'object') refs.push({ url: entry.url, date: entry.verifiedAt, optional: !isPlan });
        else issues.push(key + ':invalid-source-entry-' + (i + 1));
      }
    } else if (extra !== undefined) issues.push(key + ':invalid-source-list');
    const date = verificationBand(isPlan ? item.lastVerifiedAt : item.verifiedAt, now);
    recordDates.push([kind, date]);
    if (['missing', 'invalid', 'future'].includes(date)) issues.push(key + ':record-date-' + date);
    if (!refs.length) issues.push(key + ':missing-sources');
    const seen = new Set<string>();
    let detailed = false;
    for (const [index, ref] of refs.entries()) {
      const age = verificationBand(ref.date, now);
      referenceDates.push(age);
      if (['missing', 'invalid', 'future'].includes(age)) issues.push(key + ':source-' + (index + 1) + '-date-' + age);
      if (ref.optional && ref.url === undefined) continue;
      const source = sourceUrl(ref.url);
      if (!source.url || !source.host) { issues.push(key + ':source-' + (index + 1) + '-url-' + source.issue); continue; }
      hosts.push(source.host);
      if (!source.root) detailed = true;
      if (seen.has(source.url)) repeatedWithinRecord.push(key + ' ' + source.url);
      else references.push([source.url, key]);
      seen.add(source.url);
    }
    if (seen.size && !detailed) rootOnlyRecords.push(key);
  }
  const reused = collisions(references).sort((a, b) => b.keys.length - a.keys.length || compare(a.value, b.value));
  return { sourceBearingRecords, validUrlOccurrences: hosts.length, hosts: counts(hosts), issues: issues.sort(compare),
    rootOnlyCount: rootOnlyRecords.length, rootOnlyExamples: rootOnlyRecords.sort(compare).slice(0, 8),
    referenceDateBands: counts(referenceDates), recordDateBands: Object.fromEntries(kinds.filter(k => k !== 'idea')
      .map(k => [k, counts(recordDates.filter(([kind]) => kind === k).map(([, band]) => band))])),
    repeatedWithinRecord: repeatedWithinRecord.sort(compare), reusedAcrossRecords: reused.length,
    topReused: reused.slice(0, 8).map(g => ({ url: g.value, records: g.keys.length, examples: g.keys.slice(0, 4) })) };
}
