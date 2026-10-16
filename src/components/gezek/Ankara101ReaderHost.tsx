import { ReactNode, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageStyle, Pressable, ScrollView, StyleProp, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { parse, SvgAst } from 'react-native-svg';
import { inlineStyles } from 'react-native-svg/css';
import { Guide } from '../../types';
import { ankara101EditorialFont as editorialFont, GUIDE_PRESENTATIONS, ankara101Chapters, ankara101FontState, GuidePresentation, resolveAnkara101Reader } from '../../ankara101Reader';
import { GEZEK_FONT_FAMILIES as F } from '../../design/gezekTheme';
import { ANKARA101_FONTS } from './ankara101Fonts';
import { ANKARA101_MEDIA, ANKARA101_SVG } from './ankara101Assets';
import { ANKARA101_INSTANCES } from './ankara101InstanceAssets';
import { ANKARA101_CUES } from './ankara101CueAssets';
import { ANKARA101_BINDINGS } from './ankara101BindingAssets';
import { DETAIL_ASSET_XML } from './detailAssetXml';
import { focusDetailControl } from './detailFocus';

const NAVY = '#102452';
const parsed = new Map<string, ReturnType<typeof parse>>();
/** Preserve source root dimensions; scale the instance wrapper, never rewrite SVG. */
export function Ankara101Vector({ name, width }: { name: string; width?: number }) {
  const asset = ANKARA101_SVG[name] ?? ANKARA101_INSTANCES[name] ?? ANKARA101_CUES[name] ?? ANKARA101_BINDINGS[name] ?? (DETAIL_ASSET_XML as Record<string, { width: number; height: number; xml: string }>)[name];
  if (!asset) return null;
  const key = asset.xml;
  if (!parsed.has(key)) parsed.set(key, parse(asset.xml, inlineStyles));
  const scale = (width ?? asset.width) / asset.width;
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width: asset.width * scale, height: asset.height * scale }}><View style={{ width: asset.width, height: asset.height, transformOrigin: 'top left', transform: [{ scale }] }}><SvgAst accessible={false} ast={parsed.get(key) ?? null} /></View></View>;
}

export function Ankara101FontGate({ children, onExit }: { children: ReactNode; onExit: () => void }) {
  const [attempt, retry] = useState(0);
  return <FontAttempt key={attempt} onRetry={() => retry(n => n + 1)} onExit={onExit}>{children}</FontAttempt>;
}
function FontAttempt({ children, onRetry, onExit }: { children: ReactNode; onRetry: () => void; onExit: () => void }) {
  const [loaded, error] = useFonts(ANKARA101_FONTS);
  const [timedOut, timeout] = useState(false);
  useEffect(() => { if (loaded || error) return; const timer = setTimeout(() => timeout(true), 10000); return () => clearTimeout(timer); }, [loaded, error]);
  const state = ankara101FontState(loaded, error, timedOut);
  if (state === 'ready') return children;
  return <View style={s.loading} testID={`ankara101-font-${state}`}>
    {state === 'loading' ? <><ActivityIndicator color={NAVY} /><Text accessibilityLiveRegion="polite" style={s.body}>Ankara 101 hazırlanıyor…</Text></> : <><Text accessibilityRole="alert" style={s.body}>Ankara 101 yazı tipleri yüklenemedi.</Text><Pressable accessibilityRole="button" onPress={onRetry} style={s.hit}><Text style={s.body}>Yeniden dene</Text></Pressable></>}
    <Pressable accessibilityRole="button" onPress={onExit} style={s.hit}><Text style={s.body}>Geri dön</Text></Pressable>
  </View>;
}

