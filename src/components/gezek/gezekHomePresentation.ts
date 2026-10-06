import type { ImageSourcePropType } from 'react-native';
import { formatDurationRange } from '../../domain';
import { RecommendationItem } from '../../recommendations';

export type HomeIllustration = 'place' | 'event' | 'idea' | 'neutral';
type LicensedHomePhoto = { source: number; sourceCredit: string; licenseEvidence: string };

// Only verified bundled photography belongs here, keyed by stable catalog ID.
// The supplied Home photographs have no recorded source/license and are not eligible.
const licensedPhotos: Readonly<Record<string, LicensedHomePhoto>> = {};

export function homePhoto(id: string): ImageSourcePropType | undefined {
  return licensedPhotos[id]?.source;
}

/** Product-approved provisional fallback, 2026-10-06. Never infer artwork from a title. */
export function homeIllustration(item: RecommendationItem): HomeIllustration {
  if (item.kind !== 'experience') return item.kind;
  if (!item.primaryInterests.includes(item.category)) return 'neutral';
  if (item.category === 'Etkinlik') return 'event';
  if (item.category === 'Kahve' || item.category === 'Lezzet') return 'place';
  return 'neutral';
}

export function homeItemTitle(item: RecommendationItem): string {
  return item.kind === 'place' ? item.name : item.title;
}

export function homeItemMeta(item: RecommendationItem): string {
  const price = item.priceLevel === 0 ? 'Bedava' : '₺'.repeat(item.priceLevel);
  if (item.kind === 'experience') return `${item.points.length} durak · ${formatDurationRange(item.minDurationMinutes, item.maxDurationMinutes)} · ${price}`;
  if (item.kind === 'place') return [item.district, item.distance === undefined ? undefined : `${item.distance.toFixed(1)} km`, price].filter(Boolean).join(' · ');
  if (item.kind === 'event') return `${new Date(item.startsAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} · ${item.venue} · ${price}`;
  return `${item.category} · ${price}`;
}

export function homeActionLabel(item: RecommendationItem): string {
  if (item.kind === 'experience') return 'Planı incele';
  if (item.kind === 'place') return 'Mekânı incele';
  if (item.kind === 'event') return 'Etkinliği incele';
  return item.actionLabel ?? 'Fikri incele';
}
