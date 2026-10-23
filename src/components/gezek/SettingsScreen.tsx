import { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F, GEZEK_RADII as R } from '../../design/gezekTheme';
import { SETTINGS_HIDDEN_COPY as T } from '../../settingsHiddenCopy';
import { focusDetailControl } from './detailFocus';
import { ManagementShell, ManagementShellProps, m } from './ManagementShell';

export type SettingsFocus = 'preferences' | 'hidden' | 'delete';
type Props = ManagementShellProps & {
  deletionBusy: boolean; obscured: boolean; focusRequest?: { target: SettingsFocus; sequence: number };
  initialScrollY: number; onScroll: (y: number) => void;
  onPreferences: () => void; onHidden: () => void; onDelete: () => void;
  onDiagnostic?: () => void;
};
export function SettingsScreen(p: Props) {
  const heading = useRef<View>(null), scroll = useRef<ScrollView>(null);
  const nodes = useRef<Partial<Record<SettingsFocus, View | null>>>({});
  useEffect(() => {
    if (p.obscured) return;
    const frame = requestAnimationFrame(() => {
      scroll.current?.scrollTo({ y: p.initialScrollY, animated: false });
      focusDetailControl(p.focusRequest ? nodes.current[p.focusRequest.target] : heading.current, true);
    });
    return () => cancelAnimationFrame(frame);
  }, [p.obscured, p.focusRequest]);
  return <ManagementShell {...p} testID="production-settings">
    <ScrollView testID="production-settings-scroll" ref={scroll} contentContainerStyle={m.content} showsVerticalScrollIndicator={false} scrollEventThrottle={16} onScroll={e => p.onScroll(e.nativeEvent.contentOffset.y)}>
      <View ref={heading} accessible focusable tabIndex={-1} accessibilityRole="header" accessibilityLabel={T.settingsTitle}><Text accessible={false} style={s.title}>{T.settingsTitle}</Text></View>
      <Text style={s.body}>{T.settingsIntro}</Text>
      <View style={s.rows}>{(['preferences', 'hidden'] as const).map(key => <TouchableOpacity accessibilityRole="button" key={key} ref={node => { nodes.current[key] = node; }} accessibilityLabel={T[key]} accessibilityHint={p.deletionBusy ? T.deletionBusyReason : T[key === 'preferences' ? 'preferencesSub' : 'hiddenSub']} accessibilityState={{ disabled: p.deletionBusy }} disabled={p.deletionBusy} onPress={key === 'preferences' ? p.onPreferences : p.onHidden} style={[s.row, p.deletionBusy && s.disabled]}>
        <View style={s.rowCopy}><Text style={s.rowTitle}>{T[key]}</Text><Text style={s.meta}>{T[key === 'preferences' ? 'preferencesSub' : 'hiddenSub']}</Text></View><Text accessible={false} allowFontScaling={false} style={s.chevron}>›</Text>
      </TouchableOpacity>)}</View>
      <View style={s.data}><Text accessibilityRole="header" style={s.rowTitle}>{T.dataTitle}</Text><Text style={s.body}>{T.local}</Text><Text style={s.body}>{T.remote}</Text><Text style={s.body}>{T.location}</Text></View>
      <TouchableOpacity accessibilityRole="button" ref={node => { nodes.current.delete = node; }} accessibilityLabel={p.deletionBusy ? T.deleteBusy : 'Tüm kullanıcı verilerimi kalıcı olarak sil'} accessibilityHint={p.deletionBusy ? T.deleteBusyInfo : T.deleteScope} accessibilityState={{ disabled: p.deletionBusy, busy: p.deletionBusy }} disabled={p.deletionBusy} onPress={p.onDelete} style={[s.delete, p.deletionBusy && s.disabled]}>
        {p.deletionBusy && <ActivityIndicator accessible={false} color={C.surface} />}<Text style={s.deleteText}>{p.deletionBusy ? T.deleteBusy : T.delete}</Text>
      </TouchableOpacity>
      {p.deletionBusy && <Text accessibilityLiveRegion="polite" style={s.body}>{T.deleteBusyInfo}</Text>}
      <Text style={s.meta}>{T.deleteScope}</Text>
      {p.onDiagnostic && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Kontrollü hata ekranını dene" onPress={p.onDiagnostic} style={s.row}><Text style={s.rowTitle}>Hata ekranını dene</Text></TouchableOpacity>}
    </ScrollView>
  </ManagementShell>;
}
const s = StyleSheet.create({
  title: { fontFamily: F.extraBold, color: C.navy, fontSize: 27, lineHeight: 35 },
  body: { fontFamily: F.regular, color: C.navy, fontSize: 14, lineHeight: 22 },
  meta: { fontFamily: F.regular, color: C.navy, fontSize: 12, lineHeight: 18 },
  rows: { gap: 12 }, row: { borderRadius: R.surface, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, minHeight: 44, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowCopy: { flex: 1, minWidth: 0, gap: 4 }, rowTitle: { fontFamily: F.bold, color: C.navy, fontSize: 16, lineHeight: 23 }, chevron: { fontFamily: F.semiBold, color: C.navy, fontSize: 22, lineHeight: 24 },
  data: { backgroundColor: C.mint, borderRadius: R.surface, padding: 16, gap: 8 },
  delete: { backgroundColor: C.danger, minHeight: 56, borderRadius: R.surface, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, deleteText: { flex: 1, fontFamily: F.semiBold, color: C.surface, fontSize: 14, lineHeight: 20 },
  disabled: { opacity: 0.55 },
});
