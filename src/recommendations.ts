import { Coordinates, distanceInKm } from './domain';
import { BudgetPreference, GroupSizePreference, Interest, Mood, Place, PriceLevel } from './types';

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

const budgetToPrice = (budget?: BudgetPreference): PriceLevel | undefined => {
  if (budget === 'Ücretsiz') return 0;
  if (budget === '₺') return 1;
  if (budget === '₺₺') return 2;
  if (budget === '₺₺₺') return 3;
  return undefined;
};

function budgetSignal(place: Place, budget?: BudgetPreference): number {
  const preferred = budgetToPrice(budget);
  if (preferred === undefined) return 0;
  const distance = Math.abs(place.priceLevel - preferred);
  return distance === 0 ? 16 : distance === 1 ? 3 : distance === 2 ? -8 : -14;
}

function groupSignal(place: Place, groupSize?: GroupSizePreference): number {
  if (!groupSize) return 0;
  const tags = new Set<Interest>([place.category, ...place.interests]);
  const outdoors = tags.has('Doğa');
  const social = place.moods.includes('Sosyal') || tags.has('Etkinlik') || tags.has('Lezzet');
  const quiet = place.moods.includes('Sakin') || tags.has('Sanat') || tags.has('Kahve');
  if (groupSize === 'Tek') return quiet ? 10 : social && !outdoors ? -5 : 0;
  if (groupSize === '2 kişi') return quiet || tags.has('Lezzet') ? 8 : 2;
  if (groupSize === '3–4 kişi') return social ? 10 : outdoors ? 5 : -3;
  return outdoors || tags.has('Etkinlik') ? 10 : tags.has('Kahve') ? -6 : 2;
}

function interestEligible(place: Place, interests: Interest[]): boolean {
  if (!interests.length) return true;
  return interests.some(interest => place.category === interest || place.interests.includes(interest));
}

export function recommendPlaces(options: {
  places: Place[];
  mood?: Mood;
  interests: Interest[];
  dismissed: string[];
  budget?: BudgetPreference;
  groupSize?: GroupSizePreference;
  coordinates?: Coordinates;
  limit?: number;
  seed?: number;
  random?: () => number;
}): Recommendation[] {
  const { places, mood, interests, dismissed, budget, groupSize, coordinates, limit = 5, seed = 0, random = seededRandom(seed) } = options;
  const candidates = places
    .filter(place => !dismissed.includes(place.id))
    .filter(place => interestEligible(place, interests))
    .map(place => {
      const distance = coordinates ? distanceInKm(coordinates, place) : undefined;
      const moodMatch = Boolean(mood && place.moods.includes(mood));
      const matchedInterests = interests.filter(interest => place.category === interest || place.interests.includes(interest));
      const interestMatch = matchedInterests.length > 0;
      const proximityScore = distance === undefined ? 0 : Math.max(0, 14 - distance * 1.75);
      const budgetScore = budgetSignal(place, budget);
      const groupScore = groupSignal(place, groupSize);
      const surprise = random() * 8;
      const reasons = [
        ...(moodMatch ? [`${mood} moduna uygun`] : []),
        ...(interestMatch ? [`${matchedInterests.join(', ')} seçiminle eşleşiyor`] : []),
        ...(budgetScore > 0 && budget && budget !== 'Fark etmez' ? [`${budget} bütçene yakın`] : []),
        ...(groupScore > 0 && groupSize ? [`${groupSize} planına uygun`] : []),
        ...(distance !== undefined && distance < 3 ? ['sana yakın'] : []),
        ...(!moodMatch && !interestMatch ? ['yüksek N’apsak puanı'] : []),
      ];
      return { ...place, distance, reasons, score: (moodMatch ? 48 : 0) + matchedInterests.length * 42 + place.editorialScore * 3 + proximityScore + budgetScore + groupScore + surprise };
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
