import { CLASSICS_COLLECTION_ID } from '../../src/ankara101';
import { isExperiencePubliclyResolvable, isPlacePubliclyResolvable } from '../../src/contentPolicy';
import { CatalogSnapshot } from '../../src/data/catalog';
import { insiderRoutes } from '../../src/data/insiderRoutes';
import { eventsForPersonalHistory, retiredEvents } from '../../src/data/retiredEvents';
import { resolveSavedEntries } from '../../src/saved';
import { compare } from './records';

export function personalCatalogItems(c: CatalogSnapshot) {
  const placesById = new Map(c.places.map(p => [p.id, p]));
  return [
    ...c.experiences.filter(e => Array.isArray(e.points) && e.points.every(p => p?.placeId) && isExperiencePubliclyResolvable(e, placesById)),
    ...c.places.filter(isPlacePubliclyResolvable), ...c.ideas, ...eventsForPersonalHistory(c.events, c.cityId),
  ];
}

export function savedDestinations(c: CatalogSnapshot) {
  const catalog = personalCatalogItems(c);
  // A historical snapshot can still contain the original occurrence. A different
  // occurrence with a reserved ID is a competing destination and fails the audit.
  const reusedEvents = c.events.filter(event => retiredEvents.some(retired =>
    retired.cityId === c.cityId && retired.id === event.id
    && (retired.startsAt !== event.startsAt || retired.venue !== event.venue || retired.title !== event.title)));
  const candidates = [
    ...[...catalog, ...reusedEvents].map(item => ({ id: item.id, family: 'kind' in item ? item.kind : 'place',
      title: 'name' in item ? item.name : item.title, item })),
    ...c.guides.map(item => ({ id: item.id, family: 'guide', title: item.title, item })),
    { id: CLASSICS_COLLECTION_ID, family: 'classics', title: 'Ankara Klasikleri', item: undefined },
    ...insiderRoutes.map(item => ({ id: item.id, family: 'route', title: item.title, item })),
  ];
  const groups = new Map<string, typeof candidates>();
  for (const item of candidates) {
    const group = groups.get(item.id);
    if (group) group.push(item);
    else groups.set(item.id, [item]);
  }
  const issues = [...groups.keys()].sort(compare).flatMap(id => {
    const group = groups.get(id)!;
    if (group.length < 2) return [];
    const [winner] = resolveSavedEntries([id], catalog, c.guides, insiderRoutes);
    const target = winner.type === 'catalog' ? winner.item : winner.type === 'guide' ? winner.guide
      : winner.type === 'route' ? winner.route : undefined;
    const destinations = group.map(({ family, title, item }) => ({ family, title, selected: item === target }))
      .sort((a, b) => compare(a.family, b.family) || compare(a.title, b.title) || Number(b.selected) - Number(a.selected));
    return [{ code: 'saved_destination_collision', id, destinations }];
  });
  return { passed: issues.length === 0, totalDestinations: candidates.length, distinctIds: groups.size, issues };
}
