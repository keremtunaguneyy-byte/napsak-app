import type { CityId } from '../types';

// Leave room for document names, receipt fields and Firestore encoding below 1 MiB.
export const MAX_CATALOG_PAYLOAD_BYTES = 900 * 1024;
export const publicationHeadPath = (cityId: CityId) => `catalogMeta/${cityId}-published`;
export const releasePath = (cityId: CityId, version: string) => `${publicationHeadPath(cityId)}/releases/${version}`;

export const FIRESTORE_READ_LIMITS = {
  placesPerCity: 1500,
  experiencesPerCity: 500,
  eventsPerCity: 500,
  globalIdeas: 250,
  guidesPerCity: 250,
} as const;
