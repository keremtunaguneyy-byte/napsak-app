import { useEffect, useLayoutEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F, GEZEK_LAYOUT as L, GEZEK_RADII as R } from '../../design/gezekTheme';
import { SavedEntry, SavedReturnRequest, savedFocusAfterRemoval, savedPresentation } from '../../saved';
import { BrandLogo } from './BrandLogo';
import { DETAIL_ASSET_XML } from './detailAssetXml';
import { GezekAsset } from './GezekArtwork';
import { ProductionArtwork } from './ProductionArtwork';
import { focusDetailControl } from './detailFocus';

type Props = {
  entries: readonly SavedEntry[];
  now: Date;
  safeTopInset: number;
  hidden?: boolean;
  returnRequest?: SavedReturnRequest;
  onOpen: (entry: SavedEntry, node: View | null) => void;
  onUnsave: (id: string) => void;
  onScroll: (y: number) => void;
  onHome: () => void;
  onSettings: () => void;
};

/** Fixed approved shell, one independently scrolling mixed list. No network state or count. */
export function SavedScreen(p: Props) {
  const { width, fontScale } = useWindowDimensions();
  const large = fontScale >= 1.3;
  const scroll = useRef<ScrollView>(null);
  const heading = useRef<View>(null);
  const empty = useRef<View>(null);
  const nodes = useRef(new Map<string, View>());
  const y = useRef(0);
  const pending = useRef<{ scrollY: number; id?: string } | undefined>(undefined);
  const frames = useRef<number[]>([]);
  const cancelFocus = () => { frames.current.forEach(cancelAnimationFrame); frames.current = []; };
  const restore = () => {
    if (p.hidden || !pending.current) return;
    cancelFocus();
    frames.current.push(requestAnimationFrame(() => {
      if (!pending.current) return;
      scroll.current?.scrollTo({ y: pending.current.scrollY, animated: false });
      frames.current.push(requestAnimationFrame(() => {
        const target = pending.current;
        if (!target) return;
        pending.current = undefined;
        focusDetailControl((target.id && nodes.current.get(target.id)) || (p.entries.length ? nodes.current.get(p.entries[0].id) : empty.current) || heading.current, true);
        // Accessibility focus must not replace the captured Saved viewport.
        scroll.current?.scrollTo({ y: target.scrollY, animated: false });
        y.current = target.scrollY;
        p.onScroll(target.scrollY);
      }));
    }));
  };
  useEffect(() => {
    if (!p.hidden && !p.returnRequest) {
      const frame = requestAnimationFrame(() => focusDetailControl(heading.current, true));
      return () => cancelAnimationFrame(frame);
    }
  }, []);
  useEffect(() => () => cancelFocus(), []);
  useLayoutEffect(() => {
    if (p.returnRequest) pending.current = p.returnRequest;
    restore();
  }, [p.returnRequest, p.hidden]);
  useLayoutEffect(() => { restore(); }, [p.entries]);
  const unsave = (id: string) => {
    pending.current = { scrollY: y.current, id: savedFocusAfterRemoval(p.entries.map(e => e.id), id) };
    p.onUnsave(id);
  };
  return <View testID="production-saved" accessibilityElementsHidden={p.hidden} importantForAccessibility={p.hidden ? 'no-hide-descendants' : 'auto'} style={[s.screen, p.hidden && s.hidden]}>
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={s.atmosphere}><GezekAsset name="header" scale={width / 393} /></View>
    <View style={[s.header, { paddingTop: 94 + p.safeTopInset, paddingBottom: large ? 56 : 16 }]}>
      <View ref={heading} accessible focusable tabIndex={-1} accessibilityRole="header" accessibilityLabel="Kaydedilenler"><Text accessible={false} style={s.title}>Kaydedilenler</Text></View>
      <Text style={s.summary}>Son kaydettiklerin en üstte.</Text>
      <View style={[s.top, { top: L.homeTopInset + p.safeTopInset }]}><BrandLogo allowFontScaling={false} /><TouchableOpacity accessibilityRole="button" accessibilityLabel="Ayarları aç" onPress={p.onSettings} style={s.settings}><GezekAsset name="settings" /></TouchableOpacity></View>
    </View>
    <ScrollView testID="production-saved-scroll" ref={scroll} contentContainerStyle={s.list} showsVerticalScrollIndicator={false} scrollEventThrottle={16} onScroll={event => { if (p.hidden) return; y.current = event.nativeEvent.contentOffset.y; p.onScroll(y.current); }} onContentSizeChange={restore}>
      {p.entries.length ? p.entries.map(entry => {
        const copy = savedPresentation(entry, p.now);
        const editorial = entry.type !== 'catalog';
        const accent = editorial || (entry.type === 'catalog' && !('name' in entry.item) && entry.item.kind === 'experience') ? C.cobalt : entry.type === 'catalog' && !('name' in entry.item) && entry.item.kind === 'event' ? C.event : C.navy;
        return <View key={entry.id} testID={`saved-row:${entry.id}`} style={[s.row, editorial && s.editorial]}>
          <TouchableOpacity accessibilityRole="button" ref={node => { if (node) nodes.current.set(entry.id, node); else nodes.current.delete(entry.id); }} testID={`saved-open:${entry.id}`} accessibilityLabel={`${copy.kind}. ${copy.title}. ${copy.metadata}${copy.status ? `. ${copy.status}` : ''}. Aç`} activeOpacity={0.8} onPress={() => p.onOpen(entry, nodes.current.get(entry.id) ?? null)} style={[s.body, (editorial || large) && s.stacked]}>
            {entry.type === 'catalog' && <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.art}><ProductionArtwork item={'name' in entry.item ? { ...entry.item, kind: 'place' } : entry.item} layout="Compact" /></View>}
            <View style={[s.copy, (editorial || large) && s.stackedCopy]}><Text style={[s.kind, { color: accent }]}>{copy.kind}</Text><Text style={[s.rowTitle, editorial && s.editorialTitle]}>{copy.title}</Text><View style={s.metadataBlock}><Text style={s.metadata}>{copy.metadata}</Text>{copy.status && <Text style={s.status}>{copy.status}</Text>}</View></View>
          </TouchableOpacity>
          <TouchableOpacity testID={`saved-unsave:${entry.id}`} accessibilityRole="button" accessibilityLabel={`Kaydedilenlerden çıkar: ${copy.title}`} activeOpacity={0.6} onPress={event => { event.stopPropagation(); unsave(entry.id); }} style={s.unsave}><Bookmark /></TouchableOpacity>
        </View>;
      }) : <View testID="saved-empty" style={s.empty}>
        <Bookmark scale={2} />
        <View ref={empty} accessible focusable tabIndex={-1} accessibilityRole="header" accessibilityLabel="Henüz bir şey kaydetmedin"><Text accessible={false} style={s.emptyTitle}>Henüz bir şey kaydetmedin</Text></View>
        <Text style={s.emptyText}>Beğendiğin planları, mekânları, etkinlikleri, fikirleri ve Ankara 101 okumalarını burada bulabilirsin.</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Önerilere dön" onPress={p.onHome} style={s.cta}><Text style={s.ctaText}>Önerilere dön</Text><View style={s.arrow}><GezekAsset name="chevron" /></View></TouchableOpacity>
      </View>}
    </ScrollView>
  </View>;
}
function Bookmark({ scale = 1 }: { scale?: number }) {
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width: 22 * scale, height: 22 * scale }}><View style={{ width: 22, height: 22, transformOrigin: 'top left', transform: [{ scale }] }}><SvgXml accessible={false} xml={DETAIL_ASSET_XML.saved.xml} /></View></View>;
}
const s = StyleSheet.create({
  atmosphere: { position: 'absolute', top: 0, left: 0, opacity: 0.32 },
  screen: { flex: 1, backgroundColor: C.canvas }, hidden: { display: 'none' },
  header: { paddingHorizontal: L.screenHorizontalInset, paddingBottom: 16 }, top: { position: 'absolute', left: L.screenHorizontalInset, right: L.screenHorizontalInset, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settings: { width: L.minimumTouchTarget, height: L.minimumTouchTarget, borderRadius: R.full, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  title: { color: C.navy, fontFamily: F.extraBold, fontSize: 25, lineHeight: 32, marginBottom: 8 }, summary: { color: C.navy, fontFamily: F.regular, fontSize: 13, lineHeight: 20 },
  list: { paddingHorizontal: L.screenHorizontalInset, paddingBottom: 24, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: R.surface, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }, editorial: { padding: 16, gap: 12 },
  body: { flex: 1, minWidth: 0, minHeight: L.minimumTouchTarget, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, stacked: { flexDirection: 'column' },
  art: { width: 89, height: 72, borderRadius: R.preference, overflow: 'hidden' }, copy: { flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 8 }, stackedCopy: { flexGrow: 0, flexShrink: 0, width: '100%' },
  kind: { fontFamily: F.semiBold, fontSize: 10, lineHeight: 14 }, rowTitle: { fontFamily: F.bold, color: C.navy, fontSize: 16, lineHeight: 22 }, editorialTitle: { fontSize: 18, lineHeight: 25 },
  metadataBlock: { gap: 6 }, metadata: { fontFamily: F.regular, color: C.navy, fontSize: 12, lineHeight: 18 }, status: { fontFamily: F.semiBold, color: C.navy, fontSize: 11, lineHeight: 16 },
  unsave: { width: L.minimumTouchTarget, height: L.minimumTouchTarget, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingVertical: 36, gap: 20, alignItems: 'center' }, emptyTitle: { fontFamily: F.bold, color: C.navy, fontSize: 24, lineHeight: 32, textAlign: 'center' }, emptyText: { fontFamily: F.regular, color: C.navy, fontSize: 14, lineHeight: 22, textAlign: 'center', paddingHorizontal: 12 },
  cta: { width: 265, maxWidth: '100%', minHeight: 52, padding: 10, borderRadius: R.surface, backgroundColor: C.navy, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, ctaText: { fontFamily: F.semiBold, fontSize: 13, lineHeight: 18, color: C.surface, flexShrink: 1 }, arrow: { backgroundColor: C.yellow, borderRadius: 12, padding: 2 },
});
