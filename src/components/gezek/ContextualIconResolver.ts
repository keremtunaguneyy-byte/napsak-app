import { contentVisual, VisualItem } from './ArtworkResolver';
import { PRODUCTION_ASSET_INDEX } from './productionAssetIndex';

const icons: Readonly<Record<string, string>> = PRODUCTION_ASSET_INDEX.icons;
export function ContextualIconResolver(icon_key?: string): string | undefined {
  return icon_key ? icons[icon_key] : undefined;
}
export function itemIconKey(item: VisualItem): string | undefined {
  return item.icon_key ?? contentVisual(item)?.icon_key;
}
