import AsyncStorage from '@react-native-async-storage/async-storage';

import { uniqueIds } from './domain';

const STORAGE_KEY = '@napsak/preferences/v2';
const LEGACY_STORAGE_KEY = '@napsak/preferences/v1';

export type PersistedPreferences = {
  saved: string[];
  dismissed: string[];
  mood?: import('./types').Mood;
  interests: import('./types').Interest[];
  onboardingCompleted: boolean;
};

export const emptyPreferences: PersistedPreferences = {
  saved: [],
  dismissed: [],
  interests: [],
  onboardingCompleted: false,
};

const moods = ['Enerjik', 'Sakin', 'Sosyal', 'Meraklı'] as const;
const interests = ['Kahve', 'Sanat', 'Doğa', 'Lezzet', 'Etkinlik'] as const;

function oneOf<T extends string>(value: unknown, values: readonly T[]): T | undefined {
  return typeof value === 'string' && values.includes(value as T) ? value as T : undefined;
}

function manyOf<T extends string>(value: unknown, values: readonly T[]): T[] {
  return uniqueIds(value).filter((item): item is T => values.includes(item as T));
}

export async function loadPreferences(): Promise<PersistedPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY) ?? await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return emptyPreferences;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyPreferences;
    const value = parsed as Partial<PersistedPreferences>;
    return {
      saved: uniqueIds(value.saved),
      dismissed: uniqueIds(value.dismissed),
      mood: oneOf(value.mood, moods),
      interests: manyOf(value.interests, interests),
      onboardingCompleted: value.onboardingCompleted === true,
    };
  } catch {
    return emptyPreferences;
  }
}

export async function savePreferences(preferences: PersistedPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
