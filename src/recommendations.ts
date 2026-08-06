import { Coordinates, distanceInKm } from './domain';
import { BudgetPreference, Event, GroupSizePreference, Idea, Interest, Mood, Place, PriceLevel, RecommendationKind } from './types';

export type Recommendation = Place & { distance?: number; score: number; reasons: string[] };
export type IdeaRecommendation = Idea & { score: number; reasons: string[] };
export type EventRecommendation = Event & { score: number; reasons: string[] };
export type RecommendationItem =
  | ({ kind: 'place' } & Recommendation)
  | IdeaRecommendation
  | EventRecommendation;
export type ContentFilter = 'all' | RecommendationKind;

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

function priceSignal(priceLevel: PriceLevel, budget?: BudgetPreference): number {
  const preferred = budgetToPrice(budget);
  if (preferred === undefined) return 0;
  const distance = Math.abs(priceLevel - preferred);
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
  /** IDs from the immediately preceding batch. Avoided while enough fresh matches exist. */
  previousBatch?: string[];
}): Recommendation[] {
  const { places, mood, interests, dismissed, budget, groupSize, coordinates, limit = 5, seed = 0, random = seededRandom(seed), previousBatch = [] } = options;
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
  const previous = new Set(previousBatch);
  // A fresh pool makes rotation predictable and eliminates overlap whenever the
  // eligible catalogue has a complete new batch. Old items remain a safe fallback.
  const fresh = candidates.filter(place => !previous.has(place.id));
  const fallback = candidates.filter(place => previous.has(place.id));
  const pool = fresh.length >= limit ? fresh : [...fresh, ...fallback];
  while (pool.length && selected.length < limit) {
    pool.sort((a, b) => {
      const adjusted = (place: Recommendation) => place.score
        // Repetition penalties only re-rank eligible candidates; they never let an
        // unrelated item through the hard interest gate.
        - selected.filter(item => item.category === place.category).length * 16
        - selected.filter(item => item.district === place.district).length * 7;
      return adjusted(b) - adjusted(a) || a.name.localeCompare(b.name, 'tr');
    });
    selected.push(pool.shift()!);
  }
  return selected;
}

function recommendIdeas(options: {
  ideas: Idea[];
  mood?: Mood;
  interests: Interest[];
  dismissed: string[];
  budget?: BudgetPreference;
  groupSize?: GroupSizePreference;
  limit?: number;
  seed?: number;
  previousBatch?: string[];
}): IdeaRecommendation[] {
  const { ideas, mood, interests, dismissed, budget, groupSize, limit = 5, seed = 0, previousBatch = [] } = options;
  const random = seededRandom(seed ^ 0xA11DEA);
  const previous = new Set(previousBatch);
  const eligible = ideas
    .filter(idea => !dismissed.includes(idea.id))
    .filter(idea => !interests.length || interests.some(interest => idea.category === interest || idea.interests.includes(interest)))
    .map(idea => {
      const moodMatch = Boolean(mood && idea.moods.includes(mood));
      const matchedInterests = interests.filter(interest => idea.category === interest || idea.interests.includes(interest));
      const budgetScore = priceSignal(idea.priceLevel, budget);
      const groupMatch = !groupSize || idea.groupSizes.includes(groupSize);
      const groupScore = !groupSize ? 0 : groupMatch ? 10 : -8;
      const reasons = [
        ...(moodMatch ? [`${mood} moduna uygun`] : []),
        ...(matchedInterests.length ? [`${matchedInterests.join(', ')} seçiminle eşleşiyor`] : []),
        ...(budgetScore > 0 && budget && budget !== 'Fark etmez' ? [`${budget} bütçene yakın`] : []),
        ...(groupMatch && groupSize ? [`${groupSize} planına uygun`] : []),
        ...(!moodMatch && !matchedInterests.length ? ['yüksek N’apsak puanı'] : []),
      ];
      return {
        ...idea,
        reasons,
        score: (moodMatch ? 48 : 0) + matchedInterests.length * 42 + idea.editorialScore * 3 + budgetScore + groupScore + random() * 8,
      };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'tr'));
  const fresh = eligible.filter(item => !previous.has(item.id));
  const fallback = eligible.filter(item => previous.has(item.id));
  return (fresh.length >= limit ? fresh : [...fresh, ...fallback]).slice(0, limit);
}

