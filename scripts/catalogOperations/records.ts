import { normalizeContentIdentity } from '../../src/contentPolicy';
import { CatalogSnapshot } from '../../src/data/catalog';
import { isEvent, isExperience, isGuide, isIdea, isPlace } from '../../src/data/catalogValidation';
import { Event, Experience, Guide, Idea, Place } from '../../src/types';

export const kinds = ['event', 'experience', 'guide', 'idea', 'place'] as const;
export type Kind = typeof kinds[number];
export type Item = Event | Experience | Guide | Idea | Place;
export type Row = { kind: Kind; item: Item; key: string; title: string; valid: boolean };
export const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
export const unique = (values: string[]) => [...new Set(values)].sort(compare);
export function counts(values: string[]) {
  const result: Record<string, number> = Object.create(null);
  for (const value of values.sort(compare)) result[value] = (result[value] ?? 0) + 1;
  return result;
}
export function records(c: CatalogSnapshot): Row[] {
  function group<T extends Item>(kind: Kind, items: T[], validate: (item: T) => boolean) {
    return items.map(item => ({ kind, item, key: kind + ':' + item.id, valid: validate(item),
      title: normalizeContentIdentity(('name' in item ? item.name : item.title) ?? '') }));
  }
  return [...group('event', c.events, isEvent), ...group('experience', c.experiences, isExperience),
    ...group('guide', c.guides, isGuide), ...group('idea', c.ideas, isIdea), ...group('place', c.places, isPlace)]
    .sort((a, b) => compare(a.key, b.key));
}

export function collisions(entries: [string, string][]) {
  const groups = new Map<string, string[]>();
  for (const [value, key] of entries) {
    if (!value) continue;
    const keys = groups.get(value) ?? [];
    keys.push(key);
    groups.set(value, keys);
  }
  return [...groups].filter(([, keys]) => keys.length > 1).sort(([a], [b]) => compare(a, b))
    .map(([value, keys]) => ({ value, keys: keys.sort(compare) }));
}

// At least three distinct shared title words and Jaccard >= 0.75. Exact normalized titles have their own list.
export function nearTitles(left: string, right: string) {
  if (!left || !right || left === right) return false;
  const a = new Set(left.split(' ')), b = new Set(right.split(' '));
  const shared = [...a].filter(word => b.has(word)).length;
  return shared >= 3 && 4 * shared >= 3 * (a.size + b.size - shared);
}

export function identities(rows: Row[]) {
  const near: string[][] = [];
  for (const [index, a] of rows.entries()) {
    for (const b of rows.slice(index + 1)) if (nearTitles(a.title, b.title)) near.push([a.key, b.key]);
  }
  return { duplicateIds: collisions(rows.map(r => [r.item.id, r.key])),
    exactTitles: collisions(rows.map(r => [r.title, r.key])), nearTitles: near };
}

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
function calendarDay(value: string) {
  const millis = Date.parse(value + 'T00:00:00Z');
  return dateOnly.test(value) && Number.isFinite(millis) && new Date(millis).toISOString().slice(0, 10) === value;
}
export function instant(value: string | undefined) {
  if (!value || !/^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)$/.test(value)
    || !calendarDay(value.slice(0, 10))) return NaN;
  return Date.parse(value);
}
// For occurrence metrics use the same parser as production wherever the input specifies its zone.
export function occurrenceTime(value: string | undefined) {
  return typeof value === 'string' && /(?:Z|[+-]\d{2}:?\d{2}|\bGMT|\bUTC)$/i.test(value.trim()) ? Date.parse(value) : NaN;
}
export function verificationBand(value: string | undefined, now: Date) {
  if (value == null || value === '') return 'missing';
  if (typeof value !== 'string') return 'invalid';
  if (!calendarDay(value)) return 'invalid';
  const days = (now.getTime() - Date.parse(value + 'T00:00:00+03:00')) / 86400000;
  if (days < 0) return 'future';
  if (days <= 7) return '0-7d';
  if (days <= 30) return '>7-30d';
  if (days <= 90) return '>30-90d';
  return '>90d';
}
