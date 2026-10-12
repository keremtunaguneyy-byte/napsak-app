import { CATALOG_SCHEMA_VERSION, CatalogSnapshot, embeddedCatalog } from './catalog';
import { CatalogCacheStorage, loadCachedCatalog, saveCachedCatalog } from './catalogCache';
import { compareCatalogVersions } from './catalogVersion';
import { parseCatalogMeta, parseCatalogSnapshot } from './catalogValidation';
import { ContentRepository } from './contentRepository';
import { CityId } from '../types';
import { withBoundedWait } from '../timeout';

const REMOTE_CATALOG_TIMEOUT_MS = 5_000;

export type CatalogLoadSource = 'embedded' | 'cache' | 'remote';
export type CatalogLoadResult = { snapshot: CatalogSnapshot; source: CatalogLoadSource; remoteError?: string };

export async function loadBestCatalog(cityId: CityId, remote?: ContentRepository, storage?: CatalogCacheStorage): Promise<CatalogLoadResult> {
  const embedded = embeddedCatalog(cityId);
  const cached = await loadCachedCatalog(cityId, storage);
  const cacheOrder = cached && compareCatalogVersions(cached.catalogVersion, embedded.catalogVersion);
  const useCache = cacheOrder === 0 || cacheOrder === 1;
  const fallback = useCache ? cached! : embedded;
  const fallbackSource: CatalogLoadSource = useCache ? 'cache' : 'embedded';
  if (!remote) return { snapshot: fallback, source: fallbackSource };

  try {
    const meta = parseCatalogMeta(await withBoundedWait(remote.getCatalogMeta(cityId), REMOTE_CATALOG_TIMEOUT_MS, 'Remote catalog metadata timed out.'));
    if (!meta || meta.cityId !== cityId || meta.schemaVersion !== CATALOG_SCHEMA_VERSION) {
      return { snapshot: fallback, source: fallbackSource, remoteError: 'Remote catalog metadata is unavailable, invalid or incompatible.' };
    }
    const remoteOrder = compareCatalogVersions(meta.catalogVersion, fallback.catalogVersion);
    if (remoteOrder === undefined) throw new Error('Invalid remote catalog version.');
    if (remoteOrder <= 0) return { snapshot: fallback, source: fallbackSource };
    const snapshot = parseCatalogSnapshot(await withBoundedWait(remote.getCatalog(cityId, meta), REMOTE_CATALOG_TIMEOUT_MS, 'Remote catalog refresh timed out.'));
    if (!snapshot || snapshot.cityId !== cityId) throw new Error('Remote catalog snapshot is invalid or incompatible.');
    if (snapshot.catalogVersion !== meta.catalogVersion) throw new Error('Catalog version changed during refresh.');
    await saveCachedCatalog(snapshot, storage);
    return { snapshot, source: 'remote' };
  } catch (error) {
    return { snapshot: fallback, source: fallbackSource, remoteError: error instanceof Error ? error.message : 'Remote catalog unavailable.' };
  }
}
