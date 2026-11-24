import type { ImageSourcePropType } from 'react-native';
import { Coordinates, distanceInKm, formatDistanceInKm, formatDurationRange, isValidCoordinates } from '../../domain';
import { RecommendationItem } from '../../recommendations';
import { GEZEK_LAYOUT } from '../../design/gezekTheme';

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

// Vertical bounds of 07_source_reader in the approved 393-wide SVG.
const READER_TOP = 1528.544;
const READER_BOTTOM = 1642.811;

export function homeFigureFooterHeight(resultCount: number, scrollWidth: number, contentEnd: number, discoveryEnd: number): number {
  const scale = scrollWidth / 393;
  if (resultCount < 5 || discoveryEnd > READER_TOP * scale) return 0;
  const gap = Math.ceil(READER_BOTTOM * scale - contentEnd);
  return gap > 0 && gap <= GEZEK_LAYOUT.minimumTouchTarget ? gap : 0;
}

// Bounds of the tree and bench/reader groups in the approved SVG's viewBox.
const DISCOVERY_ARTWORK = [
  { top: 1403.806, bottom: 1561, right: 94.158 },
  { top: 1528.424, bottom: 1649.710, right: 206.706 },
] as const;
const HEADING_ARTWORK_CLEARANCE = 12;

export function homeDiscoveryHeadingInset(scrollWidth: number, columnLeft: number, headingTop: number, headingHeight: number): number {
  const scale = scrollWidth / 393;
  let left = columnLeft;
  for (const art of DISCOVERY_ARTWORK) {
    if (headingTop - HEADING_ARTWORK_CLEARANCE < art.bottom * scale
      && headingTop + headingHeight + HEADING_ARTWORK_CLEARANCE > art.top * scale) {
      left = Math.max(left, art.right * scale + HEADING_ARTWORK_CLEARANCE);
    }
  }
  return Math.ceil(left - columnLeft);
}
