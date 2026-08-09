import { CATALOG_SCHEMA_VERSION, CatalogSnapshot, embeddedCatalog } from './catalog';
import { loadCachedCatalog, saveCachedCatalog } from './catalogCache';
import { ContentRepository } from './contentRepository';
import { CityId } from '../types';

export type CatalogLoadSource = 'embedded' | 'cache' | 'remote';
export type CatalogLoadResult = { snapshot: CatalogSnapshot; source: CatalogLoadSource; remoteError?: string };

export async function loadBestCatalog(cityId: CityId, remote?: ContentRepository): Promise<CatalogLoadResult> {
  const embedded = embeddedCatalog(cityId);
  const cached = await loadCachedCatalog(cityId);
  const fallback = cached ?? embedded;
  const fallbackSource: CatalogLoadSource = cached ? 'cache' : 'embedded';
  if (!remote) return { snapshot: fallback, source: fallbackSource };

  try {
    const meta = await remote.getCatalogMeta(cityId);
    if (!meta || meta.schemaVersion !== CATALOG_SCHEMA_VERSION) {
      return { snapshot: fallback, source: fallbackSource, remoteError: 'Remote catalog schema is unavailable or incompatible.' };
    }
    if (cached?.catalogVersion === meta.catalogVersion) return { snapshot: cached, source: 'cache' };
    const snapshot = await remote.getCatalog(cityId, meta);
    if (snapshot.catalogVersion !== meta.catalogVersion) throw new Error('Catalog version changed during refresh.');
    await saveCachedCatalog(snapshot);
    return { snapshot, source: 'remote' };
  } catch (error) {
    return { snapshot: fallback, source: fallbackSource, remoteError: error instanceof Error ? error.message : 'Remote catalog unavailable.' };
  }
}
