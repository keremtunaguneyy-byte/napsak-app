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
/** RAM-only owner. Uncancellable OS responses cannot publish after departure,
 * timeout, invalidation, explicit update or a newer acquisition. No polling. */
export function createProximitySession(options: {
  servicesEnabled: () => Promise<boolean>;
  requestPermission: () => Promise<{ status: string }>;
  currentPosition: () => Promise<{ coords: Coordinates }>;
  changed: (state: ProximityState, failure?: ProximityFailure) => void;
  acquired: (coordinates: Coordinates) => void;
  schedule?: typeof setTimeout; cancel?: typeof clearTimeout;
}) {
  let state: ProximityState = { status: 'off', generation: 0 };
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { if (timer !== undefined) (options.cancel ?? clearTimeout)(timer); timer = undefined; };
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
      const fail = (failure: ProximityFailure) => { if (current()) send({ type: 'failure', generation }, failure); };
      timer = (options.schedule ?? setTimeout)(() => fail('acquisition_failed'), PROXIMITY_ACQUISITION_TIMEOUT_MS);
      try {
        if (!await options.servicesEnabled()) { fail('services_unavailable'); return; }
        if (!current()) return;
        const permission = await options.requestPermission();
        if (!current()) return;
        if (permission.status !== 'granted') { fail('permission_denied'); return; }
        const position = await options.currentPosition();
        if (!current()) return;
        if (!isValidCoordinates(position.coords)) { fail('acquisition_failed'); return; }
        // Copy only finite coordinates. This object is the nearby cache provenance.
        const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        options.acquired(coordinates);
        send({ type: 'success', generation, coordinates });
      } catch { fail('acquisition_failed'); }
    },
    off: () => send({ type: 'off' }),
    cancel: () => send({ type: 'cancel' }),
    invalidate: () => send({ type: 'invalidate' }, state.status === 'active' ? 'location_invalidated' : undefined),
    dispose() { clear(); disposed = true; state = { status: 'off', generation: state.generation + 1 }; },
  };
}
