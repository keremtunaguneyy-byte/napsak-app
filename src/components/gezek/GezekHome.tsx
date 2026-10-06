import { Component, ErrorInfo, memo, Profiler, ReactNode, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F, GEZEK_LAYOUT as L,
  GEZEK_RADII as R, GEZEK_SPACING as S, GEZEK_SURFACE_SHADOW as shadow, GEZEK_TYPE as T,
} from '../../design/gezekTheme';
import { captureOperationalError } from '../../observability';
import { RecommendationItem } from '../../recommendations';
import { ResultFilter } from '../../resultFilters';
import { BudgetPreference, DurationPreference, GroupSizePreference, Interest, Mood } from '../../types';
import { GezekAsset, GezekAssetName } from './GezekArtwork';
import { GezekBrandMark } from './GezekBrandMark';
import { HOME_PROFILING_ENABLED, recordHomeCommit, recordHomeRender } from './homePerformance';
import { homeActionLabel, homeIllustration, homeItemMeta, homeItemTitle, homePhoto } from './gezekHomePresentation';

const RADAR = require('../../../assets/gezek/home-loading-radar.png');
const tabs: readonly { value: ResultFilter; label: string; color: string }[] = [
  { value: 'experience', label: 'Gezek', color: C.cobalt },
  { value: 'place', label: 'Mekân', color: C.venue },
  { value: 'event', label: 'Etkinlik', color: C.event },
  { value: 'idea', label: 'Fikir', color: C.yellow },
];
const copy: Record<ResultFilter, { main: string; alternatives: string; refresh: string }> = {
  experience: { main: 'Bugünlük planın', alternatives: 'Alternatif planlar', refresh: 'Başka planlar göster' },
  place: { main: 'Bugünlük mekânın', alternatives: 'Diğer mekânlar', refresh: 'Başka mekânlar göster' },
  event: { main: 'Bugünün etkinliği', alternatives: 'Diğer etkinlikler', refresh: 'Başka etkinlikler göster' },
  idea: { main: 'Bugünün fikri', alternatives: 'Diğer fikirler', refresh: 'Başka fikirler göster' },
};

export type GezekHomeProps = {
  mood?: Mood; interests: Interest[]; budget: BudgetPreference; groupSize?: GroupSizePreference; duration: DurationPreference;
  results: RecommendationItem[]; savedIds: string[]; selectedFilter: ResultFilter; contextRefreshDue: boolean;
  locating: boolean; hasCoordinates: boolean; locationMessage: string; lastDismissed?: string; hiddenCount: number;
  onSettings: () => void; onEditPreferences: () => void; onConfirmContext: () => void;
  onSelectFilter: (filter: ResultFilter) => void; onRequestLocation: () => void; onUndoDismiss: () => void;
  onOpenRecommendation: (item: RecommendationItem) => void; onToggleSaved: (item: RecommendationItem, rank: number) => void;
  onDismiss: (item: RecommendationItem, rank: number) => void; onRotate: () => void; onShowHidden: () => void;
  onReset: () => void; onRecommendationsLayout: (y: number) => void;
};

export const GezekHome = memo(function GezekHome(props: GezekHomeProps) {
  const home = <HomeBoundary onEdit={props.onEditPreferences}><HomeContent {...props} /></HomeBoundary>;
  return HOME_PROFILING_ENABLED ? <Profiler id="GezekHome" onRender={recordHomeCommit}>{home}</Profiler> : home;
});

