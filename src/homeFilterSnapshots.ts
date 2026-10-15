import type { CatalogSnapshot } from './data/catalog';
import type { ResultFilter } from './resultFilters';

export const HOME_FILTERS: readonly ResultFilter[] = ['experience', 'place', 'event', 'idea'];
export type HomeFilterRun = { run: number; previousBatch: string[]; revision: number };
export type HomeFilterRuns = Record<ResultFilter, HomeFilterRun>;
export function createHomeFilterRuns(): HomeFilterRuns {
  const initial = (): HomeFilterRun => ({ run: 0, previousBatch: [], revision: 0 });
  return { experience: initial(), place: initial(), event: initial(), idea: initial() };
}
export function rotateHomeFilter(state: HomeFilterRuns, filter: ResultFilter, ids: readonly string[]): HomeFilterRuns {
  return { ...state, [filter]: { ...state[filter], run: state[filter].run + 1, previousBatch: [...ids] } };
}
/** Invalidation does not invent a rotation or discard the filter's seed/history. */
export function invalidateHomeFilters(state: HomeFilterRuns, filters = HOME_FILTERS): HomeFilterRuns {
  const next = { ...state };
  for (const filter of filters) next[filter] = { ...state[filter], revision: state[filter].revision + 1 };
  return next;
}

/** Computed only when a catalog is actually selected. Identical payloads, including
 * new deserialized instances/fetchedAt values, do not invalidate a batch.
 */
export function homeCatalogKeys(catalog: CatalogSnapshot): Record<ResultFilter, string> {
  const identity = [catalog.cityId, catalog.schemaVersion, catalog.catalogVersion];
  return {
    experience: JSON.stringify([...identity, catalog.experiences, catalog.places, catalog.events]),
    place: JSON.stringify([...identity, catalog.places]),
    event: JSON.stringify([...identity, catalog.events]),
    idea: JSON.stringify([...identity, catalog.ideas]),
  };
}
export function homeDismissalKeys(catalog: CatalogSnapshot, dismissed: readonly string[]): Record<ResultFilter, string> {
  const selected = new Set(dismissed);
  const key = (items: readonly { id: string }[]) => JSON.stringify(items.filter(item => selected.has(item.id)).map(item => item.id).sort());
  return { experience: key(catalog.experiences), place: key(catalog.places), event: key(catalog.events), idea: key(catalog.ideas) };
}
export type HomeSnapshotKey = readonly [catalog: string, preferences: string, dismissed: string, run: number, previousBatch: readonly string[], revision: number, eligibility: number];
export function homeSnapshotKey(filter: ResultFilter, state: HomeFilterRun, catalog: string, preferences: string, dismissed: string, now: Date): HomeSnapshotKey {
  return [catalog, preferences, dismissed, state.run, state.previousBatch, state.revision, filter === 'event' || filter === 'experience' ? now.getTime() : 0];
}
export function sameHomeSnapshotKey(a: HomeSnapshotKey, b: HomeSnapshotKey): boolean {
  return a.every((value, index) => Object.is(value, b[index]));
}
/** At most four entries. Old keys are invalid even while their rows provide a
 * same-filter presentation fallback during a real new batch's location preflight.
 */
export function createHomeSnapshotCache<T>() {
  const entries = new Map<ResultFilter, { key: HomeSnapshotKey; value: T }>();
  return {
    read(filter: ResultFilter, key: HomeSnapshotKey): T | undefined {
      const entry = entries.get(filter);
      return entry && sameHomeSnapshotKey(entry.key, key) ? entry.value : undefined;
    },
    previous: (filter: ResultFilter) => entries.get(filter)?.value,
    write(filter: ResultFilter, key: HomeSnapshotKey, value: T) { entries.set(filter, { key, value }); },
  };
}
