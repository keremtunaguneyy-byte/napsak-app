import { CatalogMeta, CatalogSnapshot, embeddedCatalog } from './catalog';
import { CityId } from '../types';

export interface ContentRepository {
  getCatalogMeta(cityId: CityId): Promise<CatalogMeta | undefined>;
  getCatalog(cityId: CityId, expectedMeta?: CatalogMeta): Promise<CatalogSnapshot>;
}

export class EmbeddedContentRepository implements ContentRepository {
  async getCatalogMeta(cityId: CityId): Promise<CatalogMeta> {
    const catalog = embeddedCatalog(cityId);
    return {
      cityId,
      schemaVersion: catalog.schemaVersion,
      catalogVersion: catalog.catalogVersion,
      updatedAt: catalog.fetchedAt,
    };
  }

  async getCatalog(cityId: CityId, _expectedMeta?: CatalogMeta): Promise<CatalogSnapshot> {
    return embeddedCatalog(cityId);
  }
}