function HomeContent(p: GezekHomeProps) {
  recordHomeRender('home');
  const [contentWidth, setContentWidth] = useState(353);
  const [main, ...alternatives] = p.results;
  const labels = copy[p.selectedFilter];
  const preference = [
    p.mood, p.interests.length ? p.interests.join(' + ') : 'Her şeye açığım',
    p.duration, p.budget === 'Ücretsiz' ? 'Bedava' : p.budget, p.groupSize,
  ].filter(Boolean).join(' · ');
  return <View onLayout={event => setContentWidth(event.nativeEvent.layout.width)} style={s.screen}>
    <HomeAtmosphere width={contentWidth + 2 * L.screenHorizontalInset} />
    <View style={s.top}>
      <GezekBrandMark />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ayarları aç" onPress={p.onSettings} style={s.settings}>
        <GezekAsset name="settings" />
      </TouchableOpacity>
    </View>
    <View style={s.intro}>
      <Text style={s.eyebrow}>SANA GÖRE</Text>
      <Text accessibilityRole="header" style={s.title}>Bugün bunlar olur.</Text>
      <Text style={s.bodyMuted}>Ruh hâline, vaktine ve bütçene göre seçtik.</Text>
    </View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Bugünkü tercihler: ${preference}. Tercihleri düzenle`} onPress={p.onEditPreferences} style={s.preference}>
      <View style={s.preferenceIcon}><GezekAsset name="preferences" /></View>
      <Text style={s.preferenceText}>{preference}</Text>
      <Text style={s.edit}>Düzenle</Text>
    </TouchableOpacity>
    {p.contextRefreshDue && <View accessibilityRole="summary" style={s.context}>
      <View style={s.flex}><Text style={s.label}>Tercihlerin hâlâ aynı mı?</Text><Text style={s.bodyMuted}>Günün değiştiyse güncelleyebilirsin.</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Aynı tercihlerle devam et" onPress={p.onConfirmContext} style={s.contextAction}><Text style={s.edit}>Aynı, devam et</Text></TouchableOpacity>
    </View>}
    <View accessibilityRole="tablist" style={s.tabs}>
      {tabs.map(tab => {
        const selected = p.selectedFilter === tab.value;
        return <TouchableOpacity key={tab.value} accessibilityRole="tab" accessibilityLabel={`${tab.label} önerileri`} accessibilityState={{ selected }}
          onPress={() => p.onSelectFilter(tab.value)} style={[s.tab, selected && { backgroundColor: tab.color }]}>
          <CategoryIcon filter={tab.value} selected={selected} />
          <Text style={[s.tabText, selected && tab.value !== 'idea' && s.inverseText]}>{tab.label}</Text>
        </TouchableOpacity>;
      })}
    </View>
    {(!p.hasCoordinates || p.locating) && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Konum izni iste"
      accessibilityState={{ busy: p.locating, disabled: p.locating }} disabled={p.locating} onPress={p.onRequestLocation} style={[s.location, p.locating && s.disabled]}>
      <GezekAsset name="locationOff" /><Text style={s.noticeText}>{p.locating ? 'Konumun bulunuyor…' : p.locationMessage}</Text><Text style={s.edit}>Aç</Text>
    </TouchableOpacity>}
    {p.lastDismissed && <View accessibilityLiveRegion="polite" style={s.undo}>
      <Text style={s.undoText}>Öneri gizlendi.</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Son gizlenen öneriyi geri al" onPress={p.onUndoDismiss} style={s.utilityHit}><Text style={s.undoAction}>Geri al</Text></TouchableOpacity>
    </View>}
    <View onLayout={event => p.onRecommendationsLayout(event.nativeEvent.layout.y)}>
      <Heading title={labels.main} />
      {main ? <MainCard item={main} saved={p.savedIds.includes(main.id)} onOpen={p.onOpenRecommendation}
        onSave={p.onToggleSaved} onDismiss={p.onDismiss} /> :
        <EmptyCard filter={p.selectedFilter} onEdit={p.onEditPreferences} onHidden={p.onShowHidden} />}
      {!!alternatives.length && <>
        <Heading title={labels.alternatives} />
        <View style={s.alternativeList}>{alternatives.slice(0, 4).map((item, i) =>
          <Alternative key={item.id} item={item} rank={i + 2} onOpen={p.onOpenRecommendation} />)}</View>
      </>}
      {main && !alternatives.length && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Alternatif bulmak için tercihleri düzenle" onPress={p.onEditPreferences} style={s.exhausted}>
        <GezekAsset name="alternativesNotice" /><Text style={s.noticeText}>Başka uygun alternatif bulunamadı.</Text><Text style={s.edit}>Düzenle</Text>
      </TouchableOpacity>}
    </View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={labels.refresh} onPress={p.onRotate} style={s.refresh}>
      <View accessible={false} style={s.markerSpacer} /><Text style={s.refreshText}>{labels.refresh}</Text>
      <View style={s.yellowMarker}><GezekAsset name="refresh" /></View>
    </TouchableOpacity>
    <View style={s.discovery}>
      <View accessible={false} pointerEvents="none" style={s.lowerAtmosphere}><GezekAsset name="lowerRoute" /></View>
      <Text accessibilityRole="header" style={s.sectionTitle}>Başka neye bakalım?</Text>
      <View style={s.discoveryGrid}>
        <Discovery filter="place" onSelectFilter={p.onSelectFilter} />
        <Discovery filter="event" onSelectFilter={p.onSelectFilter} />
        <Discovery filter="idea" onSelectFilter={p.onSelectFilter} />
      </View>
    </View>
    <View style={s.utilities}>
      {p.hasCoordinates && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Konumu yeniden güncelle" onPress={p.onRequestLocation} style={s.utilityHit}><Text style={s.utilityText}>Konumu güncelle</Text></TouchableOpacity>}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Gizlediğim ${p.hiddenCount} öneriyi göster`} onPress={p.onShowHidden} style={s.utilityHit}><Text style={s.utilityText}>Gizlediklerim ({p.hiddenCount})</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Plan tercihlerini baştan seç" onPress={p.onReset} style={s.utilityHit}><Text style={s.utilityText}>Baştan başla</Text></TouchableOpacity>
    </View>
  </View>;
}

