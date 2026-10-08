import { PRODUCTION_ASSET_INDEX } from './productionAssetIndex';

export type ArtworkLayout = 'Hero' | 'Square' | 'Compact';
export type VisualItem = { id: string; kind: string; artwork_key?: string; icon_key?: string };
export type VerifiedMedia = { source: number; sourceCredit: string; licenseEvidence: string; focalPoint: { x: number; y: number } };
export type ArtworkResolution =
  | { type: 'media'; media: VerifiedMedia; layout: ArtworkLayout }
  | { type: 'artwork'; artwork_key: string; path: string; layout: ArtworkLayout }
  | { type: 'neutral'; layout: ArtworkLayout };
export const ARTWORK_DIMENSIONS = { Hero: { width: 329, height: 100 }, Square: { width: 112, height: 112 }, Compact: { width: 89, height: 72 } } as const;
const families: Readonly<Record<string, Readonly<Record<ArtworkLayout, string>>>> = PRODUCTION_ASSET_INDEX.artwork;
const mappings: Readonly<Record<string, { artwork_key: string; icon_key: string }>> = PRODUCTION_ASSET_INDEX.content;

// Populate only with verified bundled photography/official event art and evidence.
export const VERIFIED_MEDIA: Readonly<Record<string, VerifiedMedia>> = {};
export function contentVisual(item: VisualItem) { return mappings[`${item.kind}:${item.id}`]; }
export function ArtworkResolver(item: VisualItem, layout: ArtworkLayout, mediaRegistry = VERIFIED_MEDIA): ArtworkResolution {
  const media = mediaRegistry[`${item.kind}:${item.id}`];
  if (media && media.source > 0 && media.sourceCredit.trim() && media.licenseEvidence.trim()
    && [media.focalPoint.x, media.focalPoint.y].every(v => Number.isFinite(v) && v >= 0 && v <= 1)) return { type: 'media', media, layout };
  const mapping = contentVisual(item);
  // Item-specific Experience artwork wins over a semantic hint.
  const keys = item.kind === 'experience' ? [mapping?.artwork_key, item.artwork_key] : [item.artwork_key, mapping?.artwork_key];
  for (const key of keys) if (key && families[key]?.[layout]) return { type: 'artwork', artwork_key: key, path: families[key][layout], layout };
  return { type: 'neutral', layout };
}

export function discoveryDestinations(selected: 'experience' | 'place' | 'event' | 'idea') {
  return (['experience', 'place', 'event', 'idea'] as const).filter(kind => kind !== selected);
}
