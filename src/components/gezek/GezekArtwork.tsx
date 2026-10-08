import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { GEZEK_ASSETS } from './gezekAssets';
import { recordHomeRender } from './homePerformance';

export type GezekAssetName = keyof typeof GEZEK_ASSETS;

/** Local, unmodified Figma SVG. Scaling never changes its root dimensions. */
export const GezekAsset = memo(function GezekAsset({ name, scale = 1 }: { name: GezekAssetName; scale?: number }) {
  recordHomeRender('asset');
  const asset = GEZEK_ASSETS[name];
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width: asset.width * scale, height: asset.height * scale }}>
    <View style={[s.vector, { width: asset.width, height: asset.height, transform: [{ scale }] }]}>
      <SvgXml accessible={false} xml={asset.xml} />
    </View>
  </View>;
});

const s = StyleSheet.create({
  vector: { transformOrigin: 'top left' },
});
