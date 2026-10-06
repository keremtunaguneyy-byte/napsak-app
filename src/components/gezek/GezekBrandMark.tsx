import { StyleSheet, Text, View } from 'react-native';
import { GEZEK_COLORS, GEZEK_FONT_FAMILIES } from '../../design/gezekTheme';

/** Final logo onaylandığında yalnız bu bileşen değiştirilecek. */
export function GezekBrandMark() {
  return <View accessibilityLabel="Gezek" accessibilityRole="text" style={s.row}>
    <Text style={s.word}>gezek</Text><View accessible={false} style={s.dot} />
  </View>;
}
const s = StyleSheet.create({
  row: { alignItems: 'flex-end', flexDirection: 'row' },
  word: { color: GEZEK_COLORS.navy, fontFamily: GEZEK_FONT_FAMILIES.extraBold, fontSize: 27, letterSpacing: -1.5, lineHeight: 32 },
  dot: { backgroundColor: GEZEK_COLORS.yellow, borderRadius: 4, height: 7, marginBottom: 5, marginLeft: 2, width: 7 },
});
