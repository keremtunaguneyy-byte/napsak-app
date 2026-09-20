import { InsiderRoute } from './data/insiderRoutes';
import { Guide } from './types';

export const CLASSICS_COLLECTION_ID = 'collection-ankara-classics';

export const FEATURED_GUIDE_IDS = [
  'guide-anadolu-medeniyetleri',
  'guide-gordion',
  'guide-eymir',
  'guide-tunali-kugulu',
] as const;

export type GuideCollectionMetadata = {
  chapterCount: number;
  totalReadMinutes: number;
};

export function guideCollectionMetadata(guides: readonly Guide[]): GuideCollectionMetadata {
  return {
    chapterCount: guides.length,
    totalReadMinutes: guides.reduce((total, guide) => total + guide.readMinutes, 0),
  };
}

export function resolveGuideById(guides: readonly Guide[], guideId: string | undefined): Guide | undefined {
  if (!guideId) return undefined;
  return guides.find(guide => guide.id === guideId);
}

export function resolveFeaturedGuides(guides: readonly Guide[]): Guide[] {
  return FEATURED_GUIDE_IDS.flatMap(id => {
    const guide = resolveGuideById(guides, id);
    return guide ? [guide] : [];
  });
}

export function resolvePrimaryInsiderRoute(routes: readonly InsiderRoute[]): InsiderRoute | undefined {
  return routes[0];
}
