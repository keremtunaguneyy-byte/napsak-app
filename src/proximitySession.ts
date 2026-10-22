import { Coordinates, isValidCoordinates } from './domain';

export const PROXIMITY_COPY = {
  label: 'Yakına öncelik ver', pending: 'Konum güncelleniyor',
  hint: 'Uygun öneriler arasında yakındaki seçeneklere daha fazla öncelik ver.',
  permission_denied: 'Yakın öneriler için konum izni gerekli.',
  services_unavailable: 'Yakın öneriler için telefonunun konumunu aç.',
  acquisition_failed: 'Konum alınamadı. Sana göre önerilerin korunuyor.',
  location_invalidated: 'Konum kullanılamadığı için Sana göre önerilerine döndük.',
} as const;
export type ProximityFailure = 'permission_denied' | 'services_unavailable' | 'acquisition_failed' | 'location_invalidated';
export type ProximityState = { status: 'off'; generation: number } | { status: 'acquiring'; generation: number }
  | { status: 'active'; generation: number; coordinates: Coordinates };
export type ProximityAction = { type: 'activate' | 'off' | 'cancel' | 'invalidate' }
  | { type: 'success'; generation: number; coordinates: Coordinates } | { type: 'failure'; generation: number };
export function proximityReducer(state: ProximityState, action: ProximityAction): ProximityState {
  if (action.type === 'activate') return state.status === 'off' ? { status: 'acquiring', generation: state.generation + 1 } : state;
  if (action.type === 'success' || action.type === 'failure') {
    if (state.status !== 'acquiring' || action.generation !== state.generation) return state;
    return action.type === 'success' && isValidCoordinates(action.coordinates)
      ? { status: 'active', generation: state.generation, coordinates: action.coordinates }
      : { status: 'off', generation: state.generation + 1 };
  }
  if (action.type === 'cancel' && state.status !== 'acquiring') return state;
  return state.status === 'off' ? state : { status: 'off', generation: state.generation + 1 };
}
export const PROXIMITY_ACQUISITION_TIMEOUT_MS = 20_000;
export const NEARBY_LOCATION_REUSE_MS = 60_000;
/** The reusable lease is private to this owner, never part of React state,
 * persistence, telemetry or errors. Its timestamp is monotonic process time.
 * Every read lazily clears expired/invalid provenance; off does not renew it. */
export function createProximitySession(options: {
  servicesEnabled: () => Promise<boolean>;
  foregroundPermission: () => Promise<{ status: string }>;
  requestPermission: () => Promise<{ status: string }>;
  currentPosition: () => Promise<{ coords: Coordinates }>;
  changed: (state: ProximityState, failure?: ProximityFailure) => void;
  acquired: (coordinates: Coordinates) => void;
  now?: () => number;
  schedule?: typeof setTimeout; cancel?: typeof clearTimeout;
}) {
  let state: ProximityState = { status: 'off', generation: 0 };
  let reusable: { coordinates: Coordinates; acceptedAt: number } | undefined;
  let disposed = false;
  const now = options.now ?? (() => performance.now());
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { if (timer !== undefined) (options.cancel ?? clearTimeout)(timer); timer = undefined; };
  const readReusable = () => {
    if (reusable) {
      const age = now() - reusable.acceptedAt;
      if (!isValidCoordinates(reusable.coordinates) || !Number.isFinite(age) || age < 0 || age >= NEARBY_LOCATION_REUSE_MS) reusable = undefined;
    }
    return reusable;
  };
  const accept = (coordinates: Coordinates) => {
    const acceptedAt = now();
    if (!isValidCoordinates(coordinates) || !Number.isFinite(acceptedAt)) { reusable = undefined; return undefined; }
    const finite = { latitude: coordinates.latitude, longitude: coordinates.longitude };
    reusable = { coordinates: finite, acceptedAt };
    return finite;
  };
  const send = (action: ProximityAction, failure?: ProximityFailure) => {
    if (disposed) return;
    const next = proximityReducer(state, action);
    if (next === state) return;
    state = next;
    if (state.status !== 'acquiring') clear();
    options.changed(state, failure);
  };
  return {
    state: () => state,
    async activate() {
      if (disposed || state.status !== 'off') return;
      send({ type: 'activate' });
      const generation = state.generation;
      const current = () => !disposed && state.status === 'acquiring' && state.generation === generation;
      const fail = (failure: ProximityFailure) => {
        if (current()) { reusable = undefined; send({ type: 'failure', generation }, failure); }
      };
      const publish = (coordinates: Coordinates) => {
        if (!current()) return;
        options.acquired(coordinates);
        send({ type: 'success', generation, coordinates });
      };
      timer = (options.schedule ?? setTimeout)(() => fail('acquisition_failed'), PROXIMITY_ACQUISITION_TIMEOUT_MS);
      try {
        const candidate = readReusable();
        if (candidate) {
          const [services, permission] = await Promise.allSettled([
            Promise.resolve().then(options.servicesEnabled), Promise.resolve().then(options.foregroundPermission),
          ]);
          if (!current()) return;
          // Recheck age and identity after the native reads. A concurrent cache
          // invalidation cannot be undone by an older successful status pair.
          if (services.status === 'fulfilled' && services.value === true
            && permission.status === 'fulfilled' && permission.value?.status === 'granted'
            && readReusable() === candidate) { publish(candidate.coordinates); return; }
          reusable = undefined;
        }
        if (!await options.servicesEnabled()) { fail('services_unavailable'); return; }
        if (!current()) return;
        const permission = await options.requestPermission();
        if (!current()) return;
        if (permission.status !== 'granted') { fail('permission_denied'); return; }
        const position = await options.currentPosition();
        if (!current()) return;
        if (!isValidCoordinates(position.coords)) { fail('acquisition_failed'); return; }
        // A cold A/filter preflight may reject an older cached fix while this
        // explicit request is pending. Only this request's own final statuses
        // decide whether its fresh result can establish the shared session.
        const [services, foreground] = await Promise.all([
          options.servicesEnabled(), options.foregroundPermission(),
        ]);
        if (!current()) return;
        if (!services) { fail('services_unavailable'); return; }
        if (foreground.status !== 'granted') { fail('permission_denied'); return; }
        const coordinates = accept(position.coords);
        if (!coordinates) { fail('acquisition_failed'); return; }
        publish(coordinates);
      } catch { fail('acquisition_failed'); }
    },
    off() { readReusable(); send({ type: 'off' }); },
    cancel() { readReusable(); send({ type: 'cancel' }); },
    invalidate() {
      reusable = undefined;
      send({ type: 'invalidate' }, state.status === 'active' ? 'location_invalidated' : undefined);
    },
    invalidateCachedLocation() {
      reusable = undefined;
      // A negative read about an old A cache must not cancel a newer explicit
      // acquisition just because the user changed Home filters.
      if (state.status === 'active') send({ type: 'invalidate' }, 'location_invalidated');
    },
    beginExplicitRefresh() { reusable = undefined; send({ type: 'off' }); },
    acceptExplicitLocation(coordinates: Coordinates) {
      if (disposed || state.status !== 'off') return undefined;
      return accept(coordinates);
    },
    dispose() { clear(); reusable = undefined; disposed = true; state = { status: 'off', generation: state.generation + 1 }; },
  };
}
