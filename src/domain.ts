export type Coordinates = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => degrees * Math.PI / 180;

/** Returns the great-circle distance between two coordinates in kilometres. */
export function distanceInKm(from: Coordinates, to: Coordinates): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function uniqueIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string'))];
}

/** Adds or removes an id while keeping persisted collections duplicate-free. */
export function toggleId(ids: string[], id: string): string[] {
  const current = uniqueIds(ids);
  return current.includes(id) ? current.filter(item => item !== id) : [...current, id];
}

/** Permanently hides an id while keeping dismissal state duplicate-free. */
export function dismissId(ids: string[], id: string): string[] {
  const current = uniqueIds(ids);
  return current.includes(id) ? current : [...current, id];
}

/** Restores a previously hidden id. */
export function restoreId(ids: string[], id: string): string[] {
  return uniqueIds(ids).filter(item => item !== id);
}

/** Resolves persisted ids against the current catalogue and preserves save order. */
export function resolveSavedPlaces<T extends { id: string }>(places: T[], savedIds: string[]): T[] {
  const byId = new Map(places.map(place => [place.id, place]));
  return uniqueIds(savedIds).flatMap(id => {
    const place = byId.get(id);
    return place ? [place] : [];
  });
}
