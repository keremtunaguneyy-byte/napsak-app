import type { PersistedPreferences } from './persistence';
import type { ResultFilter } from './resultFilters';

export type PreferenceField = 'mood' | 'interests' | 'budget' | 'groupSize' | 'duration';
export type PreferenceDraft = Pick<PersistedPreferences, PreferenceField>;
export type PreferenceEditorOrigin = 'home' | 'event_empty' | 'settings';
export type PreferenceEditorMode = 'overview' | 'field' | 'budget_only';
export type PreferenceEditorSession = {
  origin: { source: PreferenceEditorOrigin; filter: ResultFilter; seed: number; previousBatch: string[]; scrollY: number };
  mode: PreferenceEditorMode;
  field?: PreferenceField;
  draft: PreferenceDraft;
  fieldDraft: PreferenceDraft;
};
export type PreferenceEditorAction =
  | { type: 'open'; origin: PreferenceEditorSession['origin']; preferences: PreferenceDraft; budgetOnly?: boolean }
  | { type: 'field'; field: PreferenceField }
  | { type: 'change'; value: Partial<PreferenceDraft> }
  | { type: 'applyField' } | { type: 'cancelField' } | { type: 'back' } | { type: 'close' };

export function preferenceEditorReducer(session: PreferenceEditorSession | undefined, action: PreferenceEditorAction): PreferenceEditorSession | undefined {
  if (action.type === 'open') {
    const draft = { ...action.preferences, interests: [...action.preferences.interests] };
    return { origin: { ...action.origin, previousBatch: [...action.origin.previousBatch] }, draft, fieldDraft: draft, mode: action.budgetOnly ? 'budget_only' : 'overview', field: action.budgetOnly ? 'budget' : undefined };
  }
  if (!session || action.type === 'close') return undefined;
  if (action.type === 'field' && session.mode === 'budget_only') return session;
  if (action.type === 'field') return { ...session, mode: 'field', field: action.field, fieldDraft: session.draft };
  if (action.type === 'change' && session.field) {
    const field = session.mode === 'budget_only' ? 'budget' : session.field;
    if (!(field in action.value)) return session;
    return { ...session, fieldDraft: { ...session.fieldDraft, [field]: action.value[field] } };
  }
  if (action.type === 'applyField') return session.mode === 'budget_only' ? undefined : { ...session, mode: 'overview', draft: session.fieldDraft, field: undefined };
  if (action.type === 'cancelField' || action.type === 'back') return session.mode === 'field'
    ? { ...session, mode: 'overview', field: undefined, fieldDraft: session.draft } : undefined;
  return session;
}

/** Produces one compatible snapshot; Cancel/Back never call this boundary. */
export function applyPreferenceEditor(current: PersistedPreferences, session: PreferenceEditorSession): PersistedPreferences {
  const update = session.mode === 'budget_only' ? { budget: session.fieldDraft.budget } : session.draft;
  return { ...current, ...update };
}

export type PreferenceReturnFocus = 'preference' | 'event_action' | 'event_result' | 'settings' | 'hidden';
export function preferenceReturnFocus(origin: PreferenceEditorOrigin, applied: boolean): PreferenceReturnFocus {
  return origin === 'settings' ? 'settings' : origin === 'home' ? 'preference' : applied ? 'event_result' : 'event_action';
}

export const preferenceContentClearance = (footerHeight: number) => Math.max(112, footerHeight + 16);
