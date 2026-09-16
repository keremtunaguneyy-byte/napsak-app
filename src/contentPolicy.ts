import { Event, Experience, Place } from './types';

type HardExclusion = {
  canonicalId: string;
  aliases: readonly string[];
};

export const HARD_EXCLUDED_PLACES: readonly HardExclusion[] = [
  {
    canonicalId: 'yilmaz-guney-sahnesi',
    aliases: [
      'Yılmaz Güney Sahnesi',
      'Yilmaz Guney Sahnesi',
      'Yılmaz Güney Tiyatro Sahnesi',
    ],
  },
] as const;

/** Canonicalizes IDs and human labels through one Turkish-aware policy boundary. */
export function normalizeContentIdentity(value: string): string {
  return value
    .normalize('NFKD')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function hardExclusionFor(place: Pick<Place, 'id' | 'name' | 'aliases'>): HardExclusion | undefined {
  const identities = [place.id, place.name, ...(place.aliases ?? [])].map(normalizeContentIdentity);
  return HARD_EXCLUDED_PLACES.find(entry => {
    const excluded = [entry.canonicalId, ...entry.aliases].map(normalizeContentIdentity);
    return identities.some(identity => excluded.includes(identity));
  });
}

export function isHardExcludedPlace(place: Pick<Place, 'id' | 'name' | 'aliases'>): boolean {
  return hardExclusionFor(place) !== undefined;
}

/** The canonical tombstone may remain in the raw catalog; aliases under new IDs may not. */
export function isCanonicalHardExcludedPlace(place: Pick<Place, 'id' | 'name' | 'aliases'>): boolean {
  const exclusion = hardExclusionFor(place);
  return Boolean(exclusion && normalizeContentIdentity(place.id) === normalizeContentIdentity(exclusion.canonicalId));
}

export function isPlaceRecommendationEligible(place: Place): boolean {
  return place.status === 'active' && !isHardExcludedPlace(place);
}

export function isPlacePubliclyResolvable(place: Place): boolean {
  return !isHardExcludedPlace(place);
}

export function isEventRecommendationEligible(event: Event, now: Date): boolean {
  const startsAt = Date.parse(event.startsAt);
  return Number.isFinite(startsAt) && startsAt > now.getTime();
}

export type ExperienceEligibilityContext = {
  placesById: ReadonlyMap<string, Place>;
  eventsById: ReadonlyMap<string, Event>;
};

export function createExperienceEligibilityContext(
  places: readonly Place[],
  events: readonly Event[] = [],
): ExperienceEligibilityContext {
  return {
    placesById: new Map(places.map(place => [place.id, place])),
    eventsById: new Map(events.map(event => [event.id, event])),
  };
}

export function isExperienceRecommendationEligible(
  experience: Experience,
  context: ExperienceEligibilityContext,
  now: Date,
): boolean {
  const placesEligible = experience.points.every(point => {
    const place = context.placesById.get(point.placeId);
    return Boolean(place && place.cityId === experience.cityId && isPlaceRecommendationEligible(place));
  });
  if (!placesEligible) return false;
  if (experience.lifecycle === 'evergreen') return true;
  if (experience.lifecycle === 'conditional') return false;
  const event = context.eventsById.get(experience.eventId);
  return Boolean(event && event.cityId === experience.cityId && isEventRecommendationEligible(event, now));
}

export function isExperiencePubliclyResolvable(
  experience: Experience,
  placesById: ReadonlyMap<string, Place>,
): boolean {
  return experience.points.every(point => {
    const place = placesById.get(point.placeId);
    return Boolean(place && !isHardExcludedPlace(place));
  });
}

/** Returns the next known instant at which time-based eligibility can change. */
export function nextContentEligibilityChange(events: readonly Event[], now: Date): number | undefined {
  return events
    .map(event => Date.parse(event.startsAt))
    .filter(time => Number.isFinite(time) && time > now.getTime())
    .sort((a, b) => a - b)[0];
}
