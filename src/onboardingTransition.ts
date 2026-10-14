/** Each keyed scene constructs this position before its first native commit. */
export const onboardingInitialTranslation = (direction: 'forward' | 'back', width: number, reduced: boolean) => reduced ? 0 : direction === 'back' ? -width : width;

export const ONBOARDING_SLIDE_MS = { forward: 280, back: 240 } as const;

type TransitionEffects = {
  frame: (callback: () => void) => number;
  cancelFrame: (id: number) => void;
  start: (complete: (finished: boolean) => void) => () => void;
  rest: () => void;
  focus: () => void;
};

/** Called after layout commit. A cancelled scene can neither animate nor focus again. */
export function beginOnboardingTransition(effects: TransitionEffects, reduced: boolean) {
  let phase: 'waiting' | 'running' | 'settled' | 'cancelled' = 'waiting';
  const frames = new Set<number>();
  let stop: (() => void) | undefined;
  const frame = (callback: () => void) => {
    const id = effects.frame(() => {
      frames.delete(id);
      if (phase !== 'cancelled') callback();
    });
    frames.add(id);
  };
  const cancelFrames = () => { frames.forEach(effects.cancelFrame); frames.clear(); };
  const focus = () => frame(() => frame(effects.focus));
  const reduceMotion = () => {
    if (phase === 'settled' || phase === 'cancelled') return;
    phase = 'settled';
    cancelFrames();
    stop?.();
    effects.rest();
    focus();
  };
  if (reduced) reduceMotion();
  else {
    // The keyed value is already committed by the caller's layout effect.
    // Animated owns the first animation frame; a second RAF would delay entry.
    phase = 'running';
    stop = effects.start(finished => {
      if (phase !== 'running') return;
      phase = 'settled';
      // An interrupted surviving scene must not remain stranded off-screen.
      if (!finished) { effects.rest(); return; }
      focus();
    });
  }
  return {
    reduceMotion,
    cancel: () => {
      phase = 'cancelled';
      cancelFrames();
      stop?.();
    },
  };
}
