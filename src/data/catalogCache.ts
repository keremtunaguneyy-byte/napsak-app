import AsyncStorage from '@react-native-async-storage/async-storage';

import { catalogCacheKey, CatalogSnapshot } from './catalog';
import { parseCatalogSnapshot } from './catalogValidation';
import { CityId } from '../types';

const MAX_CACHE_CHARS = 4_000_000;

export async function loadCachedCatalog(cityId: CityId): Promise<CatalogSnapshot | undefined> {
  try {
    const raw = await AsyncStorage.getItem(catalogCacheKey(cityId));
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
  await AsyncStorage.setItem(catalogCacheKey(snapshot.cityId), raw);
}
