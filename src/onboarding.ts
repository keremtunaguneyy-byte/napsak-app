import type { PersistedPreferences } from './persistence';
import type { PreferenceDraft, PreferenceField } from './preferenceEditor';

export const ONBOARDING_STEPS = ['welcome', 'mood', 'interest', 'budget', 'group', 'duration', 'preparing'] as const;
export type OnboardingStep = typeof ONBOARDING_STEPS[number];
export const ONBOARDING_PREPARING_MS = 4800;
export type OnboardingSession = {
  step: OnboardingStep;
  draft: PreferenceDraft;
  prepared: boolean;
  busy: boolean;
  revision: number;
  direction: 'forward' | 'back';
};
export type OnboardingAction =
  | { type: 'change'; value: Partial<PreferenceDraft> }
  | { type: 'next' } | { type: 'back' } | { type: 'prepared' }
  | { type: 'saving' } | { type: 'failed' };

const fields: Partial<Record<OnboardingStep, PreferenceField>> = { mood: 'mood', interest: 'interests', budget: 'budget', group: 'groupSize', duration: 'duration' };

/** The existing completion flag is authoritative, including legacy empty interests. */
export const firstRunRequired = (preferences: PersistedPreferences) => !preferences.onboardingCompleted;

/** No new storage: legacy unfinished snapshots resume at the first missing answer. */
export function createOnboardingSession(preferences: PersistedPreferences): OnboardingSession {
  const draft: PreferenceDraft = { mood: preferences.mood, interests: [...preferences.interests], budget: preferences.budget, groupSize: preferences.groupSize, duration: preferences.duration };
  const step: OnboardingStep = !draft.mood ? 'welcome' : !draft.interests.length ? 'interest' : !draft.budget ? 'budget' : !draft.groupSize ? 'group' : 'duration';
  return { step, draft, prepared: false, busy: false, revision: 0, direction: 'forward' };
}

export function canContinueOnboarding(session: OnboardingSession): boolean {
  if (session.busy) return false;
  if (session.step === 'welcome') return true;
  if (session.step === 'preparing') return session.prepared;
  const field = fields[session.step]!;
  return field === 'interests' ? session.draft.interests.length > 0 : !!session.draft[field];
}

export function onboardingReducer(session: OnboardingSession, action: OnboardingAction): OnboardingSession {
  if (session.busy && action.type !== 'failed') return session;
  if (action.type === 'change') {
    const field = fields[session.step];
    if (!field || !(field in action.value)) return session;
    const value = field === 'interests' ? [...(action.value.interests ?? [])] : action.value[field];
    return { ...session, draft: { ...session.draft, [field]: value } };
  }
  if (action.type === 'next') {
    if (!canContinueOnboarding(session) || session.step === 'preparing') return session;
    return { ...session, step: ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(session.step) + 1], revision: session.revision + 1, direction: 'forward' };
  }
  if (action.type === 'back') {
    const index = ONBOARDING_STEPS.indexOf(session.step);
    // Preparing/Ready have no approved Back or Close action. Welcome uses OS exit.
    if (!index || session.step === 'preparing') return session;
    return { ...session, step: ONBOARDING_STEPS[index - 1], revision: session.revision + 1, direction: 'back' };
  }
  if (action.type === 'prepared' && session.step === 'preparing') return { ...session, prepared: true };
  if (action.type === 'saving' && canContinueOnboarding(session) && session.step === 'preparing') return { ...session, busy: true };
  if (action.type === 'failed') return { ...session, busy: false };
  return session;
}

export function onboardingSnapshot(current: PersistedPreferences, session: OnboardingSession, now: Date): PersistedPreferences {
  const { draft } = session;
  if (session.step !== 'preparing' || !session.prepared || !draft.mood || !draft.interests.length || !draft.budget || !draft.groupSize || !draft.duration) throw new Error('Onboarding is not ready to complete.');
  return { ...current, ...draft, interests: [...draft.interests], contextConfirmedAt: now.toISOString(), onboardingCompleted: true };
}

/** One write of the existing v5 snapshot; callers publish completion only after success. */
export async function commitOnboarding(current: PersistedPreferences, session: OnboardingSession, write: (preferences: PersistedPreferences) => Promise<void>, now = new Date()): Promise<PersistedPreferences> {
  const next = onboardingSnapshot(current, session, now);
  await write(next);
  return next;
}

export const onboardingFooterClearance = (height: number) => height + 16;
