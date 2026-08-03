import { Coordinates, distanceInKm } from './domain';
import { Interest, Mood, Place } from './types';

export type Recommendation = Place & { distance?: number; score: number; reasons: string[] };

export function recommendPlaces(options: {
  places: Place[];
  mood?: Mood;
  interests: Interest[];
  dismissed: string[];
  coordinates?: Coordinates;
  limit?: number;
}): Recommendation[] {
  const { places, mood, interests, dismissed, coordinates, limit = 5 } = options;
  return places
    .filter(place => !dismissed.includes(place.id))
    .map(place => {
      const distance = coordinates ? distanceInKm(coordinates, place) : undefined;
      const moodMatch = Boolean(mood && place.moods.includes(mood));
      const interestMatch = interests.includes(place.category);
      const proximityScore = distance === undefined ? 0 : Math.max(0, 20 - distance * 2.5);
      const reasons = [
        ...(moodMatch ? [`${mood} moduna uygun`] : []),
        ...(interestMatch ? [`${place.category} seçiminle eşleşiyor`] : []),
        ...(distance !== undefined && distance < 3 ? ['sana yakın'] : []),
        ...(!moodMatch && !interestMatch ? ['yüksek N’apsak puanı'] : []),
      ];
      return { ...place, distance, reasons, score: (moodMatch ? 35 : 0) + (interestMatch ? 30 : 0) + place.editorialScore * 5 + proximityScore };
    })
    .sort((a, b) => b.score - a.score || b.editorialScore - a.editorialScore || a.name.localeCompare(b.name, 'tr'))
    .slice(0, limit);
}
