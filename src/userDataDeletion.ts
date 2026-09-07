export type UserDataDeletionResult = {
  remoteUserStateDeleted: boolean;
  anonymousAccountDeleted: boolean;
  anonymousAccountDeletionFailed: boolean;
};

type UserDataDeletionSteps = {
  deleteRemoteUserState?: () => Promise<void>;
  clearLocalUserState: () => Promise<void>;
  deleteAnonymousAccount?: () => Promise<void>;
};

export async function runUserDataDeletion(steps: UserDataDeletionSteps): Promise<UserDataDeletionResult> {
  let remoteUserStateDeleted = false;
  if (steps.deleteRemoteUserState) {
    await steps.deleteRemoteUserState();
    remoteUserStateDeleted = true;
  }

  // Do not clear the only retryable local snapshot until remote deletion succeeds.
  await steps.clearLocalUserState();

  let anonymousAccountDeleted = false;
  let anonymousAccountDeletionFailed = false;
  if (steps.deleteAnonymousAccount) {
    try {
      await steps.deleteAnonymousAccount();
      anonymousAccountDeleted = true;
    } catch {
      // Local and Firestore user data are already gone. Report Auth separately;
      // never turn a best-effort anonymous-account failure into a false success.
      anonymousAccountDeletionFailed = true;
    }
  }

  return { remoteUserStateDeleted, anonymousAccountDeleted, anonymousAccountDeletionFailed };
}
