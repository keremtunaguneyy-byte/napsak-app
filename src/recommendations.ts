import { Coordinates, distanceInKm } from './domain';
import { Interest, Mood, Place } from './types';

export type Recommendation = Place & { distance?: number; score: number; reasons: string[] };

/** Small deterministic PRNG so recommendation runs can be reproduced in tests. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function recommendPlaces(options: {
  places: Place[];
  mood?: Mood;
  interests: Interest[];
  dismissed: string[];
  coordinates?: Coordinates;
  limit?: number;
  seed?: number;
  random?: () => number;
}): Recommendation[] {
  const { places, mood, interests, dismissed, coordinates, limit = 5, seed = 0, random = seededRandom(seed) } = options;
  const candidates = places
    .filter(place => !dismissed.includes(place.id))
    .map(place => {
      const distance = coordinates ? distanceInKm(coordinates, place) : undefined;
      const moodMatch = Boolean(mood && place.moods.includes(mood));
      const matchedInterests = interests.filter(interest => place.interests.includes(interest));
      const interestMatch = matchedInterests.length > 0;
      const proximityScore = distance === undefined ? 0 : Math.max(0, 14 - distance * 1.75);
      const surprise = random() * 8;
      const reasons = [
        ...(moodMatch ? [`${mood} moduna uygun`] : []),
        ...(interestMatch ? [`${matchedInterests.join(', ')} seçiminle eşleşiyor`] : []),
        ...(distance !== undefined && distance < 3 ? ['sana yakın'] : []),
        ...(!moodMatch && !interestMatch ? ['yüksek N’apsak puanı'] : []),
      ];
      return { ...place, distance, reasons, score: (moodMatch ? 48 : 0) + matchedInterests.length * 42 + place.editorialScore * 3 + proximityScore + surprise };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'tr'));

  const selected: Recommendation[] = [];
  while (candidates.length && selected.length < limit) {
    candidates.sort((a, b) => {
      const adjusted = (place: Recommendation) => place.score
        - selected.filter(item => item.category === place.category).length * 9
        - selected.filter(item => item.district === place.district).length * 6;
      return adjusted(b) - adjusted(a) || a.name.localeCompare(b.name, 'tr');
    });
    selected.push(candidates.shift()!);
  }
  return selected;
}
