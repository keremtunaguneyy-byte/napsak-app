export const LOCATION_REVALIDATION_DEBOUNCE_MS = 120;

type Options = {
  servicesEnabled: () => Promise<boolean>;
  foregroundPermission: () => Promise<{ status: string }>;
  invalidateLocation: () => void;
  schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  cancel?: (timer: ReturnType<typeof setTimeout>) => void;
};

/** Read-only foreground checks; serialize even obsolete native calls until both settle. */
export function createLocationValidityMonitor({
  servicesEnabled, foregroundPermission, invalidateLocation, schedule = setTimeout, cancel = clearTimeout,
}: Options) {
  let disposed = false;
  let usable = true;
  let generation = 0;
  let runningGeneration: number | undefined;
  let queued = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clearScheduled = () => {
    if (timer !== undefined) cancel(timer);
    timer = undefined;
  };
  const scheduleCheck = () => {
    clearScheduled();
    timer = schedule(() => { timer = undefined; void check(); }, LOCATION_REVALIDATION_DEBOUNCE_MS);
  };
  const check = async () => {
    if (disposed || !usable || runningGeneration !== undefined) return;
    const request = generation;
    runningGeneration = request;
    // allSettled prevents one rejected read from releasing the serial gate while
    // the other native call is still pending. Neither API prompts or gets a fix.
    const [services, permission] = await Promise.allSettled([
      Promise.resolve().then(servicesEnabled), Promise.resolve().then(foregroundPermission),
    ]);
    if (!disposed && usable && request === generation) {
      if (services.status !== 'fulfilled' || services.value !== true
        || permission.status !== 'fulfilled' || permission.value?.status !== 'granted') invalidateLocation();
    }
    runningGeneration = undefined;
    if (queued && !disposed && usable) {
      queued = false;
      scheduleCheck();
    }
  };
  const supersede = () => {
    generation++;
    queued = false;
    clearScheduled();
  };
  return {
    resume() {
      if (disposed) return;
      usable = true;
      if (runningGeneration !== undefined) {
        // Duplicate active/focus signals share the current check. Only a real
        // departure/source change needs a fresh serialized check afterward.
        if (runningGeneration !== generation) queued = true;
      } else scheduleCheck();
    },
    pause() { usable = false; supersede(); },
    locationChanged: supersede,
    dispose() { disposed = true; usable = false; supersede(); },
  };
}
