import { ReactNode, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Guide } from '../../types';
import { ankara101EditorialFont as editorialFont, PRODUCTION_GUIDE_IDS, resolveAnkara101Reader } from '../../ankara101Reader';
import { GEZEK_FONT_FAMILIES as F } from '../../design/gezekTheme';
import { BrandLogo } from './BrandLogo';
import { GezekAsset } from './GezekArtwork';
import { Ankara101Bookmark, Ankara101Image, Ankara101Vector } from './Ankara101ReaderHost';
import { focusDetailControl } from './detailFocus';

type Props = { active: boolean; guides: readonly Guide[]; saved: readonly string[]; safeTopInset: number; initialScrollY?: number; returnRequest?: { id?: string; scrollY: number; sequence: number }; onScroll: (y: number) => void; onOpenGuide: (id: string) => void; onSaveGuide: (guide: Guide) => void; onSettings: () => void; children: ReactNode };
/** All native content flows; the 393 px lane is centered, never scaled at 412. */
export function Ankara101Index(p: Props) {
  const scroll = useRef<ScrollView>(null);
  const nodes = useRef<Record<string, View | null>>({});
  const heading = useRef<View>(null);
  const { width, fontScale } = useWindowDimensions();
  const lane = Math.min(width, 393);
  const lead = resolveAnkara101Reader(p.guides, 'guide-ankara-kalesi');
  const opened = useRef(false);
  const active = useRef(p.active);
  active.current = p.active;
  const scrollY = useRef(p.initialScrollY ?? 0);
  const restore = () => {
    if (!active.current) return;
    const request = p.returnRequest;
    scrollY.current = request?.scrollY ?? p.initialScrollY ?? 0;
    p.onScroll(scrollY.current);
    scroll.current?.scrollTo({ y: scrollY.current, animated: false });
    if (request) focusDetailControl(request.id ? nodes.current[request.id] ?? heading.current : heading.current, true);
  };
  useEffect(() => { if (!p.active) return; opened.current = false; const frame = requestAnimationFrame(() => requestAnimationFrame(restore)); return () => cancelAnimationFrame(frame); }, [p.active, p.returnRequest?.sequence]);
  const open = (id: string) => { if (opened.current) return; opened.current = true; p.onScroll(scrollY.current); p.onOpenGuide(id); };
  const large = fontScale >= 1.3;
  return <View style={s.flex} testID="ankara101-index">
    <View style={[s.header, { paddingTop: p.safeTopInset, minHeight: p.safeTopInset + 56 }]}><BrandLogo /><Pressable ref={node => { nodes.current.settings = node; }} accessibilityRole="button" accessibilityLabel="Ayarları aç" onPress={p.onSettings} style={s.settings}><GezekAsset name="settings" /></Pressable></View>
    <ScrollView ref={scroll} testID="ankara101-index-scroll" style={s.flex} contentContainerStyle={s.center} showsVerticalScrollIndicator={false} scrollEventThrottle={32} onScroll={e => { if (!active.current) return; scrollY.current = e.nativeEvent.contentOffset.y; p.onScroll(scrollY.current); }}>
      <View style={{ width: lane }}>
        <LinearGradient pointerEvents="none" colors={['#E8ECF9', '#EDEDEB', '#F2EDE2', '#E9F0E4', '#DFF3E8']} locations={[0, .25, .48, .66, 1]} style={StyleSheet.absoluteFill} />
        <View style={s.masthead}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}><Ankara101Vector name="cover-publication-binding" width={lane} /></View>
          <View style={s.publication}><Text style={s.publicationLabel}>GEZEK / KENT REHBERİ</Text><Text style={s.purpose}>KEŞFET · OKU · YÜRÜ</Text></View>
          <View style={[s.mastheadTitle, large && { flexDirection: 'column', alignItems: 'flex-start' }]}><Text accessibilityRole="header" style={[s.ankara, large && { flex: 0 }]}>Ankara</Text><View style={[s.indexBadge, large && { alignSelf: 'flex-end' }]}><Text style={s.indexNumber}>101</Text></View></View>
          <Text style={s.slogan}>Şehrin başka bir yüzü.</Text>
        </View>
        {lead && <View style={s.coverShelf}>
          <View style={[s.cover, { minHeight: 430 }]}>
            <Pressable ref={n => { nodes.current[lead.guide.id] = n; }} testID={`index-${lead.guide.id}`} accessibilityRole="button" accessibilityLabel={`${lead.guide.title} rehberini aç`} onPress={() => open(lead.guide.id)} style={StyleSheet.absoluteFill}>
              <Ankara101Image mediaKey={lead.config.mediaKey} style={StyleSheet.absoluteFill} />
              <LinearGradient pointerEvents="none" colors={['rgba(16,36,82,.08)', 'rgba(16,36,82,.03)', 'rgba(16,36,82,.98)']} locations={[0, .42, 1]} style={StyleSheet.absoluteFill} />
            </Pressable>
            <View pointerEvents="box-none" style={s.coverLabels}><View style={s.chapterTab}><Text style={s.chapterTabText}>01 / TARİH · ALTINDAĞ</Text></View><Ankara101Bookmark guide={lead.guide} saved={p.saved.includes(lead.guide.id)} onSave={() => p.onSaveGuide(lead.guide)} /></View>
            <Pressable accessibilityRole="button" accessibilityLabel={`${lead.guide.title}: Rehberi aç`} onPress={() => open(lead.guide.id)} style={[s.coverCopy, large && { paddingTop: 100 }]}>
              <Text style={s.coverEyebrow}>ŞEHRİN KATMANLARI</Text>
              <Text style={s.coverTitle}>Ankara Kalesi{'\n'}ve çevresi</Text>
              <View style={s.readAction}><View style={s.readLabels}><Text style={s.readTitle}>REHBERİ AÇ</Text><Text style={s.readMeta}>{lead.guide.readMinutes} dk okuma · {(lead.guide.routeStops?.length ?? 0)} durak</Text></View><View style={s.turnArrow}><Ankara101Vector name="imgReadArrow" width={26} /></View><View style={{ position: 'absolute', right: 58, top: 0 }}><Ankara101Vector name="imgPageTurnIntersection" width={20} /></View></View>
            </Pressable>
          </View>
        </View>}
        <View style={s.contents}>
          <View ref={heading} focusable tabIndex={-1} accessibilityRole="header" style={s.contentsHeading}><Text style={s.contentsTitle}>İçindekiler</Text><Text style={s.contentsCount}>{PRODUCTION_GUIDE_IDS.filter(id => resolveAnkara101Reader(p.guides, id)).length} REHBER</Text></View>
          {PRODUCTION_GUIDE_IDS.filter(id => id !== 'guide-ankara-kalesi').map(id => {
            const resolved = resolveAnkara101Reader(p.guides, id);
            if (!resolved) return null;
            const { guide, config } = resolved;
            return <Pressable key={id} ref={node => { nodes.current[id] = node; }} testID={`index-${id}`} accessibilityRole="button" accessibilityLabel={`${guide.title} rehberini aç`} onPress={() => open(id)} style={[s.entry, { backgroundColor: config.top }]}>
              <View style={s.entryImage}><Ankara101Image mediaKey={config.mediaKey} style={StyleSheet.absoluteFill} /></View>
              <View style={s.entryCopy}>
                <Text style={[s.entryCategory, { color: config.accent }]}>{guide.category} / {guide.district}</Text>
                <Text style={{ fontFamily: editorialFont(config.font, config.style, 21), fontSize: config.font === 'Instrument Serif' ? 25 : 21, lineHeight: 25, color: config.ink }}>{config.title.replace(/\n/g, ' ')}</Text>
                <View style={s.entryAction}><Text style={[s.entryTime, { color: config.ink }]}>{guide.readMinutes} dk okuma</Text><View style={[s.entryArrow, { backgroundColor: config.accent }]}><Ankara101Vector name="imgFrame" width={20} /></View></View>
              </View>
            </Pressable>;
          })}
        </View>
        {p.children}
      </View>
    </ScrollView>
  </View>;
}
const s = StyleSheet.create({
  flex: { flex: 1 }, center: { alignItems: 'center' }, header: { paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E8ECF9' }, settings: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  masthead: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 18, gap: 8 }, publication: { flexDirection: 'row', gap: 12, alignItems: 'center' }, publicationLabel: { flex: 209, fontFamily: F.bold, fontSize: 9, lineHeight: 15, color: '#102452' }, purpose: { flex: 132, fontFamily: F.semiBold, fontSize: 8, lineHeight: 15, color: '#102452' }, mastheadTitle: { flexDirection: 'row', gap: 8, alignItems: 'center' }, ankara: { flex: 1, fontFamily: 'A101DMSerifRegular', fontSize: 46, lineHeight: 53, color: '#102452' }, indexBadge: { width: 90, minHeight: 52, borderTopRightRadius: 14, borderBottomLeftRadius: 14, backgroundColor: '#FFC21A', justifyContent: 'center', alignItems: 'center' }, indexNumber: { fontFamily: F.bold, fontSize: 30, lineHeight: 38, color: '#102452' }, slogan: { fontFamily: 'A101DMSerifItalic', fontSize: 17, lineHeight: 24, color: '#3F65FC' },
  coverShelf: { paddingHorizontal: 20, paddingBottom: 18 }, cover: { borderRadius: 6, borderBottomRightRadius: 70, overflow: 'hidden', justifyContent: 'space-between' }, coverLabels: { marginHorizontal: 24, marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, chapterTab: { minHeight: 44, width: 170, paddingHorizontal: 12, backgroundColor: '#FFC21A', borderRadius: 4, borderTopRightRadius: 16, justifyContent: 'center' }, chapterTabText: { fontFamily: F.bold, fontSize: 10, lineHeight: 16, color: '#102452' }, coverCopy: { marginHorizontal: 24, marginTop: 126, marginBottom: 44, gap: 10 }, coverEyebrow: { fontFamily: F.semiBold, fontSize: 10, lineHeight: 16, color: '#FAF9F5' }, coverTitle: { fontFamily: 'A101DMSerifRegular', fontSize: 34, lineHeight: 37, color: '#FAF9F5' }, readAction: { minHeight: 58, maxWidth: 273, flexDirection: 'row', backgroundColor: '#102452', borderRadius: 6, overflow: 'hidden' }, readLabels: { flex: 1, paddingLeft: 18, paddingVertical: 9, gap: 2 }, readTitle: { fontFamily: F.bold, fontSize: 13, lineHeight: 20, color: '#FAF9F5' }, readMeta: { fontFamily: F.medium, fontSize: 10, lineHeight: 16, color: '#FAF9F5' }, turnArrow: { width: 58, minHeight: 58, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC21A' },
  contents: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48, gap: 16 }, contentsHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, contentsTitle: { flex: 245, fontFamily: 'A101DMSerifRegular', fontSize: 24, lineHeight: 30, color: '#102452' }, contentsCount: { flex: 96, fontFamily: F.bold, fontSize: 9, lineHeight: 15, color: '#3F65FC' }, entry: { minHeight: 184, flexDirection: 'row', borderBottomRightRadius: 28, overflow: 'hidden' }, entryImage: { width: 112, alignSelf: 'stretch' }, entryCopy: { flex: 1, minWidth: 0, paddingHorizontal: 14, paddingVertical: 12, gap: 7 }, entryCategory: { fontFamily: F.bold, fontSize: 9, lineHeight: 14 }, entryAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 }, entryTime: { flex: 1, fontFamily: F.medium, fontSize: 11, lineHeight: 18 }, entryArrow: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
