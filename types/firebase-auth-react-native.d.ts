import '@firebase/auth';
import type { Persistence } from '@firebase/auth';

// @firebase/auth publishes getReactNativePersistence from its React Native
// runtime entry, while its top-level `types` export currently omits that one
// symbol. Metro resolves the RN runtime correctly; this augments only the
// missing public type used by Firebase's own RN implementation.
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
