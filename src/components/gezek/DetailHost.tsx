import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { DETAIL_CONTENT_CLEARANCE, UndoNotice, DetailNavigationAction, DetailSession, detailExternalActions, resolveDetail } from '../../detailFlow';
import { distanceInKm, formatDurationRange } from '../../domain';
import { recommendExperiencesForPlace } from '../../recommendations';
import { Experience, Place } from '../../types';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F } from '../../design/gezekTheme';
import { ProductionArtwork } from './ProductionArtwork';
import { DETAIL_ASSET_XML } from './detailAssetXml';
import { UndoNoticeTransition } from './UndoNoticeTransition';
import { focusDetailControl } from './detailFocus';

type Props = {
  session: DetailSession;
  context: Parameters<typeof recommendExperiencesForPlace>[1];
  saved: readonly string[];
  loading?: boolean;
  undoNotice?: UndoNotice;
  onUndo: () => void;
  onNavigate: (action: DetailNavigationAction) => void;
  onSave: (id: string) => void;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
  onOpenMaps: (place: Place) => Promise<void>;
  onOpenSource: (place: Place) => Promise<void>;
  onOpenPlanMap: (plan: Experience) => Promise<void>;
  onOpenPlanSource: (plan: Experience) => Promise<void>;
};

/** One modal above the still-mounted origin; no recommendation rotation on entry or return. */
export function DetailHost(p: Props) {
  const frame = p.session.history[p.session.history.length - 1];
  const item = resolveDetail(frame, p.context.experiences, p.context.places);
  const place = item && 'name' in item ? item : undefined;
  const plan = item && !('name' in item) ? item : undefined;
  const dismissed = p.context.dismissed.includes(frame.id);
  const unavailable = !p.loading && !item;
  const disabled = !!p.loading || unavailable;
  const family = frame.kind === 'experience' ? 'GEZEK PLANI' : 'MEKÂN';
  const title = place?.name ?? plan?.title;
  const scroll = useRef<ScrollView>(null);
  const scrollY = useRef(frame.scrollY);
  const header = useRef<View>(null);
  const controls = useRef<Record<string, View | null>>({});
  const externalControl = useRef<View | null>(null);
  const mounted = useRef(true);
  const restorePending = useRef(true);
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const [artworkWidth, setArtworkWidth] = useState(329);
  const [footerHeight, setFooterHeight] = useState(96 + insets.bottom);
  const related = useMemo(() => place ? recommendExperiencesForPlace(place, { ...p.context, limit: p.context.experiences.length }) : [], [place, p.context]);
  const actions: { maps?: string; source?: string } = item && !dismissed && !disabled ? detailExternalActions(item) : {};
  const price = item ? '₺'.repeat(item.priceLevel) || 'Bedava' : '';
  const distance = place && p.context.coordinates ? distanceInKm(p.context.coordinates, place) : undefined;
  const metadata = plan ? `${plan.points.length} durak · ${formatDurationRange(plan.minDurationMinutes, plan.maxDurationMinutes)} · ${price}`
    : place ? [place.category, place.district, price, distance === undefined ? undefined : `${distance.toFixed(1)} km`].filter(Boolean).join(' · ') : '';
  const restoreFocus = () => {
    if (!restorePending.current) return;
    restorePending.current = false;
    requestAnimationFrame(() => {
      scroll.current?.scrollTo({ y: frame.scrollY, animated: false });
      focusDetailControl((frame.returnFocusKey && controls.current[frame.returnFocusKey]) || header.current);
    });
  };
  useEffect(() => {
    restorePending.current = true;
    scrollY.current = frame.scrollY;
    const raf = requestAnimationFrame(restoreFocus);
    return () => cancelAnimationFrame(raf);
  }, [frame.kind, frame.id, p.session.history.length, dismissed, p.loading]);
  useEffect(() => {
    mounted.current = true;
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && externalControl.current) {
        const node = externalControl.current;
        externalControl.current = null;
        requestAnimationFrame(() => focusDetailControl(node));
      }
    });
    return () => { mounted.current = false; externalControl.current = null; subscription.remove(); };
  }, []);
  const push = (kind: 'experience' | 'place', id: string, key: string, reasons?: readonly string[]) =>
    p.onNavigate({ type: 'push', route: { kind, id, reasons }, scrollY: scrollY.current, focusKey: key });
  const external = (key: string, open: () => Promise<void>) => {
    externalControl.current = controls.current[key];
    void open().catch(() => { if (mounted.current) Alert.alert('Bağlantı açılamadı', 'Lütfen tekrar dene.'); }).finally(() => { if (mounted.current) requestAnimationFrame(() => { if (mounted.current) focusDetailControl(controls.current[key]); }); });
  };
  const controlRef = (key: string) => (node: View | null) => { controls.current[key] = node; };
  const interactions = <View style={s.interactions}>
    <DetailButton icon="dismiss" label="Bana göre değil" disabled={disabled} busy={!!p.loading} onPress={() => p.onDismiss(frame.id)} />
    <DetailButton icon={p.saved.includes(frame.id) ? 'saved' : 'save'} label={p.saved.includes(frame.id) ? 'Kayıttan çıkar' : 'Kaydet'} iconOnly selected={p.saved.includes(frame.id)} disabled={disabled} busy={!!p.loading} onPress={() => p.onSave(frame.id)} />
  </View>;
  return <Modal visible animationType="none" onShow={() => { restorePending.current = true; restoreFocus(); }} onRequestClose={() => p.onNavigate({ type: 'back' })} accessibilityViewIsModal>
    <SafeAreaView edges={['top', 'left', 'right']} style={s.host}>
      <StatusBar style="dark" />
      <View style={s.header}>
        <DetailButton icon="back" iconOnly label={p.session.history.length > 1 ? 'Önceki detaya dön' : 'Geri dön'} onPress={() => p.onNavigate({ type: 'back' })} />
        <View ref={header} focusable tabIndex={-1} accessible accessibilityRole="header" accessibilityLabel={title ? `${family}: ${title}` : family} style={s.headerCopy}><Text accessible={false} style={s.family}>{family}</Text></View>
        <DetailButton icon="close" iconOnly label="Detayı kapat ve başladığın ekrana dön" onPress={() => p.onNavigate({ type: 'close' })} />
      </View>
      <ScrollView ref={scroll} key={`${frame.kind}:${frame.id}:${p.session.history.length}`} onContentSizeChange={restoreFocus} scrollEventThrottle={16} onScroll={event => { scrollY.current = event.nativeEvent.contentOffset.y; }} contentContainerStyle={[s.content, { paddingBottom: Math.max(DETAIL_CONTENT_CLEARANCE, footerHeight + 16) }]}>
        {dismissed && !disabled ? <View style={[s.status, s.dismissed]}>
          <Text accessibilityRole="header" style={s.heading}>Bu öneriyi gizledin</Text>
          <Text accessibilityLiveRegion="polite" style={s.muted}>Yeniden görmek için geri getir.</Text>
          <DetailButton label="Geri getir" prominent onPress={() => p.onRestore(frame.id)} />
        </View> : disabled ? <>
          <View accessibilityState={{ busy: !!p.loading }} style={[s.status, unavailable && s.unavailable]}>
            <Text accessibilityRole="header" style={s.heading}>{p.loading ? 'Detay hazırlanıyor' : 'Bu içerik şu anda kullanılamıyor'}</Text>
            <Text accessibilityLiveRegion="polite" style={s.muted}>{p.loading ? 'Bilgiler doğrulanıyor.' : 'Kaynak veya içerik güncellendiğinde yeniden deneyebilirsin.'}</Text>
          </View>
          {interactions}
        </> : item && <>
          <View style={[s.hero, { backgroundColor: plan ? C.lavender : C.mint }]}>
            <Text style={s.heroLabel}>{family}</Text>
            <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.artwork} onLayout={event => setArtworkWidth(event.nativeEvent.layout.width)}>
              <ProductionArtwork item={{ ...item, kind: frame.kind }} layout="Hero" width={artworkWidth} />
            </View>
          </View>
          {place && <View style={s.chips}>{[place.category.toLocaleUpperCase('tr-TR'), place.district.toLocaleUpperCase('tr-TR'), price].map((label, index) => <View key={index} style={[s.chip, { backgroundColor: C.mint }]}><Text style={s.chipText}>{label}</Text></View>)}</View>}
          <Text accessibilityRole="header" style={s.title}>{title}</Text>
          {interactions}
          <View style={s.card}>
            <View style={s.metaChip}><Text style={s.meta}>{metadata}</Text></View>
            {!!frame.reasons?.length && <><Text style={s.reasonLabel}>NEDEN SANA UYGUN?</Text><Text style={s.body}>{frame.reasons.join(' · ')}</Text></>}
          </View>
          {plan ? <View style={s.card}>
            <Text accessibilityRole="header" style={s.heading}>Planın akışı</Text>
            {plan.points.map((point, index) => <Pressable ref={controlRef(`stop:${index}:${point.placeId}`)} key={`${index}:${point.placeId}`} accessibilityRole="button" accessibilityLabel={`${index + 1}. durak: ${point.name}. Mekânı incele`} onPress={() => push('place', point.placeId, `stop:${index}:${point.placeId}`)} style={s.row}>
              <Text style={s.stop}>{index + 1}  {point.name}</Text>
            </Pressable>)}
            {!!plan.description && <Text style={s.body}>{plan.description}</Text>}
            {!!plan.note && <Text style={s.body}>{plan.note}</Text>}
            {!!plan.availabilityNote && <Text style={s.muted}>{plan.availabilityNote}</Text>}
          </View> : <View style={s.card}>
            <Text accessibilityRole="header" style={s.heading}>Mekân hakkında</Text>
            {!!place?.address && <Text style={s.body}>{place.address}</Text>}
            {!!place?.note && <Text style={s.body}>{place.note}</Text>}
            <Text accessibilityRole="header" style={[s.muted, s.relatedHeading]}>İlgili planlar</Text>
            {related.length ? related.map(relatedPlan => <Pressable ref={controlRef(`plan:${relatedPlan.id}`)} key={relatedPlan.id} accessibilityRole="button" accessibilityLabel={`${relatedPlan.title}. Planı incele`} onPress={() => push('experience', relatedPlan.id, `plan:${relatedPlan.id}`, relatedPlan.reasons)} style={s.row}>
              <Text style={s.stop}>{relatedPlan.title}</Text>
              <Text style={s.muted}>{relatedPlan.points.length} durak · {formatDurationRange(relatedPlan.minDurationMinutes, relatedPlan.maxDurationMinutes)}</Text>
            </Pressable>) : <Text style={s.muted}>Bu mekân için şu anda uygun bir plan yok.</Text>}
          </View>}
        </>}
      </ScrollView>
      <View onLayout={event => setFooterHeight(event.nativeEvent.layout.height)} style={[s.footer, { paddingBottom: 24 + insets.bottom }, fontScale > 1.3 && s.footerLarge]}>
        {!!actions.maps && <DetailButton nodeRef={controlRef('maps')} icon="maps" label={plan && plan.points.length > 1 ? 'Rotayı haritada aç' : 'Haritada aç'} external stretch onPress={() => external('maps', () => plan ? p.onOpenPlanMap(plan) : p.onOpenMaps(place!))} />}
        {!!actions.source && <DetailButton nodeRef={controlRef('source')} icon="source" label="Resmî bilgi" external stretch onPress={() => external('source', () => plan ? p.onOpenPlanSource(plan) : p.onOpenSource(place!))} />}
      </View>
      {!!p.undoNotice && <UndoNoticeTransition notice={p.undoNotice} style={[s.snackbar, { bottom: footerHeight + 8 }]}>
        <Text accessibilityLiveRegion="polite" style={s.snackbarText}>Öneri gizlendi</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Son gizlediğin öneriyi geri al" disabled={!!p.undoNotice.exiting} accessibilityState={{ disabled: !!p.undoNotice.exiting }} onPress={p.onUndo} style={s.undo}><Text style={s.undoText}>Geri al</Text></Pressable>
      </UndoNoticeTransition>}
    </SafeAreaView>
  </Modal>;
}

