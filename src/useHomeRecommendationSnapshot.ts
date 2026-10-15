import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Coordinates } from './domain';
import type { RecommendationLocationResolver } from './recommendationLocation';
import type { ResultFilter } from './resultFilters';
import { createHomeSnapshotCache, HomeSnapshotKey } from './homeFilterSnapshots';

/** Semantic inputs own this request, not callback identity or live distance props.
 * Cache hits perform neither recommendation computation nor location preflight.
 * The shared Detail Host keeps its separate existing validated-batch hook.
 */
export function useHomeRecommendationSnapshot<T>(filter: ResultFilter, key: HomeSnapshotKey, enabled: boolean,
  compute: (coordinates?: Coordinates) => T, location: RecommendationLocationResolver | undefined, empty: T): T {
  const cache = useRef<ReturnType<typeof createHomeSnapshotCache<T>> | undefined>(undefined);
  cache.current ??= createHomeSnapshotCache<T>();
  const store = cache.current;
  const prepared = useMemo(() => {
    const cached = store.read(filter, key);
    if (cached !== undefined) return { ready: true, value: cached, compute };
    const immediate = enabled && !location?.cachedLocation();
    return { ready: immediate, value: immediate ? compute(undefined) : undefined, compute };
    // Fixed-length semantic key is the complete invalidation policy. Capturing
    // compute here freezes the inputs of this particular async request.
  }, [filter, enabled, location, ...key]);
  const visible = useRef<T | undefined>(undefined);
  const [completed, setCompleted] = useState<{ request: typeof prepared; value: T }>();
  const value = prepared.ready ? prepared.value as T : completed?.request === prepared ? completed.value : store.previous(filter) ?? visible.current ?? empty;
  useLayoutEffect(() => { if (enabled) visible.current = value; }, [value, enabled]);
  useLayoutEffect(() => {
    if (enabled && prepared.ready) store.write(filter, key, prepared.value as T);
  }, [prepared, enabled]);
  useEffect(() => {
    if (!enabled || prepared.ready || !location) return;
    let current = true;
    void location.resolve().then(coordinates => {
      if (!current) return;
      const safeCoordinates = coordinates === location.cachedLocation() ? coordinates : undefined;
      const next = prepared.compute(safeCoordinates);
      store.write(filter, key, next);
      setCompleted({ request: prepared, value: next });
    });
    return () => { current = false; };
  }, [prepared, enabled, location]);
  return value;
}
