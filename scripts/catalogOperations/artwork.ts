import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { guideMedia } from './guideMedia';
import { ArtworkResolver, ARTWORK_DIMENSIONS, ArtworkLayout, contentVisual } from '../../src/components/gezek/ArtworkResolver';
import { ContextualIconResolver, itemIconKey } from '../../src/components/gezek/ContextualIconResolver';
import { PRODUCTION_ASSET_INDEX } from '../../src/components/gezek/productionAssetIndex';
import { PRODUCTION_ASSET_XML } from '../../src/components/gezek/productionAssetXml';
import { CatalogSnapshot } from '../../src/data/catalog';
import { counts, kinds, Row, unique } from './records';

export function artwork(c: CatalogSnapshot, rows: Row[], assetExists = (path: string) =>
  !!PRODUCTION_ASSET_XML[path]?.xml && existsSync(join('assets/gezek/production', path))) {
  const missingMappings: string[] = [], unresolved: string[] = [], fallback: string[] = [];
  const layouts = (Object.keys(ARTWORK_DIMENSIONS) as ArtworkLayout[]).sort();
  const byKind = Object.fromEntries(kinds.filter(k => k !== 'guide').map(kind => {
    const items = rows.filter(r => r.kind === kind);
    return [kind, Object.fromEntries(layouts.map(layout => {
      const modes = { explicit: 0, family: 0, media: 0, neutral: 0 };
      for (const { item, key } of items) {
        const visual = { ...item, kind };
        const mapping = contentVisual(visual);
        const iconKey = itemIconKey(visual);
        if (iconKey) {
          const path = ContextualIconResolver(iconKey);
          if (!path || !assetExists(path)) unresolved.push(key + '/icon ' + iconKey);
        }
        if (!mapping?.artwork_key) missingMappings.push(key);
        const result = ArtworkResolver(visual, layout);
        if (result.type === 'artwork') {
          if (result.artwork_key.split('/')[1] === item.id) modes.explicit++; else modes.family++;
          if (!assetExists(result.path)) unresolved.push(key + '/' + layout + ' ' + result.path);
        } else {
          modes[result.type]++;
          if (result.type === 'neutral') {
            fallback.push(kind + '/' + layout);
            if (mapping) unresolved.push(key + '/' + layout + ' ' + mapping.artwork_key);
          }
        }
      }
      return [layout, modes];
    }))];
  }));
  const keys = new Set(rows.map(r => r.key));
  const unmapped = unique(missingMappings);
  return { byKind, missingMappings: unmapped, unresolved: unique(unresolved), neutralByKindLayout: counts(fallback),
    mappedIdsOutsideInventory: Object.keys(PRODUCTION_ASSET_INDEX.content).filter(k => !keys.has(k)).sort(),
    guides: guideMedia(c.guides) };
}