/** A local decode failure keeps a neutral decorative slot, never a title-based substitute. */
export function Ankara101Image({ mediaKey, style }: { mediaKey: string; style: StyleProp<ImageStyle> }) {
  const [failed, setFailed] = useState(false);
  const source = ANKARA101_MEDIA[mediaKey];
  return source && !failed ? <Image accessible={false} source={source} resizeMode="cover" style={style} onError={() => setFailed(true)} /> : <View accessible={false} testID="ankara101-media-unavailable" style={[style, { backgroundColor: '#E8ECF9' }]} />;
}
export function Ankara101Bookmark({ guide, saved, onSave }: { guide: Guide; saved: boolean; onSave: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${guide.title}: ${saved ? 'Kaydı kaldır' : 'Kaydet'}`} accessibilityState={{ selected: saved }} onPress={event => { event.stopPropagation(); onSave(); }} style={[s.bookmark, saved && { backgroundColor: '#3F65FC' }]}><Ankara101Vector name="imgBookmarkConsistentGeometry" width={20} /></Pressable>;
}

type Props = { guides: readonly Guide[]; guideId: string; saved: readonly string[]; safeTopInset: number; fromSaved: boolean; onBack: () => void; onClose: () => void; onSave: (guide: Guide) => void; onSource: (guide: Guide) => Promise<void> };
export function Ankara101ReaderHost(p: Props) {
  const resolved = resolveAnkara101Reader(p.guides, p.guideId);
  const title = useRef<View>(null);
  useEffect(() => { const frame = requestAnimationFrame(() => focusDetailControl(title.current, true)); return () => cancelAnimationFrame(frame); }, [p.guideId]);
  const ground = resolved?.config.top ?? '#E8ECF9';
  return <View style={[s.host, { backgroundColor: ground }]} testID="ankara101-reader-host">
    <View style={[s.header, { paddingTop: p.safeTopInset, minHeight: p.safeTopInset + 56 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={p.fromSaved ? 'Kaydedilenlere dön' : 'İçindekilere dön'} onPress={p.onBack} style={s.hit}><Ankara101Vector name="back" /></Pressable>
      <Text style={s.headerTitle}>Ankara 101</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Rehberi kapat" onPress={p.onClose} style={s.hit}><Ankara101Vector name="close" /></Pressable>
    </View>
    {resolved ? <ScrollView key={p.guideId} testID="ankara101-reader-scroll" style={s.flex} contentContainerStyle={s.center} showsVerticalScrollIndicator={false}>
      <ReaderBody guide={resolved.guide} config={resolved.config} titleRef={title} saved={p.saved.includes(p.guideId)} onSave={() => p.onSave(resolved.guide)} onSource={() => p.onSource(resolved.guide)} />
    </ScrollView> : <View style={s.loading}><Text accessibilityRole="alert" style={s.body}>Bu rehber şu anda kullanılamıyor.</Text><Pressable accessibilityRole="button" onPress={p.onBack} style={s.hit}><Text style={s.body}>Geri dön</Text></Pressable></View>}
  </View>;
}

function ReaderBody({ guide, config: c, titleRef, saved, onSave, onSource }: { guide: Guide; config: GuidePresentation; titleRef: React.RefObject<View | null>; saved: boolean; onSave: () => void; onSource: () => Promise<void> }) {
  const { width } = useWindowDimensions();
  const lane = Math.min(393, width);
  const factor = lane / 393;
  const castle = c.layout === 'castle';
  const horizon = c.layout === 'horizon';
  const serif = c.font === 'Instrument Serif';
  const chapters = ankara101Chapters(guide, c);
  const titleStyle = { fontFamily: editorialFont(c.font, c.style, c.titleSize), fontSize: c.titleSize, lineHeight: c.titleLineHeight, letterSpacing: -c.titleSize * (castle ? .013 : .011), color: c.ink };
  const title = <View style={[s.titleBlock, castle && { gap: 8, paddingTop: 8, paddingBottom: 2 }]}>
    <View ref={titleRef} accessible focusable tabIndex={-1} accessibilityRole="header" accessibilityLabel={guide.title}>
      <Text style={titleStyle}>{castle ? <><Text>{c.title.split('\n')[0]}</Text>{'\n'}<Text style={{ fontFamily: 'A101Bricolage500' }}>{c.title.split('\n').slice(1).join('\n')}</Text></> : c.title}</Text>
    </View>
    <Text style={[s.metadata, { color: c.ink }]}>{guide.readMinutes} dk okuma{(guide.routeStops?.length ?? 0) ? ` · ${(guide.routeStops?.length ?? 0)} durak` : ''}</Text>
  </View>;
  const hero = <View testID="ankara101-hero" style={{ height: c.hero.slotHeight * factor }}>
    {castle ? <Ankara101Vector name="imgPhotoBindingSteppedCityEdge" width={lane} /> : <View style={{ position: 'absolute', left: c.layout === 'gallery' ? 20 * factor : 0, right: c.layout === 'gallery' ? 20 * factor : 0, top: c.layout === 'gallery' ? 12 : 0, bottom: 0, backgroundColor: c.accent, opacity: horizon ? .15 : .19 }} />}
    <Ankara101Image mediaKey={c.mediaKey} style={{ position: 'absolute', left: c.hero.x * factor, width: c.hero.width * factor, height: c.hero.height * factor, borderTopLeftRadius: c.hero.corners.topLeft, borderTopRightRadius: c.hero.corners.topRight, borderBottomLeftRadius: c.hero.corners.bottomLeft, borderBottomRightRadius: c.hero.corners.bottomRight }} />
  </View>;
  const hasCue = ['castle', 'walk', 'shore', 'transit'].includes(c.layout);
  const splitStops = c.routeAt === 'split';
  const introFamily = c.font === 'Instrument Serif' ? 'A101InstrumentRegular' : castle ? 'A101Fraunces400opsz21' : 'A101Fraunces400';
  return <View style={[s.lane, { width: lane }]} testID={`reader-${guide.id}`}>
    <LinearGradient pointerEvents="none" colors={castle ? ['#E8ECF9', '#EDEDEB', '#F2EDE2', '#E9F0E4', '#DFF3E8'] : [c.top, c.middle, c.end]} locations={castle ? [0, .25, .48, .66, 1] : [0, .54, 1]} style={StyleSheet.absoluteFill} />
    {castle ? <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 180, overflow: 'hidden' }}><Ankara101Vector name="kale-stone-layers" width={lane} /></View> : <View pointerEvents="none" style={{ position: 'absolute', left: (horizon ? 268 : 245) * factor, top: horizon ? 50 : 58, opacity: .22 }}><Ankara101Vector name={guide.id} width={180} /></View>}
    <View style={[s.identity, castle && { paddingTop: 12, paddingBottom: 0, minHeight: 56 }]}><Text style={[s.eyebrow, { color: castle ? NAVY : c.accent }]}>{`${guide.category} / ${guide.district}`.toLocaleUpperCase('tr-TR')}</Text><Ankara101Bookmark guide={guide} saved={saved} onSave={onSave} /></View>
    {horizon ? <>{hero}{title}</> : <>{title}{hero}</>}
    <View style={[s.intro, castle && { paddingTop: 8, paddingBottom: 7, minHeight: 123 }]}><Text style={{ fontFamily: introFamily, fontSize: serif ? 24 : castle ? 21 : 20, lineHeight: serif ? 29 : 27, color: c.ink }}>{castle ? castleIntroduction(guide.summary) : guide.summary}</Text></View>
    {(c.routeAt === 'index' || c.routeAt === 'afterIntro') && <View style={s.routeBlock}><Stops guide={guide} color={c.accent} /></View>}
    {chapters.map((chapter, index) => <View key={index}>
      <View style={[s.chapter, castle && { paddingTop: 8, gap: 12 }]}>
        <View style={s.chapterHeading}><View style={[s.folio, castle && { width: 55, backgroundColor: '#FFC21A' }]}><Text style={[s.folioText, { color: castle ? NAVY : c.accent }]}>{castle ? index === 0 ? '01—02' : '03—04' : `0${index + 1}`}</Text></View><Text accessibilityRole="header" style={{ flex: 1, fontFamily: serif ? 'A101InstrumentItalic' : editorialFont(c.font, castle ? 'Bold' : c.style, 25), fontSize: serif ? 29 : castle ? 26 : 25, lineHeight: 32, color: c.ink }}>{chapter.title}</Text></View>
        {splitStops && <Stops guide={guide} stops={chapter.stops} offset={chapter.stopOffset} color={c.accent} hideTitle />}
        <View style={[s.prose, { gap: castle ? 16 : 14 }]}>
          {hasCue && <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: castle ? 32 : 18, alignSelf: 'stretch' }}><Ankara101Vector name={c.cues[Math.min(index, c.cues.length - 1)]} width={castle ? 32 : 18} /></View>}
          <View style={[s.flex, { gap: castle ? 14 : 0 }]}>{chapter.paragraphs.flatMap(paragraph => castle ? castleParagraphs(paragraph) : [paragraph]).map((paragraph, i) => <Text key={i} style={[s.body, { color: c.ink }]}>{emphasizedParagraph(paragraph, castle)}</Text>)}</View>
        </View>
      </View>
      {c.routeAt === 'afterStory' && index === 0 && <View style={s.routeBlock}><Stops guide={guide} color={c.accent} /></View>}
      {index === 0 && <View style={[s.interlude, castle && { paddingTop: 0, paddingBottom: 28, gap: 20 }]}>
        {castle && <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' }}><View style={{ position: 'absolute', top: -923 }}><Ankara101Vector name="kale-stone-layers" width={lane} /></View><View style={{ top: -923 }}><Ankara101Vector name="kale-reading-continuity" width={lane} /></View></View>}
        {!castle && <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: -28 }}><Ankara101Vector name={c.groundMotif} /></View>}
        {c.interlude === 'photo' ? <><View style={{ width: (castle ? 236 : 200) * factor, height: (castle ? 174 : 150) * factor, borderTopRightRadius: castle ? 44 : c.layout === 'shore' ? 56 : 34, overflow: 'hidden' }}><Ankara101Image mediaKey={c.mediaKey} style={castle ? { width: 508 * factor, height: 339 * factor, left: -28 * factor, top: -132 * factor } : { width: '100%', height: '100%' }} /></View><View style={s.flex}><Ankara101Vector name={castle ? 'imgSteppedCaptionMarkMatchesTitleStoneCourses' : c.interludeMotif} width={castle ? 48 : 54} /><Text style={[s.caption, { color: castle ? NAVY : c.accent, fontSize: castle ? 11 : 10, lineHeight: castle ? 17 : 15 }]}>{c.photoCaption}</Text>{castle && <Text style={[s.caption, { fontFamily: F.regular, color: c.ink, fontSize: 11, lineHeight: 17 }]}>{'Editoryal\ngörselden\ndetay kadrajı.'}</Text>}</View></> : <><Ankara101Vector name={c.interludeMotif} width={132 * factor} /><View style={s.flex}><Text style={[s.caption, { color: c.accent, fontSize: 11, lineHeight: 17 }]}>{c.photoCaption}</Text><Text style={{ marginTop: 8, fontFamily: serif ? 'A101InstrumentItalic' : c.font === 'Fraunces' ? 'A101Fraunces400opsz21' : 'A101Bricolage400', fontSize: 21, lineHeight: 25, color: c.ink }}>{c.direction}</Text></View></>}
      </View>}
    </View>)}
    <View style={[s.practical, castle && { paddingTop: 8 }]}><View style={{ height: 1, backgroundColor: c.accent, opacity: .3 }} /><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>{castle && <Ankara101Vector name="imgEditorialAnnotationSharedPageTurnGrammar" width={32} />}<Text accessibilityRole="header" style={{ flex: 1, fontFamily: 'A101Bricolage700', fontSize: castle ? 26 : 24, lineHeight: 30, color: c.ink }}>Yola çıkmadan</Text></View><Text style={[s.body, { fontSize: 15, lineHeight: 25, color: c.ink }]}>{guide.practicalNote}</Text></View>
    <View style={[s.sourceSection, { paddingTop: castle ? 8 : 4, paddingBottom: castle ? 40 : 48 }]}>
      <SourceAction guide={guide} onSource={onSource} />
      <Text style={[s.disclosure, { color: c.ink }]}>Görseller editoryal ve temsilîdir.</Text>
    </View>
  </View>;
}

function castleIntroduction(summary: string) {
  const start = 'Kale surlarından başlayıp ';
  if (!summary.startsWith(start + 'eski Ankara')) return summary;
  return <><Text style={{ fontFamily: 'A101Fraunces600' }}>{start.trimEnd()}{'\n'}</Text><Text style={{ fontFamily: 'A101Fraunces400Italic', color: '#3F65FC' }}>eski Ankara</Text>{summary.slice(start.length + 'eski Ankara'.length)}</>;
}
function castleParagraphs(paragraph: string) {
  const divider = paragraph.indexOf('. ');
  return divider < 0 ? [paragraph] : [paragraph.slice(0, divider + 1), paragraph.slice(divider + 2)];
}
function emphasizedParagraph(paragraph: string, castle: boolean) {
  const end = castle ? paragraph.startsWith('Ankara Kalesi,') ? 12 : paragraph.startsWith('Rotayı yalnız') ? paragraph.indexOf('.') + 1 : 0 : paragraph.indexOf('.') + 1;
  return end > 0 ? <><Text style={{ fontFamily: F.semiBold }}>{paragraph.slice(0, end)}</Text>{paragraph.slice(end)}</> : paragraph;
}
function Stops({ guide, stops = guide.routeStops ?? [], offset = 0, color, hideTitle = false }: { guide: Guide; stops?: string[]; offset?: number; color: string; hideTitle?: boolean }) {
  if (!stops.length) return null;
  const castle = guide.id === 'guide-ankara-kalesi';
  if (castle) color = NAVY;
  return <View style={{ gap: castle ? 4 : 6 }}>{!hideTitle && <Text style={[s.metadata, { color, marginBottom: 6 }]}>Duraklar</Text>}{stops.map((stop, i) => <View key={`${offset + i}:${stop}`} style={{ flexDirection: 'row', gap: castle ? 12 : 10, minHeight: castle ? 22 : 20 }}><Text style={[s.stopNumber, { color, fontSize: castle ? 10 : 11 }]}>{String(offset + i + 1).padStart(2, '0')}</Text><Text style={[s.stopText, { color: guideInk(guide.id), fontFamily: castle ? F.semiBold : F.medium }]}>{stop}</Text></View>)}</View>;
}
function guideInk(id: string) { return GUIDE_PRESENTATIONS[id]?.ink ?? NAVY; }
function SourceAction({ guide, onSource }: { guide: Guide; onSource: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  return <Pressable testID="ankara101-source" accessibilityRole="link" accessibilityLabel={`Resmî kaynak: ${guide.sourceLabel}`} accessibilityState={{ busy, disabled: busy || !guide.sourceUrl }} disabled={busy || !guide.sourceUrl} onPress={async () => { if (lock.current) return; lock.current = true; setBusy(true); try { await onSource(); } finally { lock.current = false; setBusy(false); } }} style={s.source}><View style={s.flex}><Text style={s.sourceEyebrow}>RESMÎ KAYNAK</Text><Text style={s.sourceLabel}>{guide.sourceLabel}</Text></View><View style={s.sourceArrow}>{busy ? <ActivityIndicator color={NAVY} /> : <Ankara101Vector name="imgOfficialSourceArrow" width={20} />}</View></Pressable>;
}
const s = StyleSheet.create({
  host: { flex: 1 }, flex: { flex: 1, minWidth: 0 }, center: { alignItems: 'center' }, lane: { alignSelf: 'center', overflow: 'hidden' },
  header: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 18 }, headerTitle: { flex: 1, fontFamily: 'A101Bricolage700', fontSize: 20, lineHeight: 26, color: NAVY },
  hit: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 20, backgroundColor: '#E8ECF9' },
  identity: { paddingHorizontal: 24, paddingVertical: 10, minHeight: 64, flexDirection: 'row', gap: 12, alignItems: 'center' }, eyebrow: { flex: 1, fontFamily: F.bold, fontSize: 10, lineHeight: 16 }, bookmark: { width: 44, height: 44, borderRadius: 12, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { paddingHorizontal: 24, paddingBottom: 18, gap: 8 }, metadata: { fontFamily: F.medium, fontSize: 11, lineHeight: 18 }, intro: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 24 },
  chapter: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, gap: 14 }, chapterHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, folio: { width: 36, minHeight: 28, alignItems: 'center', justifyContent: 'center' }, folioText: { fontFamily: F.bold, fontSize: 10, lineHeight: 16 },
  prose: { flexDirection: 'row', alignItems: 'flex-start' }, body: { fontFamily: F.regular, fontSize: 16, lineHeight: 26, color: NAVY }, stopNumber: { width: 24, fontFamily: F.bold, fontSize: 11, lineHeight: 20 }, stopText: { flex: 1, fontFamily: F.medium, fontSize: 12, lineHeight: 20 }, routeBlock: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  interlude: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }, caption: { fontFamily: F.bold, fontSize: 10, lineHeight: 15, marginTop: 8 },
  practical: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, gap: 10 }, sourceSection: { paddingHorizontal: 24, paddingTop: 4, gap: 12 }, source: { borderWidth: 1, borderColor: NAVY, backgroundColor: '#FAF9F5', borderRadius: 12, minHeight: 60, paddingLeft: 14, paddingRight: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }, sourceEyebrow: { fontFamily: F.bold, fontSize: 9, lineHeight: 15, color: NAVY }, sourceLabel: { fontFamily: F.semiBold, fontSize: 12, lineHeight: 19, color: NAVY }, sourceArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC21A' }, disclosure: { fontFamily: F.regular, fontSize: 11, lineHeight: 18 },
});
