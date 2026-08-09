import { Firestore, collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';

import { CATALOG_SCHEMA_VERSION, CatalogMeta, CatalogSnapshot } from '../data/catalog';
import { isCity, isEvent, isExperience, isIdea, isPlace, parseCatalogMeta } from '../data/catalogValidation';
import { ContentRepository } from '../data/contentRepository';
import { CityId } from '../types';

export const FIRESTORE_READ_LIMITS = {
  placesPerCity: 1500,
  experiencesPerCity: 500,
  eventsPerCity: 500,
  globalIdeas: 250,
} as const;

type Validator<T> = (value: unknown) => value is T;

export class FirestoreContentRepository implements ContentRepository {
  constructor(private readonly db: Firestore) {}

  async getCatalogMeta(cityId: CityId): Promise<CatalogMeta | undefined> {
    const snapshot = await getDoc(doc(this.db, 'catalogMeta', cityId));
    if (!snapshot.exists()) return undefined;
    const meta = parseCatalogMeta(snapshot.data());
    if (!meta || meta.cityId !== cityId) throw new Error(`Invalid catalog metadata for ${cityId}.`);
    return meta;
  }

  private async readBounded<T extends { id: string }>(name: string, maximum: number, validate: Validator<T>, cityId?: CityId): Promise<T[]> {
    const ref = collection(this.db, name);
    const bounded = cityId
      ? query(ref, where('cityId', '==', cityId), limit(maximum + 1))
      : query(ref, limit(maximum + 1));
    const snapshot = await getDocs(bounded);
    if (snapshot.size > maximum) throw new Error(`${name} exceeds the ${maximum}-document refresh safety boundary.`);
    return snapshot.docs.map(item => {
      const value = item.data();
      if (!validate(value) || value.id !== item.id) throw new Error(`Invalid ${name} document: ${item.id}`);
      return value;
    }).sort((a, b) => a.id.localeCompare(b.id));
  }

  async getCatalog(cityId: CityId, expectedMeta?: CatalogMeta): Promise<CatalogSnapshot> {
    const meta = expectedMeta ?? await this.getCatalogMeta(cityId);
    if (!meta) throw new Error(`Catalog metadata not found for ${cityId}.`);
    if (meta.schemaVersion !== CATALOG_SCHEMA_VERSION) throw new Error(`Unsupported remote catalog schema ${meta.schemaVersion}.`);

    const [citySnapshot, places, experiences, events, ideas] = await Promise.all([
      getDoc(doc(this.db, 'cities', cityId)),
      this.readBounded('places', FIRESTORE_READ_LIMITS.placesPerCity, isPlace, cityId),
      this.readBounded('experiences', FIRESTORE_READ_LIMITS.experiencesPerCity, isExperience, cityId),
      this.readBounded('events', FIRESTORE_READ_LIMITS.eventsPerCity, isEvent, cityId),
      this.readBounded('ideas', FIRESTORE_READ_LIMITS.globalIdeas, isIdea),
    ]);
    const city = citySnapshot.data();
    if (!citySnapshot.exists() || !isCity(city) || city.id !== cityId) {
      throw new Error(`Invalid city document: ${cityId}`);
    }
    return {
      cityId,
      schemaVersion: CATALOG_SCHEMA_VERSION,
      catalogVersion: meta.catalogVersion,
      fetchedAt: new Date().toISOString(),
      cities: [city],
      places,
      experiences,
      events,
      ideas,
    };
  }
}
