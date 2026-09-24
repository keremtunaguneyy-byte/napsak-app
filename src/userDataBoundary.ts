import { PersistedPreferences } from './persistence';
import { runUserDataDeletion, UserDataDeletionResult } from './userDataDeletion';
import { UserRepository } from './firebase/userRepository';

type ActiveUser = {
  uid: string;
  repository: UserRepository;
};

export type UserDataDeletionContext = ActiveUser & {
  deleteAnonymousAccount?: () => Promise<void>;
};

type BoundedWait = <T>(operation: Promise<T>, timeoutMs: number, message: string) => Promise<T>;

export type UserDataBoundaryDependencies = {
  blockDeletedUserSync(uid: string): Promise<void>;
  clearPreferences(): Promise<void>;
  clearQueuedUserSync(): Promise<void>;
  enqueueUserSync(uid: string, preferences: PersistedPreferences): Promise<void>;
  flushUserSync(uid: string, repository: UserRepository): Promise<boolean>;
  isDeletedUserSyncBlocked(uid: string): Promise<boolean>;
  migrateLocalUserStateOnce(uid: string, repository: UserRepository, preferences: PersistedPreferences): Promise<void>;
  savePreferences(preferences: PersistedPreferences): Promise<void>;
  withBoundedWait: BoundedWait;
  onAnonymousAccountDeletionError?(error: unknown): void;
  onUserStateMigrationError?(error: unknown): void;
  onUserStateSyncError?(error: unknown): void;
};

export type UserDataBoundaryOptions = {
  pendingRemoteWaitMs?: number;
  remoteDeleteWaitMs?: number;
  authDeleteWaitMs?: number;
};

export class UserDataBoundary {
  private activeUser: ActiveUser | undefined;
  private remoteWork: Promise<void> = Promise.resolve();
  private localPersistenceWork: Promise<void> = Promise.resolve();
  private deletionGeneration = 0;
  private deletionInProgress = false;
  private readonly pendingRemoteWaitMs: number;
  private readonly remoteDeleteWaitMs: number;
  private readonly authDeleteWaitMs: number;

  constructor(
    private readonly dependencies: UserDataBoundaryDependencies,
    options: UserDataBoundaryOptions = {},
  ) {
    this.pendingRemoteWaitMs = options.pendingRemoteWaitMs ?? 5_000;
    this.remoteDeleteWaitMs = options.remoteDeleteWaitMs ?? 10_000;
    this.authDeleteWaitMs = options.authDeleteWaitMs ?? 10_000;
  }

  private serializeRemoteWork<T>(work: () => Promise<T>): Promise<T> {
    const result = this.remoteWork.then(work);
    this.remoteWork = result.then(() => undefined, () => undefined);
    return result;
  }

  private serializeLocalPersistence<T>(work: () => Promise<T>): Promise<T> {
    const result = this.localPersistenceWork.then(work);
    this.localPersistenceWork = result.then(() => undefined, () => undefined);
    return result;
  }

  async initializeUserState(
    uid: string,
    repository: UserRepository,
    preferences: PersistedPreferences,
  ): Promise<boolean> {
    const generation = this.deletionGeneration;
    return this.serializeRemoteWork(async () => {
      if (
        generation !== this.deletionGeneration
        || this.deletionInProgress
        || await this.dependencies.isDeletedUserSyncBlocked(uid)
      ) return false;
      this.activeUser = { uid, repository };
      try {
        await this.dependencies.migrateLocalUserStateOnce(uid, repository, preferences);
      } catch (error) {
        this.dependencies.onUserStateMigrationError?.(error);
        // Local state remains authoritative until a later flush succeeds.
        await this.dependencies.enqueueUserSync(uid, preferences);
      }
      return true;
    });
  }

  async persistPreferences(preferences: PersistedPreferences): Promise<void> {
    const generation = this.deletionGeneration;
    await this.serializeLocalPersistence(async () => {
      if (this.deletionInProgress || generation !== this.deletionGeneration) return;
      await this.dependencies.savePreferences(preferences);
    });
  }

  async queuePreferencesForRemoteSync(
    preferences: PersistedPreferences,
    currentUid: string | undefined,
  ): Promise<void> {
    const generation = this.deletionGeneration;
    await this.serializeRemoteWork(async () => {
      if (this.deletionInProgress || generation !== this.deletionGeneration) return;
      const current = this.activeUser?.uid === currentUid ? this.activeUser : undefined;
      if (currentUid && await this.dependencies.isDeletedUserSyncBlocked(currentUid)) return;
      if (!current && !preferences.saved.length && !preferences.dismissed.length && !preferences.interests.length) return;
      if (!currentUid) return;
      await this.dependencies.enqueueUserSync(currentUid, preferences);
      if (!current) return;
      try {
        await this.dependencies.flushUserSync(current.uid, current.repository);
      } catch (error) {
        this.dependencies.onUserStateSyncError?.(error);
        // The queued snapshot remains retryable after a failed remote save.
      }
    });
  }

  async deleteCurrentUserData(
    resolveContext: () => Promise<UserDataDeletionContext | undefined>,
  ): Promise<UserDataDeletionResult> {
    if (this.deletionInProgress) throw new Error('User data deletion is already in progress.');
    this.deletionInProgress = true;
    this.deletionGeneration += 1;
    try {
      await this.dependencies.withBoundedWait(
        this.remoteWork,
        this.pendingRemoteWaitMs,
        'Pending remote user sync did not finish.',
      );
      return await this.serializeRemoteWork(async () => {
        const context = await resolveContext();
        const repository = context
          ? this.activeUser?.uid === context.uid ? this.activeUser.repository : context.repository
          : undefined;
        const result = await runUserDataDeletion({
          blockRemoteUserSync: context ? () => this.dependencies.blockDeletedUserSync(context.uid) : undefined,
          deleteRemoteUserState: repository && context
            ? () => this.dependencies.withBoundedWait(
              repository.delete(context.uid),
              this.remoteDeleteWaitMs,
              'Remote user deletion timed out.',
            )
            : undefined,
          clearLocalUserState: () => this.serializeLocalPersistence(async () => {
            await this.dependencies.clearQueuedUserSync();
            await this.dependencies.clearPreferences();
          }),
          deleteAnonymousAccount: context?.deleteAnonymousAccount
            ? () => this.dependencies.withBoundedWait(
              context.deleteAnonymousAccount!(),
              this.authDeleteWaitMs,
              'Anonymous Auth deletion timed out.',
            )
            : undefined,
          onAnonymousAccountDeletionError: this.dependencies.onAnonymousAccountDeletionError,
        });
        this.activeUser = undefined;
        return result;
      });
    } finally {
      this.deletionInProgress = false;
    }
  }
}
