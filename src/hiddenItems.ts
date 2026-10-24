import { eventDetailTiming } from './detailFlow';
import { isExperiencePubliclyResolvable, isPlacePubliclyResolvable, isPlaceRecommendationEligible } from './contentPolicy';
import { savedFocusAfterRemoval, savedPresentation } from './saved';
import { SETTINGS_HIDDEN_COPY as T } from './settingsHiddenCopy';
import type { Event, Experience, Idea, Place } from './types';

export type HiddenItem = Place | Experience | Event | Idea;
export type HiddenEntry = { id: string; kind: 'experience' | 'place' | 'event' | 'idea'; item: HiddenItem };

/** Persistence uses globally unique IDs. Rendering resolves kind + stable ID, oldest first. */
export function resolveHiddenItems(items: readonly HiddenItem[], dismissed: readonly string[]): HiddenEntry[] {
  const places = new Map(items.filter((item): item is Place => 'name' in item).map(item => [item.id, item]));
  const byKind = new Map<string, HiddenEntry>();
  const kinds = new Map<string, HiddenEntry['kind']>();
  for (const item of items) {
    const kind = 'name' in item ? 'place' : item.kind;
    if ('name' in item && !isPlacePubliclyResolvable(item)) continue;
    if (!('name' in item) && item.kind === 'experience' && !isExperiencePubliclyResolvable(item, places)) continue;
    kinds.set(item.id, kind); byKind.set(`${kind}:${item.id}`, { id: item.id, kind, item });
  }
  return [...new Set(dismissed)].flatMap(id => {
    const kind = kinds.get(id), entry = kind && byKind.get(`${kind}:${id}`);
    return entry ? [entry] : [];
  });
}
export function hiddenPresentation(entry: HiddenEntry, now: Date) {
  const copy = savedPresentation({ type: 'catalog', id: entry.id, item: entry.item }, now);
  const status = entry.kind === 'place' && !isPlaceRecommendationEligible(entry.item as Place) ? T.inactive
    : entry.kind === 'event' && eventDetailTiming(entry.item as Event, now).expired ? T.expired : undefined;
  return { ...copy, kind: entry.kind === 'event' ? 'ETKİNLİK' : copy.kind, status: status ?? (entry.kind === 'event' ? copy.status : undefined) };
}
export const hiddenFocusAfterRemoval = savedFocusAfterRemoval;
