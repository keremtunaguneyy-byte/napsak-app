import type { ImageSourcePropType } from 'react-native';
import { formatDurationRange } from '../../domain';
import { RecommendationItem } from '../../recommendations';

export { ArtworkResolver as homeArtwork } from './ArtworkResolver';

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