/**
 * Unified recommendation entry point for the results feed.
 * Places keep the PR #8 scorer unchanged; ideas use equivalent preference signals.
 * Events intentionally remain data-driven: no fabricated dated events are generated.
 */
export function recommendAll(options: {
  places: Place[];
  ideas: Idea[];
  events?: Event[];
  filter?: ContentFilter;
  mood?: Mood;
  interests: Interest[];
  dismissed: string[];
  budget?: BudgetPreference;
  groupSize?: GroupSizePreference;
  coordinates?: Coordinates;
  limit?: number;
  seed?: number;
  previousBatch?: string[];
  /** Current instant, injectable for deterministic expiry tests. */
  now?: Date;
}): RecommendationItem[] {
  const {
    places, ideas, events = [], filter = 'all', mood, interests, dismissed, budget,
    groupSize, coordinates, limit = 5, seed = 0, previousBatch = [], now = new Date(),
  } = options;
  const candidateLimit = Math.max(limit * 3, 15);
  const placeItems: RecommendationItem[] = filter === 'idea' || filter === 'event' ? [] : recommendPlaces({
    places, mood, interests, dismissed, budget, groupSize, coordinates,
    limit: candidateLimit, seed, previousBatch,
  }).map(item => ({ ...item, kind: 'place' as const }));
  const ideaItems: RecommendationItem[] = filter === 'place' || filter === 'event' ? [] : recommendIdeas({
    ideas, mood, interests, dismissed, budget, groupSize,
    limit: candidateLimit, seed, previousBatch,
  });
  const eventItems: RecommendationItem[] = filter === 'place' || filter === 'idea' ? [] : events
    .filter(event => !dismissed.includes(event.id))
    .filter(event => {
      const startsAt = Date.parse(event.startsAt);
      return Number.isFinite(startsAt) && startsAt > now.getTime();
    })
    // An explicit Event selection ranks by preferences without emptying the tab.
    .filter(event => filter === 'event' || !interests.length || interests.some(interest => event.category === interest || event.interests.includes(interest)))
    .map(event => {
      const moodMatch = Boolean(mood && event.moods.includes(mood));
      const matchedInterests = interests.filter(interest => event.category === interest || event.interests.includes(interest));
      const budgetScore = priceSignal(event.priceLevel, budget);
      const groupMatch = !groupSize || event.groupSizes.includes(groupSize);
      return {
        ...event,
        reasons: [
          ...(moodMatch ? [`${mood} moduna uygun`] : []),
          ...(matchedInterests.length ? [`${matchedInterests.join(', ')} seçiminle eşleşiyor`] : []),
          ...(groupMatch && groupSize ? [`${groupSize} planına uygun`] : []),
        ],
        score: (moodMatch ? 48 : 0) + matchedInterests.length * 42 + event.editorialScore * 3 + budgetScore + (groupMatch && groupSize ? 10 : 0),
      };
    });

  // Preserve the exact PR #8 place ordering (including its category/district
  // diversity penalties) when the user explicitly asks for places only.
  if (filter === 'place') return placeItems.slice(0, limit);

  const pool = [...placeItems, ...ideaItems, ...eventItems]
    .filter(item => !previousBatch.includes(item.id))
    .sort((a, b) => b.score - a.score || ('name' in a ? a.name : a.title).localeCompare('name' in b ? b.name : b.title, 'tr'));
  const fallback = [...placeItems, ...ideaItems, ...eventItems]
    .filter(item => previousBatch.includes(item.id))
    .sort((a, b) => b.score - a.score);
  const candidates = pool.length >= limit ? pool : [...pool, ...fallback];
  if (filter !== 'all') return candidates.slice(0, limit);

  const selected: RecommendationItem[] = [];
  while (candidates.length && selected.length < limit) {
    candidates.sort((a, b) => {
      const adjusted = (item: RecommendationItem) => {
        let adjustedScore = item.score
          - selected.filter(chosen => chosen.kind === item.kind).length * 12;
        if (item.kind === 'place') {
          adjustedScore -= selected.filter(chosen => chosen.kind === 'place' && chosen.category === item.category).length * 16;
          adjustedScore -= selected.filter(chosen => chosen.kind === 'place' && chosen.district === item.district).length * 7;
        }
        return adjustedScore;
      };
      return adjusted(b) - adjusted(a);
    });
    selected.push(candidates.shift()!);
  }
  return selected;
}
