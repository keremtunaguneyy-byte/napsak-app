import { Coordinates, distanceInKm, formatDistanceInKm, formatDurationRange, isValidCoordinates } from '../../domain';
import { RecommendationItem } from '../../recommendations';

export { ArtworkResolver as homeArtwork } from './ArtworkResolver';

export function homeItemTitle(item: RecommendationItem): string {
  return item.kind === 'place' ? item.name : item.title;
}

export function homeItemMeta(item: RecommendationItem): string {
  const price = item.priceLevel === 0 ? 'Bedava' : '₺'.repeat(item.priceLevel);
  if (item.kind === 'experience') return `${item.points.length} durak · ${formatDurationRange(item.minDurationMinutes, item.maxDurationMinutes)} · ${price}`;
  if (item.kind === 'place') return [item.district, item.distance === undefined ? undefined : formatDistanceInKm(item.distance), price].filter(Boolean).join(' · ');
  if (item.kind === 'event') return `${new Date(item.startsAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} · ${item.venue} · ${price}`;
  return `${item.category} · ${price}`;
}

export function homeActionLabel(item: RecommendationItem): string {
  if (item.kind === 'experience') return 'Planı incele';
  if (item.kind === 'place') return 'Mekânı incele';
  if (item.kind === 'event') return 'Etkinliği incele';
  return item.actionLabel ?? 'Fikri incele';
}

/** Live display distances cannot reorder or overwrite the scored batch. */
export function homeDisplayItems(items: RecommendationItem[], coordinates?: Coordinates): RecommendationItem[] {
  return items.map(item => item.kind === 'place' ? {
    ...item,
    distance: isValidCoordinates(coordinates) && isValidCoordinates(item) ? distanceInKm(coordinates, item) : undefined,
  } : item);
}

const ARTWORK_WIDTH = 393;
// The reader starts here. The bench and planter extend slightly below the reader.
const READER_TOP = 1528.544;
const READER_SCENE_BOTTOM = 1649.710;

export function homeArtworkLayout(resultCount: number, scrollWidth: number, contentEnd: number) {
  if (resultCount < 5) return { width: scrollWidth, footerHeight: 0 };

  // On wide screens, fit the art proportionally so the footer adds at most
  // the depth of the reader scene. Keep the art full width when it already fits.
  const width = Math.min(scrollWidth, ARTWORK_WIDTH * contentEnd / READER_TOP);
  const footerHeight = Math.max(0, Math.ceil(READER_SCENE_BOTTOM * width / ARTWORK_WIDTH - contentEnd));
  return { width, footerHeight };
}

// Bounds of the tree and bench/reader groups in the approved SVG's viewBox.
const DISCOVERY_ARTWORK = [
  { top: 1403.806, bottom: 1561, right: 94.158 },
  { top: 1528.424, bottom: 1649.710, right: 206.706 },
] as const;
const HEADING_ARTWORK_CLEARANCE = 12;

export function homeDiscoveryHeadingInset(artworkWidth: number, columnLeft: number, headingTop: number, headingHeight: number, artworkLeft = 0): number {
  const scale = artworkWidth / ARTWORK_WIDTH;
  let left = columnLeft;
  for (const art of DISCOVERY_ARTWORK) {
    if (headingTop - HEADING_ARTWORK_CLEARANCE < art.bottom * scale
      && headingTop + headingHeight + HEADING_ARTWORK_CLEARANCE > art.top * scale) {
      left = Math.max(left, artworkLeft + art.right * scale + HEADING_ARTWORK_CLEARANCE);
    }
  }
  return Math.ceil(left - columnLeft);
}