const HomeAtmosphere = memo(function HomeAtmosphere({ width }: { width: number }) {
  const scale = width / 393;
  const layers: { name: GezekAssetName; x: number; y: number }[] = [
    { name: 'header', x: 0, y: 0 },
    { name: 'lavenderAtmosphere', x: -118, y: 690 },
    { name: 'mintAtmosphere', x: 300, y: 1010 },
    { name: 'lavenderDetail', x: -114, y: 323 },
    { name: 'coralDetail', x: 294, y: 544 },
    { name: 'yellowDetail', x: 308, y: 648 },
  ];
  return <View accessible={false} pointerEvents="none" style={s.atmosphere}>
    {layers.map(layer => <View key={layer.name} style={{ position: 'absolute', left: layer.x * scale, top: layer.y * scale }}>
      <GezekAsset name={layer.name} scale={scale} />
    </View>)}
  </View>;
});

const MainCard = memo(function MainCard({ item, saved, onOpen, onSave, onDismiss }: { item: RecommendationItem; saved: boolean; onOpen: GezekHomeProps['onOpenRecommendation']; onSave: GezekHomeProps['onToggleSaved']; onDismiss: GezekHomeProps['onDismiss'] }) {
  const title = homeItemTitle(item);
  return <View style={s.mainCard}>
    <RecommendationVisual item={item} large />
    <Text accessibilityRole="header" style={s.mainTitle}>{title}</Text>
    <Text style={s.bodyMuted}>{homeItemMeta(item)}</Text>
    <View style={s.reason}><View style={s.reasonDot}><GezekAsset name="reasonDot" /></View><Text style={s.reasonText}>{item.reasons[0] ?? 'Gezek editörlerinin seçimi'}</Text></View>
    <View style={s.actions}>
      <PrimaryAction label={homeActionLabel(item)} accessibilityLabel={`${title}: ${homeActionLabel(item)}`} onPress={() => onOpen(item)} flex />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${title} ${saved ? 'önerisini kayıttan çıkar' : 'önerisini kaydet'}`}
        accessibilityState={{ selected: saved }} onPress={() => onSave(item, 1)} style={[s.save, saved && s.saved]}>
        <Text style={s.saveText}>{saved ? 'Kaydedildi' : 'Kaydet'}</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${title} önerisini gizle`} onPress={() => onDismiss(item, 1)} style={s.dismiss}><Text style={s.dismissText}>Bana göre değil</Text></TouchableOpacity>
  </View>;
});

