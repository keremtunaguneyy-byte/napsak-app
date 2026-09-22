import { Auth, User, signInAnonymously } from '@firebase/auth';
import { withBoundedWait } from '../timeout';

export const AUTH_STARTUP_TIMEOUT_MS = 5_000;

export async function ensureAnonymousUser(auth: Auth, timeoutMs = AUTH_STARTUP_TIMEOUT_MS): Promise<User> {
  return withBoundedWait((async () => {
    await auth.authStateReady();
    if (auth.currentUser) return auth.currentUser;
    return (await signInAnonymously(auth)).user;
  })(), timeoutMs, 'Anonymous Auth initialization timed out.');
}
