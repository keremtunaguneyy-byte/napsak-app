import { isExperiencePubliclyResolvable, isPlacePubliclyResolvable } from './contentPolicy';
import { googleMapsUrlForExperiencePoints } from './mapLinks';
import type { ResultFilter } from './resultFilters';
import type { Experience, Place } from './types';

export type DetailRoute = { kind: 'experience' | 'place'; id: string; reasons?: readonly string[] };
export type DetailFrame = DetailRoute & { scrollY: number; returnFocusKey?: string };
export type DetailOrigin = { screen: 'results' | 'saved'; filter: ResultFilter; seed: number; scrollY: number; focusKey: string };
export type DetailSession = { origin: DetailOrigin; history: DetailFrame[] };
export type DetailNavigationAction =
  | { type: 'open'; origin: DetailOrigin; route: DetailRoute }
  | { type: 'push'; route: DetailRoute; scrollY: number; focusKey: string }
  | { type: 'back' } | { type: 'close' };

/** Android Back and the visible Back control share this exact transition. */
export function detailNavigationReducer(state: DetailSession | undefined, action: DetailNavigationAction): DetailSession | undefined {
  if (action.type === 'open') return { origin: { ...action.origin }, history: [{ ...action.route, scrollY: 0 }] };
  if (!state || action.type === 'close') return undefined;
  if (action.type === 'back') return state.history.length > 1 ? { ...state, history: state.history.slice(0, -1) } : undefined;
  const existing = state.history.findIndex(frame => frame.kind === action.route.kind && frame.id === action.route.id);
  // Revisit the original frame, including its scroll/focus snapshot and reasons.
  if (existing >= 0) return { ...state, history: state.history.slice(0, existing + 1) };
  const history = state.history.slice();
  history[history.length - 1] = { ...history[history.length - 1], scrollY: action.scrollY, returnFocusKey: action.focusKey };
  return { ...state, history: [...history, { ...action.route, scrollY: 0 }] };
}

/** Resolution never depends on ranking, dismissal, a title, or an associated Place's plan list. */
export function resolveDetail(route: DetailRoute, experiences: readonly Experience[], places: readonly Place[]) {
  if (route.kind === 'place') return places.find(place => place.id === route.id && isPlacePubliclyResolvable(place));
  const plan = experiences.find(plan => plan.id === route.id);
  return plan && isExperiencePubliclyResolvable(plan, new Map(places.map(place => [place.id, place]))) ? plan : undefined;
}

export function detailExternalActions(item: Experience | Place) {
  const points = 'name' in item ? [{ ...item, placeId: item.id }] : item.points;
  const maps = googleMapsUrlForExperiencePoints(points);
  const source = 'name' in item ? item.sourceUrl : item.sources[0]?.url;
  return { maps, source: source && /^https?:\/\//.test(source) ? source : undefined };
}

export const DETAIL_CONTENT_CLEARANCE = 112;
export const DETAIL_UNDO_MS = 8_000;
export const DETAIL_UNDO_EXIT_MS = 180;
export type UndoNotice = { id: string; sequence: number; exiting?: boolean };
type Timer = ReturnType<typeof setTimeout>;
/** The latest dismissal owns the only timer; clearing a notice never changes persistence. */
export function createDismissUndo(
  onChange: (notice: UndoNotice | undefined) => void,
  restore: (id: string) => void,
  schedule: (callback: () => void, ms: number) => Timer = setTimeout,
  cancel: (timer: Timer) => void = clearTimeout,
) {
  let notice: UndoNotice | undefined;
  let timer: Timer | undefined;
  let sequence = 0;
  const clear = () => {
    if (timer !== undefined) cancel(timer);
    timer = undefined;
    notice = undefined;
    onChange(undefined);
  };
  return {
    clear,
    dismiss(id: string) {
      clear();
      const current = { id, sequence: ++sequence };
      notice = current;
      onChange(current);
      timer = schedule(() => {
        if (notice !== current) return;
        const exiting = { ...current, exiting: true };
        notice = exiting;
        onChange(exiting);
        timer = schedule(() => { if (notice === exiting) clear(); }, DETAIL_UNDO_EXIT_MS);
      }, DETAIL_UNDO_MS);
    },
    undo() {
      if (!notice || notice.exiting) return;
      const id = notice.id;
      clear(); // Consume before invoking persistence; a second press cannot restore twice.
      restore(id);
    },
  };
}