const Alternative = memo(function Alternative({ item, rank, onOpen }: { item: RecommendationItem; rank: number; onOpen: GezekHomeProps['onOpenRecommendation'] }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${rank}. öneri: ${homeItemTitle(item)}. ${homeItemMeta(item)}. İncele`} onPress={() => onOpen(item)} style={s.alternative}>
    <RecommendationVisual item={item} />
    <View style={s.altCopy}>
      <Text style={s.altEyebrow}>{item.category.toLocaleUpperCase('tr-TR')}</Text>
      <Text style={s.altTitle}>{homeItemTitle(item)}</Text>
      <Text style={s.bodyMuted}>{homeItemMeta(item)}</Text>
    </View>
    <Text accessible={false} style={s.chevron}>›</Text>
  </TouchableOpacity>;
});

const RecommendationVisual = memo(function RecommendationVisual({ item, large = false }: { item: RecommendationItem; large?: boolean }) {
  const photo = homePhoto(item.id);
  const slot = large ? s.mainImage : s.altImage;
  if (photo) return <Image accessible={false} source={photo} resizeMode="cover" style={slot} />;
  const kind = homeIllustration(item);
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[slot, s.fallback, { backgroundColor: pastel(kind) }]}>
    {kind === 'neutral' ? <GezekBrandMark /> : <GezekAsset name={artwork(kind)} />}
  </View>;
});

function Heading({ title }: { title: string }) {
  return <Text accessibilityRole="header" style={s.heading}>{title}</Text>;
}

function CategoryIcon({ filter, selected = false }: { filter: ResultFilter; selected?: boolean }) {
  const names: Record<ResultFilter, [GezekAssetName, GezekAssetName]> = {
    experience: ['planIcon', 'planInverse'], place: ['venueIcon', 'venueInverse'],
    event: ['eventIcon', 'eventInverse'], idea: ['ideaIcon', 'ideaInverse'],
  };
  return <GezekAsset name={names[filter][selected ? 1 : 0]} />;
}

function artwork(kind: 'place' | 'event' | 'idea'): GezekAssetName {
  return kind === 'place' ? 'venueArtwork' : kind === 'event' ? 'eventArtwork' : 'ideaArtwork';
}
function pastel(kind: 'place' | 'event' | 'idea' | 'neutral'): string {
  return kind === 'place' ? C.mint : kind === 'event' ? C.coral : kind === 'idea' ? C.lavender : C.blueWhisper;
}

const Discovery = memo(function Discovery({ filter, onSelectFilter }: { filter: 'place' | 'event' | 'idea'; onSelectFilter: GezekHomeProps['onSelectFilter'] }) {
  const labels = { place: ['Mekânlar', 'Kahve, sanat ve şehir durakları'], event: ['Etkinlikler', 'Bugün ve bu hafta'], idea: ['Fikir', 'Küçük bir başlangıç'] };
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${labels[filter][0]} önerilerini keşfet`} onPress={() => onSelectFilter(filter)} style={[s.discoveryCard, { backgroundColor: pastel(filter) }]}>
    <Text style={s.discoveryLabel}>{labels[filter][0]}</Text><Text style={s.discoveryCopy}>{labels[filter][1]}</Text>
    <View style={s.discoveryArt}><GezekAsset name={artwork(filter)} /></View>
  </TouchableOpacity>;
});

function PrimaryAction({ label, accessibilityLabel = label, onPress, flex = false }: { label: string; accessibilityLabel?: string; onPress: () => void; flex?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={[s.primaryAction, flex && s.flex]}>
    <View accessible={false} style={s.markerSpacer} /><Text style={s.primaryText}>{label}</Text>
    <View style={s.yellowMarker}><GezekAsset name="chevron" /></View>
  </TouchableOpacity>;
}

function EmptyCard({ filter, onEdit, onHidden }: { filter: ResultFilter; onEdit: () => void; onHidden: () => void }) {
  return <View style={s.stateCard}>
    <View style={s.stateIcon}><GezekAsset name="empty" /></View>
    <Text accessibilityRole="header" style={s.stateTitle}>{filter === 'event' ? 'Yaklaşan etkinlik bulunamadı' : 'Yeni bir öneri kalmadı'}</Text>
    <Text style={s.stateCopy}>{filter === 'event' ? 'Doğrulanan yeni tarihler burada görünecek.' : 'Tercihlerini güncelleyebilir veya gizlediklerini geri getirebilirsin.'}</Text>
    <PrimaryAction label="Tercihleri düzenle" onPress={onEdit} />
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Gizlenen önerileri göster" onPress={onHidden} style={s.secondaryAction}><Text style={s.saveText}>Gizlediklerini gör</Text></TouchableOpacity>
  </View>;
}

class HomeBoundary extends Component<{ children: ReactNode; onEdit: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, _info: ErrorInfo) {
    captureOperationalError(error, 'render', 'react_render_failed');
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <View accessibilityRole="alert" style={s.stateCard}>
      <View style={[s.stateIcon, { backgroundColor: C.coral }]}><GezekAsset name="error" /></View>
      <Text accessibilityRole="header" style={s.stateTitle}>Bir şeyler ters gitti.</Text>
      <Text style={s.stateCopy}>Planlarını şu an gösteremedik. Biraz sonra yeniden deneyelim.</Text>
      <PrimaryAction label="Tekrar dene" onPress={() => this.setState({ failed: false })} />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tercihleri düzenle" onPress={this.props.onEdit} style={s.secondaryAction}><Text style={s.saveText}>Tercihleri düzenle</Text></TouchableOpacity>
    </View>;
  }
}

