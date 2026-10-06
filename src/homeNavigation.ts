import { isPlacePubliclyResolvable } from './contentPolicy';
import type { RecommendationItem } from './recommendations';
import type { Event, Experience, Idea, Place } from './types';

/** Enter the existing nested plan view by exact IDs, never by title or list index. */
export function homeExperienceDetailEntry(experience: Experience, places: readonly Place[]): { placeId: string; planId: string } | undefined {
  const firstPoint = experience.points[0];
  const place = firstPoint && places.find(candidate => candidate.id === firstPoint.placeId && isPlacePubliclyResolvable(candidate));
  return place ? { placeId: place.id, planId: experience.id } : undefined;
}

type HomeActions = {
  openPlaceDetail: (placeId: string) => void;
  openExperienceDetail: (entry: { placeId: string; planId: string }) => void;
  unavailableExperience: () => void;
  openEvent: (event: Event) => void;
  openIdea: (idea: Idea) => void;
  showIdea: (idea: Idea) => void;
};

/** Inspect first; Experience map launch belongs to the detail's explicit map action. */
export function openHomeRecommendation(item: RecommendationItem, places: readonly Place[], actions: HomeActions): void {
  if (item.kind === 'place') return actions.openPlaceDetail(item.id);
  if (item.kind === 'experience') {
    const entry = homeExperienceDetailEntry(item, places);
    return entry ? actions.openExperienceDetail(entry) : actions.unavailableExperience();
  }
  if (item.kind === 'event') return actions.openEvent(item);
  if (item.actionUrl) return actions.openIdea(item);
  return actions.showIdea(item);
}
