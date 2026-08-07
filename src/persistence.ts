import AsyncStorage from '@react-native-async-storage/async-storage';

import { uniqueIds } from './domain';
import { BudgetPreference, DurationPreference, GroupSizePreference, Interest, KNOWN_BUDGETS, KNOWN_DURATIONS, KNOWN_GROUP_SIZES, KNOWN_INTERESTS, KNOWN_MOODS, Mood } from './types';

const STORAGE_KEY = '@napsak/preferences/v4';
const LEGACY_STORAGE_KEYS = ['@napsak/preferences/v3', '@napsak/preferences/v2', '@napsak/preferences/v1'];

export type PersistedPreferences = {
  saved: string[];
  dismissed: string[];
  mood?: Mood;
  interests: Interest[];
  budget?: BudgetPreference;
  groupSize?: GroupSizePreference;
  duration?: DurationPreference;
  onboardingCompleted: boolean;
};

export const emptyPreferences: PersistedPreferences = {
  saved: [],
  dismissed: [],
  interests: [],
  onboardingCompleted: false,
};

function oneOf<T extends string>(value: unknown, values: readonly T[]): T | undefined {
  return typeof value === 'string' && values.includes(value as T) ? value as T : undefined;
}

function manyOf<T extends string>(value: unknown, values: readonly T[]): T[] {
  return uniqueIds(value).filter((item): item is T => values.includes(item as T));
}

export function migratePreferences(raw: unknown): PersistedPreferences {
  if (!raw || typeof raw !== 'object') return emptyPreferences;
  const value = raw as Partial<PersistedPreferences>;
  return {
    saved: uniqueIds(value.saved),
    dismissed: uniqueIds(value.dismissed),
    mood: oneOf(value.mood, KNOWN_MOODS),
    interests: manyOf(value.interests, KNOWN_INTERESTS),
    budget: oneOf(value.budget, KNOWN_BUDGETS),
    groupSize: oneOf(value.groupSize, KNOWN_GROUP_SIZES),
    duration: oneOf(value.duration, KNOWN_DURATIONS),
    onboardingCompleted: value.onboardingCompleted === true,
  };
}

export function serializePreferences(preferences: PersistedPreferences): string {
  return JSON.stringify(migratePreferences(preferences));
}

export function deserializePreferences(raw: string): PersistedPreferences {
  try {
    return migratePreferences(JSON.parse(raw));
  } catch {
    return emptyPreferences;
  }
}

export async function loadPreferences(): Promise<PersistedPreferences> {
  try {
    let raw = await AsyncStorage.getItem(STORAGE_KEY);
    for (const key of LEGACY_STORAGE_KEYS) raw = raw ?? await AsyncStorage.getItem(key);
    if (!raw) return emptyPreferences;
    return deserializePreferences(raw);
  } catch {
    return emptyPreferences;
  }
}

export async function savePreferences(preferences: PersistedPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, serializePreferences(preferences));
}
