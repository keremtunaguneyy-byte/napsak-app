import { isValidElement, memo, ReactNode, useLayoutEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { parse, SvgAst } from 'react-native-svg';
import { inlineStyles } from 'react-native-svg/css';
import { ArtworkLayout, ArtworkResolver, ARTWORK_DIMENSIONS, VisualItem } from './ArtworkResolver';
import { ContextualIconResolver } from './ContextualIconResolver';
import { PRODUCTION_ASSET_XML } from './productionAssetXml';
import { BrandLogo } from './BrandLogo';
import { GEZEK_COLORS } from '../../design/gezekTheme';
import { HOME_PROFILING_ENABLED, recordHomeAssetMount, recordHomeRender, recordHomeSvgCache } from './homePerformance';

function countElements(value: ReactNode): number {
  if (Array.isArray(value)) return value.reduce((sum, child) => sum + countElements(child), 0);
  if (isValidElement<{ children?: ReactNode }>(value)) return 1 + countElements(value.props.children);
  return 0;
}

// Only immutable registry paths enter this cache (at most 432 assets).
// Keep the same CSS middleware so Figma fills and geometry remain intact.
const parsedAssets = new Map<string, ReturnType<typeof parse>>();
function parsedAsset(path: string, xml: string) {
  let ast = parsedAssets.get(path);
  if (!ast) {
    const start = HOME_PROFILING_ENABLED ? performance.now() : 0;
    ast = parse(xml, inlineStyles);
    parsedAssets.set(path, ast);
    if (HOME_PROFILING_ENABLED) recordHomeSvgCache(false, performance.now() - start, countElements(ast?.children));
  } else recordHomeSvgCache(true);
  return ast;
}

/** Retains SVG root geometry; wrappers scale uniformly, never crop between layouts. */
export const ProductionSvg = memo(function ProductionSvg({ path, width }: { path: string; width?: number }) {
  recordHomeRender('asset');
  const asset = PRODUCTION_ASSET_XML[path];
  const scale = width === undefined ? 1 : width / asset.width;
  const svg = <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width: asset.width * scale, height: asset.height * scale }}>
    <View style={{ width: asset.width, height: asset.height, transformOrigin: 'top left', transform: [{ scale }] }}><SvgAst accessible={false} ast={parsedAsset(path, asset.xml)} /></View>
  </View>;
  return HOME_PROFILING_ENABLED ? <AssetMountProbe>{svg}</AssetMountProbe> : svg;
});

function AssetMountProbe({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    recordHomeAssetMount(true);
    return () => recordHomeAssetMount(false);
  }, []);
  return children;
}

export const ProductionArtwork = memo(function ProductionArtwork({ item, layout, width }: { item: VisualItem; layout: ArtworkLayout; width?: number }) {
  const visual = ArtworkResolver(item, layout);
  const dimensions = ARTWORK_DIMENSIONS[layout];
  const w = width ?? dimensions.width;
  const h = w * dimensions.height / dimensions.width;
  if (visual.type === 'artwork') return <ProductionSvg path={visual.path} width={w} />;
  if (visual.type === 'media') {
    const intrinsic = Image.resolveAssetSource(visual.media.source);
    const scale = Math.max(w / intrinsic.width, h / intrinsic.height);
    const iw = intrinsic.width * scale, ih = intrinsic.height * scale;
    const left = Math.max(w - iw, Math.min(0, w / 2 - iw * visual.media.focalPoint.x));
    const top = Math.max(h - ih, Math.min(0, h / 2 - ih * visual.media.focalPoint.y));
    return <View accessible={false} style={{ width: w, height: h, overflow: 'hidden' }}><Image accessible={false} source={visual.media.source} style={{ position: 'absolute', width: iw, height: ih, left, top }} /></View>;
  }
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.neutral, { width: w, height: h }]}><BrandLogo /></View>;
});

export function ContextualIcon({ icon_key }: { icon_key?: string }) {
  const path = ContextualIconResolver(icon_key);
  return path ? <ProductionSvg path={path} width={12} /> : null;
}
const s = StyleSheet.create({ neutral: { backgroundColor: GEZEK_COLORS.blueWhisper, alignItems: 'center', justifyContent: 'center' } });
