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
  let pending: { generation: number; promise: Promise<Coordinates | undefined>; stop: () => void } | undefined;
  const resolve = async (): Promise<Coordinates | undefined> => {
    const coordinate = cachedLocation();
    if (!coordinate) return undefined;
    const request = generation;
    if (pending?.generation === request) return pending.promise;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let finishDeadline!: (valid: false) => void;
    const promise = (async () => {
      const valid = await Promise.race([
        Promise.allSettled([
          Promise.resolve().then(servicesEnabled), Promise.resolve().then(foregroundPermission),
        ]).then(([services, permission]) => isValidCoordinates(coordinate)
          && services.status === 'fulfilled' && services.value === true
          && permission.status === 'fulfilled' && permission.value?.status === 'granted'),
        new Promise<false>(done => { finishDeadline = done; timer = schedule(() => done(false), RECOMMENDATION_LOCATION_TIMEOUT_MS); }),
      ]);
      if (timer !== undefined) cancel(timer);
      // Never validate or discard a fix acquired after this pair began.
      if (request !== generation || cachedLocation() !== coordinate) return undefined;
      if (valid) return coordinate;
      invalidateLocation();
      return undefined;
    })();
    pending = { generation: request, promise, stop: () => {
      if (timer !== undefined) cancel(timer);
      finishDeadline(false);
    } };
    try { return await promise; }
    finally { if (pending?.promise === promise) pending = undefined; }
  };
  return { cachedLocation, resolve, locationChanged: () => {
    generation++;
    pending?.stop();
    pending = undefined;
  } };
}

export type RecommendationLocationResolver = ReturnType<typeof createRecommendationLocationResolver>;
