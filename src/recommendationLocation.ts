import { Coordinates, isValidCoordinates } from './domain';

// One deadline per requested check; this is never a repeating timer.
export const RECOMMENDATION_LOCATION_TIMEOUT_MS = 2000;
type Options = {
  cachedLocation: () => Coordinates | undefined;
  servicesEnabled: () => Promise<boolean>;
  foregroundPermission: () => Promise<{ status: string }>;
  invalidateLocation: () => void;
  schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  cancel?: (timer: ReturnType<typeof setTimeout>) => void;
};

/** The only source of location input for newly computed recommendation batches. */
export function createRecommendationLocationResolver({
  cachedLocation, servicesEnabled, foregroundPermission, invalidateLocation,
  schedule = setTimeout, cancel = clearTimeout,
}: Options) {
  let generation = 0;
  let latestCheck = 0;
  const active = new Set<() => void>();
  const resolve = async (): Promise<Coordinates | undefined> => {
    const coordinate = cachedLocation();
    if (!coordinate) return undefined;
    const request = generation;
    const check = ++latestCheck;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let finishDeadline!: (valid: false) => void;
    const stop = () => {
      if (timer !== undefined) cancel(timer);
      finishDeadline(false);
    };
    active.add(stop);
    try {
      // Each batch gets fresh reads. Sharing an older pending pair could reuse
      // its already-settled services result after a silent Quick Settings change.
      const valid = await Promise.race([
        Promise.allSettled([
          Promise.resolve().then(servicesEnabled), Promise.resolve().then(foregroundPermission),
        ]).then(([services, permission]) => isValidCoordinates(coordinate)
          && services.status === 'fulfilled' && services.value === true
          && permission.status === 'fulfilled' && permission.value?.status === 'granted'),
        new Promise<false>(done => { finishDeadline = done; timer = schedule(() => done(false), RECOMMENDATION_LOCATION_TIMEOUT_MS); }),
      ]);
      // An obsolete pair cannot validate input or discard a newer fix/check.
      if (request !== generation || cachedLocation() !== coordinate) return undefined;
      if (valid) return coordinate;
      if (check === latestCheck) invalidateLocation();
      return undefined;
    } finally {
      if (timer !== undefined) cancel(timer);
      active.delete(stop);
    }
  };
  return { cachedLocation, resolve, locationChanged: () => {
    generation++;
    for (const stop of active) stop();
    active.clear();
  } };
}

export type RecommendationLocationResolver = ReturnType<typeof createRecommendationLocationResolver>;
