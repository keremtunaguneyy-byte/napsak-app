import { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F, GEZEK_SURFACE_SHADOW as shadow } from '../../design/gezekTheme';
import { PreferenceEditorAction, PreferenceEditorSession, PreferenceField, preferenceContentClearance } from '../../preferenceEditor';
import { focusDetailControl } from './detailFocus';
import { PreferenceAsset, preferenceFields, preferenceLabel, PreferenceOptions } from './PreferenceControls';

type Props = { session: PreferenceEditorSession; onAction: (action: PreferenceEditorAction) => void; onApply: () => void };
export function PreferenceEditor({ session, onAction, onApply }: Props) {
  const header = useRef<View>(null);
  const rowNodes = useRef<Partial<Record<PreferenceField, View | null>>>({});
  const lastField = useRef<PreferenceField | undefined>(undefined);
  const insets = useSafeAreaInsets();
  const { height, fontScale } = useWindowDimensions();
  const [footerHeight, setFooterHeight] = useState(84);
  useEffect(() => {
    const returning = session.mode === 'overview' && lastField.current;
    const frame = requestAnimationFrame(() => focusDetailControl(returning ? rowNodes.current[returning] : header.current));
    lastField.current = session.field;
    return () => cancelAnimationFrame(frame);
  }, [session.mode, session.field]);
  const field = session.field;
  const spec = field && preferenceFields[field];
  return <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={() => onAction({ type: 'back' })}>
    <View accessibilityViewIsModal style={[s.root, session.mode === 'budget_only' && s.transparent]}>
      {session.mode !== 'budget_only' && <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={s.root}>
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={s.atmosphere}>
          <View style={s.mint}><PreferenceAsset name="overview-mint" /></View><View style={s.lavender}><PreferenceAsset name="overview-lavender" /></View>
        </View>
        <ScrollView accessibilityElementsHidden={session.mode === 'field'} importantForAccessibility={session.mode === 'field' ? 'no-hide-descendants' : 'auto'} contentContainerStyle={[s.overview, { paddingBottom: preferenceContentClearance(footerHeight) }]}>
          <View style={s.nav}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Tercihlerden geri dön" onPress={() => onAction({ type: 'back' })} style={s.navButton}><PreferenceAsset name="chevron-left" /></TouchableOpacity><Text style={s.navLabel}>BUGÜNKÜ TERCİHLER</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Tercih düzenleyiciyi kapat" onPress={() => onAction({ type: 'close' })} style={s.navButton}><Text style={s.close}>×</Text></TouchableOpacity></View>
          <View ref={session.mode === 'overview' ? header : undefined} focusable tabIndex={-1} accessible accessibilityRole="header" accessibilityLabel="Bugünkü tercihlerin"><Text accessible={false} style={s.title}>Bugünkü tercihlerin</Text></View>
          <Text style={s.description}>Yalnız bugünkü önerileri etkiler. İstersen gün içinde yeniden değiştirebilirsin.</Text>
          <View style={s.note}><View style={s.noteIcon}><PreferenceAsset name="note-dot" /></View><View style={s.flex}><Text style={s.noteTitle}>Bugüne özel</Text><Text style={s.noteText}>İlgi alanların kalıcıdır; ruh hâli ve zamanın günlük değişir.</Text></View></View>
          <Text style={s.section}>BUGÜN</Text>
          <View style={s.fields}>{(['mood', 'duration', 'budget', 'groupSize'] as const).map(key => <TouchableOpacity accessibilityRole="button" ref={node => { rowNodes.current[key] = node; }} key={key} accessibilityLabel={`${preferenceFields[key].label}: ${preferenceLabel(session.draft[key])}. Değiştir`} onPress={() => onAction({ type: 'field', field: key })} style={s.row}>
            <View style={s.rowIcon}><Text accessible={false} style={s.glyph}>{preferenceFields[key].glyph}</Text></View><View style={s.flex}><Text style={s.rowTitle}>{preferenceFields[key].label}</Text><Text style={s.rowValue}>{preferenceLabel(session.draft[key])}</Text></View><Text style={s.edit}>Değiştir ›</Text>
          </TouchableOpacity>)}</View>
          <View style={s.interests}><Text style={s.persistent}>KALICI TERCİH</Text><View style={s.interestTop}><Text style={s.interestTitle}>İlgi alanların</Text><TouchableOpacity accessibilityRole="button" ref={node => { rowNodes.current.interests = node; }} accessibilityLabel="İlgi alanlarını düzenle" onPress={() => onAction({ type: 'field', field: 'interests' })} style={s.editHit}><Text style={s.edit}>Düzenle ›</Text></TouchableOpacity></View><View style={s.chips}>{session.draft.interests.map((interest, index) => <View key={interest} style={[s.chip, index % 2 ? s.chipLavender : undefined]}><Text style={[s.chipText, index % 2 ? s.edit : undefined]}>{interest}</Text></View>)}</View><Text style={s.rowValue}>{session.draft.interests.length ? 'Önerilerinde öncelik verilecek.' : 'Her şeye açığım'}</Text></View>
          <Text style={s.footnote}>Değişiklikler yalnız bu cihazdaki bugünkü seçimlere uygulanır.</Text>
        </ScrollView>
        <View accessibilityElementsHidden={session.mode === 'field'} importantForAccessibility={session.mode === 'field' ? 'no-hide-descendants' : 'auto'} onLayout={e => setFooterHeight(e.nativeEvent.layout.height)} style={s.footer}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Değişiklikleri kaydet" onPress={onApply} style={s.save}><View accessible={false} style={s.balance} /><Text style={s.saveText}>Değişiklikleri kaydet</Text><View style={s.marker}><PreferenceAsset name="chevron-right" /></View></TouchableOpacity>
        </View>
      </SafeAreaView>}
      {field && spec && <View style={s.overlay}>
        <View accessible={false} style={s.scrim} />
        <View style={[s.sheet, { maxHeight: height - insets.top - insets.bottom - 40, marginBottom: 24 + insets.bottom }]}>
          <View accessible={false} style={s.handle} />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tercih düzenleyiciyi kapat" onPress={() => onAction({ type: 'close' })} style={s.sheetClose}><Text style={s.close}>×</Text></TouchableOpacity>
          <ScrollView contentContainerStyle={s.sheetContent}>
            <View style={s.sheetHeading}><View style={[s.fieldTile, { backgroundColor: spec.color }]}><PreferenceAsset name={spec.icon} /></View><View style={s.flex}><Text style={[s.section, s.sheetEyebrow]}>BUGÜNÜ AYARLA</Text><View ref={header} focusable tabIndex={-1} accessible accessibilityRole="header" accessibilityLabel={spec.title}><Text accessible={false} style={s.sheetTitle}>{spec.title}</Text></View></View></View>
            <Text style={s.sheetDescription}>{spec.description}</Text>
            <View style={s.options}><PreferenceOptions field={field} draft={session.fieldDraft} onChange={value => onAction({ type: 'change', value })} /></View>
          </ScrollView>
          <View style={[s.sheetFooter, fontScale > 1.4 && s.stacked]}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Vazgeç" onPress={() => onAction({ type: 'cancelField' })} style={[s.sheetAction, s.cancel]}><Text style={s.actionText}>Vazgeç</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Uygula" onPress={session.mode === 'budget_only' ? onApply : () => onAction({ type: 'applyField' })} style={[s.sheetAction, s.apply]}><Text style={[s.actionText, s.inverse]}>Uygula</Text><View style={s.applyPip}><PreferenceAsset name="apply-pip" /></View></TouchableOpacity>
          </View>
        </View>
      </View>}
    </View>
  </Modal>;
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas }, transparent: { backgroundColor: 'transparent' }, flex: { flex: 1 },
  atmosphere: { position: 'absolute', inset: 0, overflow: 'hidden' }, mint: { position: 'absolute', left: '70%', top: -70 }, lavender: { position: 'absolute', left: -120, top: 700 },
  overview: { paddingHorizontal: 20, paddingTop: 22, width: '100%', maxWidth: 433, alignSelf: 'center' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }, navButton: { width: 44, minHeight: 44, borderRadius: 22, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', ...shadow }, navLabel: { flex: 1, textAlign: 'center', fontFamily: F.bold, color: C.mutedText, fontSize: 13, lineHeight: 18 }, close: { color: C.navy, fontFamily: F.regular, fontSize: 26, lineHeight: 30 },
  title: { fontFamily: F.extraBold, color: C.navy, fontSize: 27, lineHeight: 34 }, description: { fontFamily: F.regular, color: C.mutedText, fontSize: 13, lineHeight: 19, marginTop: 8 },
  note: { flexDirection: 'row', gap: 12, backgroundColor: C.mint, borderRadius: 22, padding: 14, marginTop: 14, minHeight: 64 }, noteIcon: { paddingTop: 3 }, noteTitle: { color: C.success, fontFamily: F.bold, fontSize: 12, lineHeight: 16 }, noteText: { color: C.navy, fontFamily: F.regular, fontSize: 11, lineHeight: 16, marginTop: 4 },
  section: { color: C.cobalt, fontFamily: F.bold, fontSize: 10, lineHeight: 14, marginTop: 24, marginBottom: 12 }, fields: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 72, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, ...shadow }, rowIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.lavender, alignItems: 'center', justifyContent: 'center' }, glyph: { fontFamily: F.bold, fontSize: 18, color: C.cobalt }, rowTitle: { color: C.navy, fontFamily: F.bold, fontSize: 14, lineHeight: 18 }, rowValue: { color: C.mutedText, fontFamily: F.regular, fontSize: 11, lineHeight: 15, marginTop: 3 }, edit: { color: C.cobalt, fontFamily: F.semiBold, fontSize: 10, lineHeight: 16 },
  interests: { marginTop: 24, padding: 15, minHeight: 136, backgroundColor: C.surface, borderRadius: 22, borderColor: C.border, borderWidth: 1, ...shadow }, persistent: { color: C.success, fontFamily: F.bold, fontSize: 10, lineHeight: 14 }, interestTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, interestTitle: { fontFamily: F.bold, color: C.navy, fontSize: 15, lineHeight: 20 }, editHit: { minHeight: 44, minWidth: 76, alignItems: 'flex-end', justifyContent: 'center' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 3 }, chip: { backgroundColor: C.mint, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16, minHeight: 30 }, chipLavender: { backgroundColor: C.lavender }, chipText: { color: C.success, fontFamily: F.semiBold, fontSize: 11, lineHeight: 15 }, footnote: { marginTop: 24, textAlign: 'center', color: C.mutedText, fontFamily: F.regular, fontSize: 10, lineHeight: 15 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 15, minHeight: 84, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.surface }, save: { minHeight: 44, maxWidth: 393, width: '100%', alignSelf: 'center', borderRadius: 22, backgroundColor: C.navy, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 8, ...shadow }, balance: { width: 32 }, saveText: { flex: 1, fontFamily: F.semiBold, color: C.canvas, textAlign: 'center', fontSize: 13, lineHeight: 18 }, marker: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', inset: 0, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20 }, scrim: { position: 'absolute', inset: 0, backgroundColor: 'rgba(16,36,82,.28)' },
  sheet: { width: '100%', maxWidth: 393, minHeight: 438, borderRadius: 28, backgroundColor: C.surface, paddingTop: 34, paddingBottom: 36, ...shadow }, handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: C.border, position: 'absolute', alignSelf: 'center', top: 12 }, sheetClose: { position: 'absolute', top: 4, right: 4, width: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center', zIndex: 2 }, sheetContent: { paddingHorizontal: 24 },
  sheetEyebrow: { marginTop: 0, marginBottom: 4 },
  sheetHeading: { flexDirection: 'row', alignItems: 'center', gap: 16 }, fieldTile: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, sheetTitle: { fontFamily: F.extraBold, color: C.navy, fontSize: 18, lineHeight: 26 }, sheetDescription: { color: C.mutedText, fontFamily: F.regular, fontSize: 12, lineHeight: 19, marginTop: 14, minHeight: 38 }, options: { marginTop: 14, minHeight: 158 },
  sheetFooter: { marginTop: 22, marginHorizontal: 24, borderTopWidth: 1, borderColor: C.border, paddingTop: 29, gap: 15, flexDirection: 'row' }, stacked: { flexDirection: 'column' }, sheetAction: { flex: 1, minHeight: 48, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }, cancel: { backgroundColor: C.blueWhisper }, apply: { backgroundColor: C.navy }, actionText: { fontFamily: F.semiBold, color: C.navy, fontSize: 12, lineHeight: 20 }, inverse: { color: C.canvas }, applyPip: { position: 'absolute', right: 16 },
});