export function GezekHomeLoading() {
  return <View accessibilityLabel="Öneriler hazırlanıyor" accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" style={s.loadingCard}>
    <View style={s.scanStatus}><GezekAsset name="scanSpinner" /><Text style={s.scanText}>Önerilerin hazırlanıyor</Text></View>
    <View accessible={false} style={s.radar}>
      <Image accessible={false} resizeMode="contain" source={RADAR} style={s.radarOuter} />
      <View style={s.radarInner}><GezekAsset name="radarInner" /></View>
      <View style={s.radarIcon}><GezekAsset name="radarIcon" /></View>
      <View style={s.radarFocus}><GezekAsset name="radarFocus" /></View>
    </View>
    <View accessible={false} style={s.skeletonCopy}>
      <View style={[s.skeletonBar, { width: '76%', height: 12 }]} /><View style={[s.skeletonBar, { width: '50%', height: 10 }]} />
      <View style={s.skeletonChips}><View style={[s.skeletonBar, { width: 58 }]} /><View style={[s.skeletonBar, { width: 68 }]} /><View style={[s.skeletonBar, { width: 52, backgroundColor: C.mint }]} /></View>
    </View>
    <View accessible={false} style={s.skeletonReason}><GezekAsset name="skeletonDot" /><View style={[s.skeletonBar, s.flex, { height: 10, backgroundColor: C.success }]} /></View>
    <View style={s.preparing}><GezekAsset name="preparingSpinner" /><Text style={s.preparingText}>Plan hazırlanıyor…</Text><GezekAsset name="preparingDot" /></View>
  </View>;
}

export function GezekBottomNavigation({ active, savedCount, onHome, onSaved, onGuides }: { active: 'home' | 'saved' | 'guides'; savedCount: number; onHome: () => void; onSaved: () => void; onGuides: () => void }) {
  const destinations: { id: 'home' | 'saved' | 'guides'; label: string; onPress: () => void; icons: [GezekAssetName, GezekAssetName] }[] = [
    { id: 'home', label: 'Ana Sayfa', onPress: onHome, icons: ['homeInactive', 'homeActive'] },
    { id: 'saved', label: 'Kaydedilenler', onPress: onSaved, icons: ['savedInactive', 'savedActive'] },
    { id: 'guides', label: 'Ankara 101', onPress: onGuides, icons: ['guideInactive', 'guideActive'] },
  ];
  return <View accessibilityRole="tablist" style={s.bottom}>
    {destinations.map(tab => <TouchableOpacity key={tab.id} accessibilityRole="tab" accessibilityLabel={tab.id === 'saved' ? `${tab.label}, ${savedCount} kayıt` : tab.label}
      accessibilityState={{ selected: active === tab.id }} onPress={tab.onPress} style={s.bottomTab}>
      <GezekAsset name={tab.icons[active === tab.id ? 1 : 0]} />
      <Text style={[s.bottomLabel, active === tab.id && s.bottomActive]}>{tab.label}</Text>
    </TouchableOpacity>)}
  </View>;
}

