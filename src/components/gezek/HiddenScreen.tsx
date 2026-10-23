import { useEffect, useLayoutEffect, useRef } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F, GEZEK_RADII as R } from '../../design/gezekTheme';
import { HiddenEntry, hiddenFocusAfterRemoval, hiddenPresentation } from '../../hiddenItems';
import { SETTINGS_HIDDEN_COPY as T } from '../../settingsHiddenCopy';
import { ProductionArtwork } from './ProductionArtwork';
import { focusDetailControl } from './detailFocus';
import { ManagementShell, ManagementShellProps, m } from './ManagementShell';
import { MANAGEMENT_RESTORE_XML } from './managementAssetXml';

type Props = ManagementShellProps & { entries: readonly HiddenEntry[]; now: Date; deletionBusy: boolean; focusRequest: number; onRestore: (entry: HiddenEntry) => boolean; onRestoreAll: () => boolean };
/** Static catalog bodies and independent restore controls. No Detail or external action. */
export function HiddenScreen(p: Props) {
  const { fontScale } = useWindowDimensions();
  const large = fontScale >= 1.3;
  const heading = useRef<View>(null), empty = useRef<View>(null);
  const nodes = useRef(new Map<string, View>());
  const pending = useRef<{ id?: string; message: string } | undefined>(undefined);
  const lastTarget = useRef<string | undefined>(undefined);
  const frames = useRef<number[]>([]);
  const clearFrames = () => { frames.current.forEach(cancelAnimationFrame); frames.current = []; };
  useEffect(() => {
    frames.current.push(requestAnimationFrame(() => focusDetailControl(heading.current, true)));
    return clearFrames;
  }, []);
  useLayoutEffect(() => {
    if (!pending.current) return;
    clearFrames();
    frames.current.push(requestAnimationFrame(() => {
      const next = pending.current;
      if (!next) return;
      pending.current = undefined;
      lastTarget.current = next.id;
      focusDetailControl((next.id && nodes.current.get(next.id)) || empty.current || heading.current);
      AccessibilityInfo.announceForAccessibility(next.message);
    }));
  }, [p.entries]);
  useEffect(() => {
    if (!p.focusRequest) return;
    const frame = requestAnimationFrame(() => focusDetailControl((lastTarget.current && nodes.current.get(lastTarget.current)) || empty.current || heading.current));
    return () => cancelAnimationFrame(frame);
  }, [p.focusRequest]);
  const restore = (entry: HiddenEntry) => {
    if (p.deletionBusy || !p.entries.some(item => item.id === entry.id)) return;
    if (p.onRestore(entry)) pending.current = { id: hiddenFocusAfterRemoval(p.entries.map(item => item.id), entry.id), message: T.individualAnnounce };
  };
  const restoreAll = () => {
    if (!p.deletionBusy && p.entries.length && p.onRestoreAll()) pending.current = { message: T.bulkAnnounce };
  };
  return <ManagementShell {...p} testID="production-hidden">
    <ScrollView testID="production-hidden-scroll" contentContainerStyle={m.content} showsVerticalScrollIndicator={false}>
      <View ref={heading} accessible focusable tabIndex={-1} accessibilityRole="header" accessibilityLabel={T.hidden}><Text accessible={false} style={s.title}>{T.hidden}</Text></View>
      <Text style={s.body}>{T.hiddenIntro}</Text>
      <View style={s.list}>
        {p.entries.length ? <>
          <Text style={s.meta}>{p.entries.length} öneri</Text><Text style={s.meta}>{T.order}</Text><Text style={s.body}>{T.hiddenHelp}</Text>
          {p.entries.map(entry => {
            const copy = hiddenPresentation(entry, p.now);
            return <View key={`${entry.kind}:${entry.id}`} testID={`hidden-row:${entry.id}`} style={s.row}>
              <View style={[s.static, large && s.stacked]}>
                <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={s.art}><ProductionArtwork item={{ ...entry.item, kind: entry.kind }} layout="Compact" width={64} /></View>
                <View style={[s.copy, large && s.stackedCopy]}><Text style={s.kind}>{copy.kind}</Text><Text style={s.rowTitle}>{copy.title}</Text>{!!copy.metadata && <Text style={s.meta}>{copy.metadata}</Text>}{copy.status && <Text style={s.meta}>{copy.status}</Text>}</View>
              </View>
              <TouchableOpacity accessibilityRole="button" testID={`hidden-restore:${entry.id}`} ref={node => { if (node) nodes.current.set(entry.id, node); else nodes.current.delete(entry.id); }} accessibilityLabel={`${copy.title} önerisini geri getir`} accessibilityHint={p.deletionBusy ? T.deletionBusyReason : T.hiddenHelp} accessibilityState={{ disabled: p.deletionBusy }} disabled={p.deletionBusy} onPress={() => restore(entry)} style={[s.restore, { width: large ? 220 : 132 }, p.deletionBusy && s.disabled]}>
                <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.icon}><SvgXml accessible={false} xml={MANAGEMENT_RESTORE_XML} /></View><Text style={s.restoreText}>{T.restore}</Text>
              </TouchableOpacity>
            </View>;
          })}
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tüm gizlenen önerileri geri getir" accessibilityHint={p.deletionBusy ? T.deletionBusyReason : T.bulkScope} accessibilityState={{ disabled: p.deletionBusy }} disabled={p.deletionBusy} onPress={restoreAll} style={[s.primary, p.deletionBusy && s.disabled]}><Text style={s.primaryText}>{T.restoreAll}</Text></TouchableOpacity>
          <Text style={s.meta}>{T.bulkScope}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={T.home} onPress={p.onHome} style={s.return}><Text style={s.restoreText}>{T.home}</Text></TouchableOpacity>
        </> : <View testID="hidden-empty" style={s.empty}>
          <View ref={empty} accessible focusable tabIndex={-1} accessibilityRole="header" accessibilityLabel={T.emptyTitle}><Text accessible={false} style={s.emptyTitle}>{T.emptyTitle}</Text></View>
          <Text style={s.body}>{T.emptyBody}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={T.home} onPress={p.onHome} style={s.primary}><Text style={s.primaryText}>{T.home}</Text></TouchableOpacity>
        </View>}
      </View>
    </ScrollView>
  </ManagementShell>;
}
const s = StyleSheet.create({
  title: { fontFamily: F.extraBold, color: C.navy, fontSize: 27, lineHeight: 35 }, body: { fontFamily: F.regular, color: C.navy, fontSize: 14, lineHeight: 22 }, meta: { fontFamily: F.regular, color: C.navy, fontSize: 12, lineHeight: 18 },
  list: { gap: 12 }, row: { padding: 16, borderRadius: R.surface, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, gap: 12 },
  static: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, stacked: { flexDirection: 'column' },
  art: { width: 64, height: 64 * 72 / 89, borderRadius: R.preference, overflow: 'hidden' },
  copy: { flex: 1, minWidth: 0, gap: 8 }, stackedCopy: { flex: 0, width: '100%' },
  kind: { fontFamily: F.semiBold, color: C.navy, fontSize: 10, lineHeight: 16 }, rowTitle: { fontFamily: F.bold, color: C.navy, fontSize: 16, lineHeight: 23 },
  restore: { maxWidth: '100%', minHeight: 46, alignSelf: 'flex-end', borderRadius: R.full, backgroundColor: C.yellow, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, icon: { width: 22, height: 22 },
  restoreText: { flexShrink: 1, fontFamily: F.semiBold, color: C.navy, fontSize: 14, lineHeight: 20 },
  primary: { minHeight: 44, borderRadius: R.surface, padding: 12, backgroundColor: C.navy, justifyContent: 'center' }, primaryText: { fontFamily: F.semiBold, color: C.surface, fontSize: 14, lineHeight: 20 },
  return: { minHeight: 44, padding: 12, justifyContent: 'center' }, empty: { padding: 16, backgroundColor: C.surface, borderRadius: R.surface, gap: 16 }, emptyTitle: { fontFamily: F.bold, color: C.navy, fontSize: 20, lineHeight: 28 }, disabled: { opacity: 0.55 },
});
