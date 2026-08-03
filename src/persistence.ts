import AsyncStorage from '@react-native-async-storage/async-storage';

import { uniqueIds } from './domain';

const STORAGE_KEY = '@napsak/preferences/v1';

export type PersistedPreferences = {
  saved: string[];
  dismissed: string[];
};

export const emptyPreferences: PersistedPreferences = { saved: [], dismissed: [] };

export async function loadPreferences(): Promise<PersistedPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPreferences;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyPreferences;
    const value = parsed as Partial<PersistedPreferences>;
    return { saved: uniqueIds(value.saved), dismissed: uniqueIds(value.dismissed) };
  } catch {
    return emptyPreferences;
  }
}

export async function savePreferences(preferences: PersistedPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
