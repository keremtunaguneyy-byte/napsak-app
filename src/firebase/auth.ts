import { Auth, User, signInAnonymously } from '@firebase/auth';

export async function ensureAnonymousUser(auth: Auth): Promise<User> {
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;
  return (await signInAnonymously(auth)).user;
}
