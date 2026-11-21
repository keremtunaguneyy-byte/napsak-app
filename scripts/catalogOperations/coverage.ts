import { normalizeContentIdentity } from '../../src/contentPolicy';
import { CatalogSnapshot } from '../../src/data/catalog';
import { recommendAll } from '../../src/recommendations';
import { KNOWN_BUDGETS, KNOWN_DURATIONS, KNOWN_INTERESTS, RecommendationKind } from '../../src/types';
import { counts, Item, kinds, Row, unique } from './records';

function tags(item: Item) {
  if ('primaryInterests' in item) return unique([...item.primaryInterests, ...item.secondaryInterests]);
  if ('interests' in item) return unique([item.category, ...item.interests]);
  return [];
}
function duration(item: Item) {
  const max = 'maxDurationMinutes' in item ? item.maxDurationMinutes
    : 'typicalDurationMinutes' in item ? item.typicalDurationMinutes?.max : undefined;
  if (max === undefined) return 'unmodeled';
  if (max <= 60) return '<=60';
  if (max <= 120) return '61-120';
  if (max <= 240) return '121-240';
  if (max <= 360) return '241-360';
  return '>360';
}
function district(item: Item) {
  if (!('district' in item)) return 'kind' in item && ['event', 'idea'].includes(item.kind) ? 'unmodeled' : 'unknown';
  const label = normalizeContentIdentity(item.district ?? '');
  return !label || ['unknown', 'bilinmiyor', 'belirsiz'].includes(label) ? 'unknown' : label;
}

export function districtInventory(rows: Row[]) {
  return Object.fromEntries(kinds.map(kind => [kind, counts(rows.filter(r => r.kind === kind).map(r => district(r.item)))]));
}

export function taxonomy(rows: Row[]) {
  return Object.fromEntries(kinds.map(kind => {
    const items = rows.filter(r => r.kind === kind).map(r => r.item);
    function intersection(dimension: (item: Item) => string) {
      return Object.fromEntries(unique(items.map(dimension)).filter(d => d !== 'unmodeled').map(d =>
        [d, [...KNOWN_INTERESTS].sort().map(tag => items.filter(i => dimension(i) === d && tags(i).includes(tag)).length)]));
    }
    const price = (i: Item) => 'priceLevel' in i ? String(i.priceLevel) : 'unmodeled';
    return [kind, { categories: counts(items.map(i => i.category)), interests: counts(items.flatMap(tags)),
      moods: counts(items.flatMap(i => 'moods' in i ? i.moods : [])),
      groups: counts(items.flatMap(i => 'groupSizes' in i ? i.groupSizes : [])),
      priceLevels: counts(items.map(price)), durationMaximums: counts(items.map(duration)),
      districtInterest: kind === 'guide' ? {} : intersection(district), priceInterest: intersection(price), durationInterest: intersection(duration) }];
  }));
}

export function supply(c: CatalogSnapshot, now: Date) {
  const results = [];
  const filters: RecommendationKind[] = ['event', 'experience', 'idea', 'place'];
  for (const filter of filters) {
    let empty = 0, partial = 0, full = 0;
    const gapsByInterest: string[] = [];
    const underfilled = new Map<string, string[]>();
    for (const interest of [...KNOWN_INTERESTS].sort()) {
      for (const budget of [...KNOWN_BUDGETS].sort()) {
        const durations = filter === 'experience' ? [...KNOWN_DURATIONS].sort() : [undefined];
        for (const duration of durations) {
          const size = recommendAll({ ...c, filter, interests: [interest], budget, duration,
            dismissed: [], limit: 5, seed: 71, now }).length;
          if (size === 5) { full++; continue; }
          if (size === 0) empty++; else partial++;
          gapsByInterest.push(interest);
          const combination = [interest, duration, size + '/5'].filter(Boolean).join(' | ');
          const budgets = underfilled.get(combination) ?? [];
          budgets.push(budget);
          underfilled.set(combination, budgets);
        }
      }
    }
    results.push({ filter, scenarios: empty + partial + full, empty, partial, full, gapsByInterest: counts(gapsByInterest),
      underfilledBudgets: Object.fromEntries([...underfilled.keys()].sort().map(k => [k, underfilled.get(k)!.sort()])) });
  }
  return results;
}