type ButtonProps = { label: string; icon?: keyof typeof DETAIL_ASSET_XML; iconOnly?: boolean; selected?: boolean; busy?: boolean; disabled?: boolean; stretch?: boolean; external?: boolean; prominent?: boolean; nodeRef?: (node: View | null) => void; onPress: () => void };
function DetailButton({ label, icon, iconOnly, selected, busy = false, disabled = false, stretch, external, prominent, nodeRef, onPress }: ButtonProps) {
  return <Pressable ref={nodeRef} accessibilityRole={external ? 'link' : 'button'} accessibilityLabel={label} accessibilityState={{ selected, busy, disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, iconOnly && s.iconButton, stretch && s.stretch, selected && s.selected, prominent && s.restoreButton, disabled && s.disabled, pressed && s.pressed]}>
    {icon && <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"><SvgXml accessible={false} xml={DETAIL_ASSET_XML[icon].xml} /></View>}
    {!iconOnly && <Text style={s.buttonText}>{label}</Text>}
  </Pressable>;
}

const s = StyleSheet.create({
  host: { flex: 1, backgroundColor: C.canvas },
  header: { minHeight: 72, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  headerCopy: { flex: 1 }, family: { fontFamily: F.semiBold, fontSize: 12, color: '#616E85' },
  content: { padding: 16, gap: 14 },
  hero: { padding: 16, gap: 20, minHeight: 164, borderRadius: 24 }, heroLabel: { fontFamily: F.bold, fontSize: 11, color: C.navy },
  artwork: { borderRadius: 22, overflow: 'hidden', width: '100%' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -6 }, chip: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7 }, chipText: { fontFamily: F.semiBold, fontSize: 10, color: C.navy },
  title: { fontFamily: F.bold, fontSize: 24, color: C.navy },
  interactions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  button: { minWidth: 44, minHeight: 44, borderRadius: 22, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  iconButton: { width: 44, height: 44, padding: 0 }, buttonText: { fontFamily: F.semiBold, fontSize: 12, color: C.navy, flexShrink: 1 },
  stretch: { flex: 1, minHeight: 48 }, restoreButton: { backgroundColor: C.yellow, alignSelf: 'flex-start', minWidth: 132 }, selected: { backgroundColor: C.canvas }, disabled: { opacity: .45 }, pressed: { backgroundColor: C.blueWhisper },
  card: { padding: 15, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, gap: 16 },
  metaChip: { alignSelf: 'flex-start', backgroundColor: C.canvas, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15 }, meta: { fontFamily: F.semiBold, fontSize: 12, color: C.navy },
  reasonLabel: { fontFamily: F.bold, fontSize: 11, color: C.cobalt }, body: { fontFamily: F.medium, fontSize: 14, color: C.navy },
  heading: { fontFamily: F.bold, fontSize: 18, color: C.navy }, muted: { fontFamily: F.medium, fontSize: 14, color: '#616E85' },
  row: { minHeight: 60, minWidth: 44, justifyContent: 'center', paddingVertical: 14, gap: 8, borderTopWidth: 1, borderTopColor: C.border }, stop: { fontFamily: F.semiBold, fontSize: 15, color: C.navy },
  relatedHeading: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 20 },
  status: { marginTop: 162, minHeight: 180, padding: 20, borderRadius: 24, gap: 24 }, dismissed: { backgroundColor: '#FFF2B8' }, unavailable: { backgroundColor: '#FFE8DB' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: 96, paddingHorizontal: 16, paddingTop: 24, flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.canvas }, footerLarge: { flexDirection: 'column' },
  snackbar: { position: 'absolute', left: 16, right: 16, minHeight: 56, paddingHorizontal: 18, backgroundColor: C.navy, borderRadius: 16, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, snackbarText: { color: C.surface, fontFamily: F.medium, fontSize: 14, flexShrink: 1 }, undo: { minHeight: 44, minWidth: 44, justifyContent: 'center' }, undoText: { color: C.yellow, fontFamily: F.semiBold, fontSize: 14 },
});
