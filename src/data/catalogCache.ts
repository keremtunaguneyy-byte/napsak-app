import AsyncStorage from '@react-native-async-storage/async-storage';

import { CatalogSnapshot } from './catalog';
import { parseCatalogSnapshot } from './catalogValidation';
import { CityId } from '../types';

const CACHE_PREFIX = '@napsak/catalog/v1/';
const MAX_CACHE_CHARS = 4_000_000;

export async function loadCachedCatalog(cityId: CityId): Promise<CatalogSnapshot | undefined> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${cityId}`);
    if (!raw || raw.length > MAX_CACHE_CHARS) return undefined;
    return parseCatalogSnapshot(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

export async function saveCachedCatalog(snapshot: CatalogSnapshot): Promise<void> {
  const validated = parseCatalogSnapshot(snapshot);
  if (!validated) throw new Error('Refusing to cache an invalid catalog snapshot.');
  const raw = JSON.stringify(validated);
  if (raw.length > MAX_CACHE_CHARS) throw new Error('Catalog cache exceeds the 4 MB safety boundary.');
  await AsyncStorage.setItem(`${CACHE_PREFIX}${snapshot.cityId}`, raw);
}
