import { isEventRecommendationEligible } from './contentPolicy';
import { recommendAll } from './recommendations';

export type EventPresentationState = 'load_error' | 'loading' | 'no_current_catalog' | 'all_dismissed' | 'budget_no_match' | 'populated';
export type CatalogLoadState = { loading: boolean; totalFailure: boolean; usable: boolean };
type Options = Parameters<typeof recommendAll>[0];

/** Diagnostic sets use the real Event engine. They never enter the visible feed. */
export function eventDiagnostics(options: Options) {
  const events = options.events ?? [];
  const base = { ...options, filter: 'event' as const, limit: Math.max(1, events.length), dismissed: [] };
  return {
    currentIds: events.filter(event => isEventRecommendationEligible(event, options.now ?? new Date())).map(event => event.id),
    preDismissIds: recommendAll(base).map(event => event.id),
    budgetRelaxedIds: recommendAll({ ...base, budget: 'Fark etmez' }).map(event => event.id),
  };
}

export function resolveEventPresentation(input: CatalogLoadState & ReturnType<typeof eventDiagnostics> & { dismissed: readonly string[]; visibleIds: readonly string[] }): EventPresentationState {
  if (input.totalFailure && !input.usable) return 'load_error';
  if (input.loading) return 'loading';
  if (!input.currentIds.length) return 'no_current_catalog';
  if (input.preDismissIds.length && input.preDismissIds.every(id => input.dismissed.includes(id))) return 'all_dismissed';
  if (!input.visibleIds.length && input.budgetRelaxedIds.length && !input.preDismissIds.length) return 'budget_no_match';
  if (input.visibleIds.length) return 'populated';
  throw new Error('Unmapped Event empty result: current, pre-dismiss, relaxed and visible sets disagree.');
}

/** No presentation timer: busy ends with the actual loader settlement. */
export async function runCatalogLoad<T>(load: () => Promise<T>, fallback: T | undefined, publish: (state: CatalogLoadState, snapshot?: T) => void, onFailure?: (error: unknown) => void) {
  publish({ loading: true, totalFailure: false, usable: fallback !== undefined });
  try {
    const snapshot = await load();
    publish({ loading: false, totalFailure: false, usable: true }, snapshot);
  } catch (error) {
    onFailure?.(error);
    publish({ loading: false, totalFailure: true, usable: fallback !== undefined }, fallback);
  }
}
