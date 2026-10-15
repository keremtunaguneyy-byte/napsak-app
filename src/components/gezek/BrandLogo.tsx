import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GEZEK_COLORS, GEZEK_FONT_FAMILIES, GEZEK_TYPE } from '../../design/gezekTheme';
import { GezekAsset } from './GezekArtwork';

/** Final logo onaylandığında yalnız bu bileşen değiştirilecek. */
export const BrandLogo = memo(function BrandLogo({ color = GEZEK_COLORS.navy, size, allowFontScaling = true }: { color?: string; size?: number; allowFontScaling?: boolean }) {
  return <View accessibilityLabel="Gezek" accessibilityRole="text" style={s.row}>
    <Text allowFontScaling={allowFontScaling} style={[s.word, { color }, size !== undefined && { fontSize: size, lineHeight: Math.round(size * 1.3), letterSpacing: 0 }]}>gezek</Text><GezekAsset name="brandDot" />
  </View>;
});
const s = StyleSheet.create({
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 3 },
  word: { ...GEZEK_TYPE.home, color: GEZEK_COLORS.navy, fontFamily: GEZEK_FONT_FAMILIES.extraBold },
});
