import { cities } from './cities';
import { events } from './events';
import { experiences } from './experiences';
import { ideas } from './ideas';
import { guides } from './guides';
import { places } from './places';
import { City, CityId, Event, Experience, Guide, Idea, Place } from '../types';

export const CATALOG_SCHEMA_VERSION = 1 as const;
export const EMBEDDED_CATALOG_VERSION = '2026-08-09.2';

export type CatalogMeta = {
  cityId: CityId;
  schemaVersion: number;
  catalogVersion: string;
  updatedAt: string;
};

export type CatalogSnapshot = {
  cityId: CityId;
  schemaVersion: typeof CATALOG_SCHEMA_VERSION;
  catalogVersion: string;
  fetchedAt: string;
  cities: City[];
  places: Place[];
  experiences: Experience[];
  events: Event[];
  ideas: Idea[];
  guides: Guide[];
};

export function embeddedCatalog(cityId: CityId = 'ankara'): CatalogSnapshot {
  return {
    cityId,
    schemaVersion: CATALOG_SCHEMA_VERSION,
    catalogVersion: EMBEDDED_CATALOG_VERSION,
    fetchedAt: '2026-08-09T00:00:00.000Z',
    cities: cities.filter(city => city.id === cityId),
    places: places.filter(place => place.cityId === cityId),
    experiences: experiences.filter(experience => experience.cityId === cityId),
    events: events.filter(event => event.cityId === cityId),
    // Current Ideas are intentionally city-independent evergreen content.
    ideas,
    guides: guides.filter(guide => guide.cityId === cityId),
  };
}
