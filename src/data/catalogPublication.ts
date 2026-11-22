import type { CityId } from '../types';

// Leave room for document names, receipt fields and Firestore encoding below 1 MiB.
export const MAX_CATALOG_PAYLOAD_BYTES = 900 * 1024;

export function catalogPayloadFits(payload: string): boolean {
  if (payload.length > MAX_CATALOG_PAYLOAD_BYTES) return false;
  let bytes = 0;
  // Iteration combines surrogate pairs. A lone surrogate encodes as a
  // three-byte replacement character, just like other BMP code points here.
  for (const character of payload) {
    const codePoint = character.codePointAt(0)!;
    bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
    if (bytes > MAX_CATALOG_PAYLOAD_BYTES) return false;
  }
  return true;
}

export const publicationHeadPath = (cityId: CityId) => `catalogMeta/${cityId}-published`;
export const releasePath = (cityId: CityId, version: string) => `${publicationHeadPath(cityId)}/releases/${version}`;

export const FIRESTORE_READ_LIMITS = {
  placesPerCity: 1500,
  experiencesPerCity: 500,
  eventsPerCity: 500,
  globalIdeas: 250,
  guidesPerCity: 250,
} as const;
