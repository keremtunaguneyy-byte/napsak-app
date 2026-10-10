import { uniqueIds } from './domain';

export type ContentInteractions = { saved: string[]; dismissed: string[] };
export type ContentInteractionAction =
  | { type: 'hydrate'; value: ContentInteractions }
  | { type: 'toggleSave' | 'dismiss' | 'restore'; id: string }
  | { type: 'restoreAll' } | { type: 'clear' };

/** Dismiss wins when sanitizing older overlapping records; schema and ID order stay unchanged. */
export function exclusiveContentInteractions(value: ContentInteractions): ContentInteractions {
  const dismissed = uniqueIds(value.dismissed);
  return { saved: uniqueIds(value.saved).filter(id => !dismissed.includes(id)), dismissed };
}

export function contentInteractionReducer(state: ContentInteractions, action: ContentInteractionAction): ContentInteractions {
  if (action.type === 'hydrate') return exclusiveContentInteractions(action.value);
  if (action.type === 'clear') return { saved: [], dismissed: [] };
  if (action.type === 'restoreAll') return { ...state, dismissed: [] };
  const { id } = action;
  if (action.type === 'toggleSave') {
    if (state.dismissed.includes(id)) return state;
    return { ...state, saved: state.saved.includes(id) ? state.saved.filter(value => value !== id) : [...state.saved, id] };
  }
  if (action.type === 'dismiss') return {
    saved: state.saved.filter(value => value !== id),
    dismissed: state.dismissed.includes(id) ? state.dismissed : [...state.dismissed, id],
  };
  return { saved: state.saved.filter(value => value !== id), dismissed: state.dismissed.filter(value => value !== id) };
}
