import type { UserDataDeletionResult } from './userDataDeletion';
import { SETTINGS_HIDDEN_COPY as T } from './settingsHiddenCopy';

type Button = { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void };
type Dependencies = {
  alert: (title: string, body: string, buttons: Button[]) => void;
  deleteData: () => Promise<UserDataDeletionResult>;
  reset: () => void; busy: (value: boolean) => void;
  failed: (error: unknown) => void; focusDelete: () => void;
};

export function deletionOutcome(result: UserDataDeletionResult) {
  return result.anonymousAccountDeletionFailed ? { title: T.partialTitle, body: T.partialBody }
    : { title: T.successTitle, body: result.remoteUserStateDeleted ? T.successConnected : T.successLocal };
}

/** Root-owned, synchronous tap latch. Navigation never cancels an accepted deletion. */
export function createSettingsDeletion(d: Dependencies) {
  let phase: 'idle' | 'confirm' | 'busy' | 'result' = 'idle';
  let alive = true;
  let generation = 0;
  return {
    busy: () => phase === 'busy',
    dispose() { alive = false; generation++; },
    request() {
      if (!alive || phase !== 'idle') return;
      phase = 'confirm';
      const token = ++generation;
      const current = () => alive && generation === token;
      d.alert(T.confirmTitle, T.confirmBody, [
        { text: T.cancel, style: 'cancel', onPress: () => {
          if (!current() || phase !== 'confirm') return;
          phase = 'idle'; generation++; d.focusDelete();
        } },
        { text: T.confirm, style: 'destructive', onPress: () => {
          if (!current() || phase !== 'confirm') return;
          phase = 'busy'; d.busy(true);
          void (async () => {
            let outcome;
            try {
              const result = await d.deleteData();
              if (!current()) return;
              d.reset(); outcome = deletionOutcome(result);
            } catch (error) {
              if (!current()) return;
              d.failed(error); outcome = { title: T.failureTitle, body: T.failureBody };
            }
            if (!current()) return;
            phase = 'result'; d.busy(false);
            d.alert(outcome.title, outcome.body, [{ text: T.ok, onPress: () => {
              if (!current() || phase !== 'result') return;
              phase = 'idle'; generation++;
              if (outcome.title === T.failureTitle) d.focusDelete();
            } }]);
          })();
        } },
      ]);
    },
  };
}