const s = StyleSheet.create({
  screen: { paddingBottom: 20 }, flex: { flex: 1, minWidth: 0 },
  atmosphere: { position: 'absolute', top: -L.homeTopInset, left: -L.screenHorizontalInset, right: -L.screenHorizontalInset },
  top: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settings: { width: 44, height: 44, borderRadius: R.full, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  intro: { gap: 3, marginTop: S.section }, eyebrow: { ...T.eyebrow, color: C.cobalt, fontFamily: F.semiBold },
  title: { ...T.home, color: C.navy, fontFamily: F.extraBold }, bodyMuted: { ...T.body, color: C.mutedText, fontFamily: F.regular },
  label: { ...T.label, color: C.navy, fontFamily: F.semiBold },
  preference: { ...shadow, marginTop: S.section, minHeight: 60, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: R.preference, borderWidth: 1, borderColor: C.blueBorder, backgroundColor: C.blueWhisper },
  preferenceIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.yellow },
  preferenceText: { ...T.body, color: C.navy, fontFamily: F.regular, flex: 1, minWidth: 0 },
  edit: { ...T.small, color: C.cobalt, fontFamily: F.medium },
  context: { marginTop: S.section, backgroundColor: C.blueWhisper, borderRadius: R.image, paddingHorizontal: 12, paddingVertical: 8, gap: 8, flexDirection: 'row', alignItems: 'center' },
  contextAction: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  tabs: { ...shadow, marginTop: S.section, height: L.selectorHeight, borderRadius: R.surfaceLarge, backgroundColor: C.surface, flexDirection: 'row', overflow: 'hidden' },
  tab: { flex: 1, minWidth: 0, minHeight: 44, height: L.selectorHeight, alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 6 },
  tabText: { ...T.label, color: C.navy, fontFamily: F.semiBold }, inverseText: { color: C.canvas },
  location: { marginTop: S.section, minHeight: 60, borderRadius: R.image, backgroundColor: C.locationNotice, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  noticeText: { ...T.body, color: C.navy, fontFamily: F.regular, flex: 1, minWidth: 0 }, disabled: { opacity: 0.6 },
  undo: { marginTop: S.section, minHeight: 48, borderRadius: R.image, backgroundColor: C.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  undoText: { ...T.label, fontFamily: F.semiBold, color: C.surface }, undoAction: { ...T.label, fontFamily: F.semiBold, color: C.yellow },
  heading: { ...T.section, color: C.navy, fontFamily: F.bold, marginTop: S.section, marginBottom: S.section },
  mainCard: { ...shadow, padding: 12, gap: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: R.surfaceLarge },
  mainImage: { height: L.mainImageHeight, width: '100%', borderRadius: R.image, overflow: 'hidden' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  mainTitle: { ...T.card, color: C.navy, fontFamily: F.bold },
  reason: { backgroundColor: C.mint, borderRadius: R.image, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', gap: 8 },
  reasonDot: { marginTop: 4 }, reasonText: { ...T.body, fontFamily: F.regular, color: C.navy, flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  primaryAction: { minHeight: 44, paddingHorizontal: 8, paddingVertical: 6, borderRadius: R.surface, backgroundColor: C.navy, flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryText: { ...T.button, fontFamily: F.semiBold, color: C.surface, flex: 1, minWidth: 0, textAlign: 'center' },
  markerSpacer: { width: 32, height: 32 }, yellowMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  save: { minHeight: 44, minWidth: 78, paddingHorizontal: 18, borderWidth: 1.25, borderColor: C.cobalt, borderRadius: R.full, alignItems: 'center', justifyContent: 'center' },
  saved: { backgroundColor: C.blueWhisper }, saveText: { ...T.label, fontFamily: F.semiBold, color: C.cobalt, textAlign: 'center' },
  dismiss: { minHeight: 44, minWidth: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  dismissText: { ...T.small, fontFamily: F.medium, color: C.mutedText, textDecorationLine: 'underline' },
  alternativeList: { gap: S.section },
  alternative: { ...shadow, minHeight: 144, paddingHorizontal: 12, paddingVertical: 16, borderWidth: 1, borderColor: C.border, borderRadius: R.surface, backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: S.section },
  altImage: { width: L.alternativeImageSize, height: L.alternativeImageSize, borderRadius: R.image, overflow: 'hidden' },
  altCopy: { flex: 1, minWidth: 0, gap: 5 }, altEyebrow: { ...T.small, fontFamily: F.medium, color: C.danger },
  altTitle: { ...T.label, fontFamily: F.semiBold, color: C.navy }, chevron: { ...T.section, color: C.cobalt, fontFamily: F.bold },
  exhausted: { marginTop: S.section, minHeight: 60, borderRadius: R.image, padding: 12, gap: 10, backgroundColor: C.lavender, flexDirection: 'row', alignItems: 'center' },
  refresh: { ...shadow, marginTop: S.section, minHeight: 44, paddingHorizontal: 8, paddingVertical: 6, gap: 8, backgroundColor: C.blueWhisper, borderWidth: 1, borderColor: C.cobalt, borderRadius: R.surface, flexDirection: 'row', alignItems: 'center' },
  refreshText: { ...T.button, color: C.navy, fontFamily: F.semiBold, flex: 1, minWidth: 0, textAlign: 'center' },
  discovery: { marginTop: S.section }, sectionTitle: { ...T.section, color: C.navy, fontFamily: F.bold, marginBottom: S.section },
  lowerAtmosphere: { position: 'absolute', left: -176, top: -96 },
  discoveryGrid: { flexDirection: 'row', gap: S.section, alignItems: 'stretch' },
  discoveryCard: { minHeight: 142, paddingHorizontal: 10, paddingTop: 11, paddingBottom: 8, gap: 3, borderRadius: R.image, flex: 1, minWidth: 0, overflow: 'hidden' },
  discoveryLabel: { ...T.label, color: C.navy, fontFamily: F.semiBold },
  discoveryCopy: { ...T.small, color: C.mutedText, fontFamily: F.medium },
  discoveryArt: { flex: 1, minHeight: 72, alignItems: 'flex-end', justifyContent: 'flex-end', marginTop: 3 },
  utilities: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, marginTop: S.section },
  utilityHit: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  utilityText: { ...T.small, color: C.mutedText, fontFamily: F.medium },
  stateCard: { ...shadow, minHeight: 336, borderWidth: 1, borderColor: C.border, borderRadius: R.surface, backgroundColor: C.surface, paddingHorizontal: 20, paddingVertical: 18, gap: 10 },
  stateIcon: { width: 64, height: 64, borderRadius: R.full, backgroundColor: C.lavender, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  stateTitle: { ...T.card, fontFamily: F.bold, color: C.navy, textAlign: 'center' },
  stateCopy: { ...T.body, fontFamily: F.regular, color: C.mutedText, textAlign: 'center' },
  secondaryAction: { minHeight: 44, borderRadius: R.full, borderWidth: 1.25, borderColor: C.cobalt, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
  loadingCard: { ...shadow, minHeight: 336, paddingHorizontal: 14, paddingVertical: 12, gap: 8, borderWidth: 1, borderColor: C.border, borderRadius: R.surface, backgroundColor: C.surface },
  scanStatus: { minHeight: 32, backgroundColor: C.mint, borderRadius: R.image, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanText: { ...T.label, fontFamily: F.semiBold, color: C.navy, flex: 1 },
  radar: { height: 104, backgroundColor: C.lavender, borderRadius: R.image, alignItems: 'center', justifyContent: 'center' },
  radarOuter: { width: 68, height: 68 }, radarInner: { position: 'absolute' }, radarIcon: { position: 'absolute' },
  radarFocus: { position: 'absolute', top: 20, left: '59%' },
  skeletonCopy: { gap: 6 }, skeletonBar: { height: 12, borderRadius: R.full, backgroundColor: C.border }, skeletonChips: { flexDirection: 'row', gap: 8 },
  skeletonReason: { height: 38, backgroundColor: C.mint, borderRadius: R.image, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  preparing: { minHeight: 44, paddingHorizontal: 14, gap: 10, borderRadius: R.image, backgroundColor: C.navy, flexDirection: 'row', alignItems: 'center' },
  preparingText: { ...T.label, color: C.surface, fontFamily: F.semiBold, flex: 1 },
  bottom: { minHeight: L.bottomNavigationHeight, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12, backgroundColor: C.surface, flexDirection: 'row' },
  bottomTab: { minHeight: 44, minWidth: 44, flex: 1, gap: 3, alignItems: 'center', justifyContent: 'center' },
  bottomLabel: { ...T.navigation, color: C.mutedText, fontFamily: F.semiBold }, bottomActive: { color: C.cobalt },
});
