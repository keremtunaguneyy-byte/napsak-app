import { CLASSICS_COLLECTION_ID } from './ankara101';
import { newestFirstIds } from './domain';
import { eventDetailTiming } from './detailFlow';
import type { Event, Experience, Guide, Idea, Place } from './types';
import type { InsiderRoute } from './data/insiderRoutes';

export type SavedEntry =
  | { type: 'catalog'; id: string; item: Place | Idea | Event | Experience }
  | { type: 'guide'; id: string; guide: Guide }
  | { type: 'classics'; id: string; chapterCount: number }
  | { type: 'route'; id: string; route: InsiderRoute };

/** Existing append-order IDs stay untouched; deleted/unresolvable records have no row. */
export function resolveSavedEntries(saved: readonly string[], catalog: readonly (Place | Idea | Event | Experience)[], guides: readonly Guide[], routes: readonly InsiderRoute[]): SavedEntry[] {
  const content = new Map(catalog.map(item => [item.id, item]));
  const chapters = new Map(guides.map(guide => [guide.id, guide]));
  const readers = new Map(routes.map(route => [route.id, route]));
  return newestFirstIds([...saved]).flatMap((id): SavedEntry[] => {
    const item = content.get(id);
    if (item) return [{ type: 'catalog', id, item }];
    const guide = chapters.get(id);
    if (guide) return [{ type: 'guide', id, guide }];
    if (id === CLASSICS_COLLECTION_ID) return [{ type: 'classics', id, chapterCount: guides.length }];
    const route = readers.get(id);
    return route ? [{ type: 'route', id, route }] : [];
  });
}
const priceLabel = (level: number) => level === 0 ? 'Bedava' : '₺'.repeat(level);
export function savedPresentation(entry: SavedEntry, now = new Date()) {
  if (entry.type === 'guide') return { title: entry.guide.title, kind: 'ANKARA 101 · BÖLÜM', metadata: `${entry.guide.category} · ${entry.guide.district} · ${entry.guide.readMinutes} dk okuma` };
  if (entry.type === 'classics') return { title: 'Ankara Klasikleri', kind: 'ANKARA 101 · KOLEKSİYON', metadata: `${entry.chapterCount} bölüm` };
  if (entry.type === 'route') return { title: entry.route.title, kind: 'BİR ANKARALI GİBİ · ROTA', metadata: `${entry.route.durationLabel} · ${entry.route.budgetLabel}` };
  const item = entry.item;
  if ('name' in item) return { title: item.name, kind: 'MEKÂN', metadata: `${item.category} · ${item.district} · ${priceLabel(item.priceLevel)}` };
  if (item.kind === 'experience') return { title: item.title, kind: 'GEZEK PLANI', metadata: `${item.points.length} durak · ${item.minDurationMinutes === item.maxDurationMinutes ? item.minDurationMinutes : `${item.minDurationMinutes}–${item.maxDurationMinutes}`} dk · ${priceLabel(item.priceLevel)}` };
  if (item.kind === 'idea') return { title: item.title, kind: 'FİKİR', metadata: `${item.category} · ${priceLabel(item.priceLevel)}` };
  const timing = eventDetailTiming(item, now);
  return { title: item.title, kind: timing.expired || timing.unavailable || Date.parse(item.startsAt) <= now.getTime() ? 'ETKİNLİK' : 'ETKİNLİK · YAKLAŞAN', metadata: [timing.date && `${timing.date} · ${timing.time?.replace(':', '.')}`, item.venue].filter(Boolean).join('\n'), status: timing.expired ? 'Başlangıç zamanı geçti' : timing.unavailable ? 'Etkinlik bilgisi kullanılamıyor' : undefined };
}

/** Prefer the row that moves into the removed slot, otherwise its predecessor. */
export function savedFocusAfterRemoval(ids: readonly string[], removedId: string): string | undefined {
  const index = ids.indexOf(removedId);
  return ids[index + 1] ?? ids[index - 1];
}
export type SavedReturnRequest = { sequence: number; scrollY: number; id?: string };
