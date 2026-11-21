import { CATALOG_CACHE_NAMESPACE_VERSION, CATALOG_SCHEMA_VERSION, catalogCacheKey, CatalogMeta, CatalogSnapshot } from '../../src/data/catalog';
import { loadCachedCatalog, saveCachedCatalog } from '../../src/data/catalogCache';
import { parseCatalogMeta, parseCatalogSnapshot } from '../../src/data/catalogValidation';
import { compareCatalogVersions, isCatalogVersion } from '../../src/data/catalogVersion';
import { cities } from '../../src/data/cities';
import { events } from '../../src/data/events';
import { experiences } from '../../src/data/experiences';
import { guides } from '../../src/data/guides';
import { places } from '../../src/data/places';
import { instant, Row } from './records';

// embeddedCatalog filters by city before returning its slice. Check ownership at the source as well.
export function sourceCityOrphans(owners = cities, groups = { event: events, experience: experiences, guide: guides, place: places }) {
  const known = new Set(owners.map(city => city.id));
  return Object.entries(groups).flatMap(([kind, items]) =>
    items.filter(item => !known.has(item.cityId)).map(item => kind + ':' + item.id)).sort();
}

export async function compatibility(c: CatalogSnapshot, rows: Row[], meta: CatalogMeta) {
  const values = new Map<string, string>();
  const store = { getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); } };
  let cacheRoundTrip = false;
  try {
    await saveCachedCatalog(c, store);
    cacheRoundTrip = JSON.stringify(await loadCachedCatalog(c.cityId, store)) === JSON.stringify(c);
  } catch { /* Invalid and oversized snapshots cannot round-trip. */ }
  const cityIds = new Set(c.cities.map(city => city.id));
  const orphanCityRecords = rows.filter(({ item }) => 'cityId' in item && !cityIds.has(item.cityId)).map(r => r.key).sort();
  const parsed = parseCatalogMeta(meta);
  return { city: c.cityId, version: c.catalogVersion, versionValid: isCatalogVersion(c.catalogVersion),
    schema: c.schemaVersion, schemaCompatible: c.schemaVersion === CATALOG_SCHEMA_VERSION,
    namespace: CATALOG_CACHE_NAMESPACE_VERSION, cacheKey: catalogCacheKey(c.cityId), cacheRoundTrip,
    snapshotValid: !!parseCatalogSnapshot(c), orphanCityRecords, sourceCityOrphans: sourceCityOrphans(),
    metadataCompatible: !!parsed && cityIds.has(meta.cityId) && c.cityId === meta.cityId && meta.schemaVersion === CATALOG_SCHEMA_VERSION
      && meta.catalogVersion === c.catalogVersion && Number.isFinite(instant(meta.updatedAt)),
    comparator: { equal: compareCatalogVersions(c.catalogVersion, c.catalogVersion) ?? null,
      revision10After2: compareCatalogVersions('2024-02-29.10', '2024-02-29.2') ?? null,
      previousDay: compareCatalogVersions('2024-02-28.99', '2024-02-29.1') ?? null,
      invalidDay: compareCatalogVersions('2025-02-29.1', c.catalogVersion) ?? null,
      paddedRevision: compareCatalogVersions('2024-02-29.01', c.catalogVersion) ?? null } };
}
