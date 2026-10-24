import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { GEZEK_COLORS as C, GEZEK_RADII as R } from '../../design/gezekTheme';
import { BrandLogo } from './BrandLogo';
import { DETAIL_ASSET_XML } from './detailAssetXml';

export type ManagementShellProps = { safeTopInset: number; onBack: () => void; onClose: () => void; onHome: () => void; backLabel: string; closeLabel: string };
export function ManagementShell(p: ManagementShellProps & { children: ReactNode; testID: string }) {
  return <View testID={p.testID} style={m.screen}>
    <View style={[m.header, { marginTop: p.safeTopInset }]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={p.backLabel} onPress={p.onBack} style={m.headerButton}><ManagementIcon name="back" /></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ana sayfaya dön" onPress={p.onHome} style={m.brand}><BrandLogo size={28} allowFontScaling={false} /></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={p.closeLabel} onPress={p.onClose} style={m.headerButton}><ManagementIcon name="close" /></TouchableOpacity>
    </View>
    {p.children}
  </View>;
}
export function ManagementIcon({ name }: { name: 'back' | 'close' }) {
  const icon = DETAIL_ASSET_XML[name];
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width: icon.width, height: icon.height }}><SvgXml accessible={false} xml={icon.xml} /></View>;
}
export const m = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  header: { height: 72, paddingBottom: 20, width: '100%', maxWidth: 393, paddingHorizontal: 20, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 44, height: 44, borderRadius: R.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  brand: { width: 100, height: 44, justifyContent: 'center' },
  content: { width: '100%', maxWidth: 393, paddingHorizontal: 20, alignSelf: 'center', paddingBottom: 24, gap: 16 },
});
