import { readFileSync } from 'node:fs';

// Editorial vocabulary only. No title/description classifier runs here or at runtime.
export const EVENT_ARTWORK_TAXONOMY: Readonly<Record<string, { icon_key: string; photo_family: string }>> =
  JSON.parse(readFileSync('assets/gezek/production/event-artwork-taxonomy.json', 'utf8')).families;

export type EventVisualRecord = {
  kind: string; id: string; visual_subtype: string; icon_component_key: string;
  photo_family: string; artwork_key?: string; reviewed_at?: string; classification_basis?: string;
};

export function reviewedEventMapping(item: EventVisualRecord) {
  const family = EVENT_ARTWORK_TAXONOMY[item.visual_subtype];
  if (!family || item.kind !== 'event' || !item.id || !item.reviewed_at?.match(/^\d{4}-\d{2}-\d{2}$/)
    || !item.classification_basis?.trim() || item.icon_component_key !== family.icon_key
    || item.photo_family !== family.photo_family) throw new Error(`Incomplete reviewed Event classification: ${item.id}`);
  const artwork_key = item.artwork_key ?? `event/${item.visual_subtype}/v01`;
  if (!artwork_key.startsWith(`event/${item.visual_subtype}/`)) throw new Error(`Event subtype/key mismatch: ${item.id}`);
  return { artwork_key, icon_key: family.icon_key, visual_subtype: item.visual_subtype, photo_family: family.photo_family };
}
