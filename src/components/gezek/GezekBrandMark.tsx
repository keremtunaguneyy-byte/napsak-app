import { StyleSheet, Text, View } from 'react-native';
import { GEZEK_COLORS, GEZEK_FONT_FAMILIES, GEZEK_TYPE } from '../../design/gezekTheme';
import { GezekAsset } from './GezekArtwork';

/** Final logo onaylandığında yalnız bu bileşen değiştirilecek. */
export function GezekBrandMark() {
  return <View accessibilityLabel="Gezek" accessibilityRole="text" style={s.row}>
    <Text style={s.word}>gezek</Text><GezekAsset name="brandDot" />
  </View>;
}
const s = StyleSheet.create({
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 3 },
  word: { ...GEZEK_TYPE.home, color: GEZEK_COLORS.navy, fontFamily: GEZEK_FONT_FAMILIES.extraBold },
});
