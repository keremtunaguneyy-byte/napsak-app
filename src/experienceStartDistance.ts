import { Coordinates, distanceInKm, formatDistanceInKm, isValidCoordinates } from './domain';
import type { Experience } from './types';

/** Presentation only: array order defines the start; never use the stored route anchor or recommendation distance. */
export function experienceStartDistanceLabel(experience: Experience, coordinates?: Coordinates): string | undefined {
  const start = experience.points[0];
  if (!isValidCoordinates(coordinates) || !isValidCoordinates(start)) return undefined;
  const distance = formatDistanceInKm(distanceInKm(coordinates, start), 'tr-TR');
  return distance ? `Başlangıca ${distance}` : undefined;
}
