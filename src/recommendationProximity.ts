import { Coordinates, distanceInKm, isValidCoordinates } from './domain';

export type RecommendationProximityPolicy = 'default' | 'nearby';

/** Invalid inputs have the same distance semantics as a locationless computation. */
export function recommendationDistance(from: Coordinates | undefined, to: Coordinates): number | undefined {
  if (!isValidCoordinates(from) || !isValidCoordinates(to)) return undefined;
  const distance = distanceInKm(from, to);
  return Number.isFinite(distance) ? distance : undefined;
}

/** B2 replaces A's contribution; eligibility and all other ranking terms stay separate. */
export function recommendationProximityScore(
  kind: 'place' | 'experience',
  distanceKm: number | undefined,
  policy: RecommendationProximityPolicy = 'default',
): number {
  if (distanceKm === undefined || !Number.isFinite(distanceKm) || distanceKm < 0) return 0;
  if (policy === 'nearby') {
    const score = distanceKm === 0 ? 0 : -2 * distanceKm;
    return Number.isFinite(score) ? score : 0;
  }
  // Keep the original arithmetic and cutoffs on the production A path.
  return Math.max(0, 14 - distanceKm * (kind === 'place' ? 1.75 : 1.25));
}
