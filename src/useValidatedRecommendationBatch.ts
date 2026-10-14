import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Coordinates } from './domain';
import type { RecommendationLocationResolver } from './recommendationLocation';

/** Keep the visible snapshot while a new batch's cached location is checked.
 * Location presentation alone is deliberately absent from the dependencies.
 */
export function useValidatedRecommendationBatch<T>(
  compute: (coordinates?: Coordinates) => T,
  location: RecommendationLocationResolver | undefined,
  empty: T,
  scope?: string,
): T {
  const prepared = useMemo(() => {
    const immediate = !location?.cachedLocation();
    return { immediate, value: immediate ? compute(undefined) : undefined };
  }, [compute, location]);
  const [completed, setCompleted] = useState<{ compute: typeof compute; value: T }>();
  const previous = useRef({ scope, value: empty });
  const value = prepared.immediate ? prepared.value as T
    : completed?.compute === compute ? completed.value
      : previous.current.scope === scope ? previous.current.value : empty;
  useLayoutEffect(() => { previous.current = { scope, value }; }, [scope, value]);
  useEffect(() => {
    if (prepared.immediate || !location) return;
    let current = true;
    void location.resolve().then(coordinates => {
      // A lifecycle clear or newer fix can occur between promise resolution
      // and consumption. Never substitute a different, unchecked cached fix.
      const safeCoordinates = coordinates === location.cachedLocation() ? coordinates : undefined;
      if (current) setCompleted({ compute, value: compute(safeCoordinates) });
    });
    // Changed inputs/unmount cannot publish an obsolete batch after OS reads.
    return () => { current = false; };
  }, [prepared, compute, location]);
  return value;
}
