import { cloneElement, isValidElement, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgAst, parse } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F, GEZEK_SURFACE_SHADOW as shadow } from '../../design/gezekTheme';
import { canContinueOnboarding, onboardingFooterClearance, ONBOARDING_STEPS, OnboardingAction, OnboardingSession } from '../../onboarding';
import type { PreferenceDraft } from '../../preferenceEditor';
import { beginOnboardingTransition, onboardingInitialTranslation } from '../../onboardingTransition';
import { BrandLogo } from './BrandLogo';
import { PreferenceOptions, preferenceLabel } from './PreferenceControls';
import { focusDetailControl } from './detailFocus';
import { ONBOARDING_ASSETS as assets } from './onboardingAssetXml';
import { ONBOARDING_BACKGROUND_LAYERS as layers } from './onboardingArtwork';

type AssetName = keyof typeof assets;
const choices = {
  mood: [
    { value: 'Enerjik', label: 'Enerjik', hint: 'Hareketli ve tempolu', icon: '950cf', color: C.lavender },
    { value: 'Sakin', label: 'Sakin', hint: 'Yavaş ve dingin', icon: '83291', color: C.mint },
    { value: 'Sosyal', label: 'Sosyal', hint: 'Biraz insan, biraz sohbet', icon: '5885a', color: C.coral },
    { value: 'Meraklı', label: 'Meraklı', hint: 'Yeni şeyler keşfet', icon: '49828', color: C.lavender },
  ],
  budget: [
    { value: 'Ücretsiz', label: 'Bedava', hint: 'Harcama gerektirmeyen', icon: 'b8de7', color: C.mint },
    { value: '₺', label: '₺', hint: 'Uygun bütçeli', icon: 'ba91e', color: C.lavender },
    { value: '₺₺', label: '₺₺', hint: 'Orta bütçeli', icon: 'f83ae', color: C.lavender },
    { value: '₺₺₺', label: '₺₺₺', hint: 'Daha geniş bütçeli', icon: 'e725b', color: C.lavender },
    { value: 'Fark etmez', label: 'Fark etmez', hint: 'Bütçeye göre eleme yapma', icon: '64bf9', color: C.surface },
  ],
  group: [
    { value: 'Tek', label: '1', hint: 'Tek başıma', icon: 'acf9e', color: C.lavender },
    { value: '2 kişi', label: '2', hint: '2 kişi', icon: '02e36', color: C.lavender },
    { value: '3–4 kişi', label: '3–4', hint: '3–4 kişi', icon: '4cf3a', color: C.mint },
    { value: '5+', label: '5+', hint: 'Kalabalık grup', icon: '03f7b', color: C.coral },
  ],
  duration: [
    { value: '30–60 dk', label: '30–60 dk', hint: 'Kısa bir mola', icon: '01cae', color: C.lavender },
    { value: '1–2 saat', label: '1–2 saat', hint: 'Rahat bir plan', icon: '771c1', color: C.lavender },
    { value: '3–4 saat', label: '3–4 saat', hint: 'Uzun bir keşif', icon: '0577e', color: C.mint },
    { value: 'Yarım gün', label: 'Yarım gün', hint: 'Geniş zamanlı bir plan', icon: '079c9', color: C.coral },
    { value: 'Fark etmez', label: 'Fark etmez', hint: 'Serbest', icon: 'a2efc', color: C.surface },
  ],
} as const;
const headings = {
  mood: { title: 'Bugün nasıl bir plan iyi gider?', copy: 'Bugünkü planın havasını seç.', badge: 'Başladık', gap: 76 },
  interest: { title: 'Neler ilgini çekiyor?', copy: 'Bir veya birkaçını seç. Sonraki önerilerinde dikkate alacağız.', badge: 'İyi gidiyor', gap: 72 },
  budget: { title: 'Bugün için bütçen ne?', copy: 'Yaklaşık bir aralık seç. Bütçene uyan planları öne çıkaralım.', badge: 'Yarıyı geçtin', gap: 46 },
  group: { title: 'Bugün kaç kişisiniz?', copy: 'Planı kişi sayınıza göre ayarlayalım.', badge: 'Az kaldı', gap: 104 },
  duration: { title: 'Bugün ne kadar vaktin var?', copy: 'Planlara ayırabileceğin maksimum süreyi seç. İlk durağa ulaşım ve eve dönüş hariç.', badge: 'Son soru', gap: 16 },
};

// Parsed SVG elements are immutable; reuse across keyed scenes and timeline renders.
const assetAsts = new Map<AssetName, ReturnType<typeof parse>>();
function assetAst(name: AssetName) {
  if (!assetAsts.has(name)) assetAsts.set(name, parse(assets[name].xml));
  return assetAsts.get(name)!;
}
const PREPARING_SPINNER = require('../../../assets/gezek/onboarding/4cd91.png');
const Asset = memo(function Asset({ name }: { name: AssetName }) {
  const asset = assets[name];
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width: asset.width, height: asset.height }}><SvgAst ast={assetAst(name)} /></View>;
});

/** Conservative until the asynchronous OS preference resolves; timing belongs to the controller. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);
  return reduced;
}

/** Shared Figma timeline: only presentation; never commits preferences or navigates. */
function useTimeline(reduced: boolean, revision: number, preparing: boolean, ready: boolean) {
  const clock = useRef(new Animated.Value(0)).current;
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    clock.stopAnimation(); clock.setValue(0); setElapsed(0);
    if (reduced) return;
    const listener = clock.addListener(({ value }) => setElapsed(value));
    const duration = ready ? 2000 : preparing ? 6000 : 60000;
    const animation = Animated.loop(Animated.timing(clock, { toValue: duration, duration, easing: Easing.linear, useNativeDriver: false }));
    animation.start();
    return () => { animation.stop(); clock.removeListener(listener); };
  }, [clock, reduced, revision, preparing, ready]);
  return elapsed;
}
const cssEaseOut = Easing.bezier(0, 0, .58, 1);
const cssEaseInOut = Easing.bezier(.42, 0, .58, 1);
const clamp = (t: number) => Math.min(1, Math.max(0, t));
const easeOut = (t: number) => cssEaseOut(clamp(t));
const routeEnds = [0, .1355, .2953, .4497, .5956, .7301, .8641, 1];
// Measured from the exact exported cubic path, not a replacement drawing.
const routeLength = 2955.89158;
const routeAst = parse(assets.ecf2d.xml)!;
function Route({ trim }: { trim: number }) {
  const ast = useMemo(() => ({ ...routeAst, children: routeAst.children.map(child => isValidElement(child) ? cloneElement(child as React.ReactElement<Record<string, unknown>>, { strokeDasharray: [routeLength * trim, routeLength], strokeDashoffset: 0 }) : child) }), [trim]);
  return <SvgAst ast={ast} />;
}
function Background({ session, reduced, elapsed, width }: { session: OnboardingSession; reduced: boolean; elapsed: number; width: number }) {
  const index = ONBOARDING_STEPS.indexOf(session.step);
  const start = routeEnds[index], end = routeEnds[index + 1];
  const trim = reduced || session.prepared ? end : start + (end - start) * easeOut((elapsed - (index ? 460 : 100)) / (index === 6 ? 660 : index ? 680 : 900));
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={s.artwork}>
    <View style={{ width: 393, height: 852, transformOrigin: 'top left', transform: [{ scale: width / 393 }] }}>
      {layers[session.step].map((layer, i) => <View key={i} style={{ position: 'absolute', left: layer.x, top: layer.y }}>
        {layer.name === 'ecf2d' ? <Route trim={trim} /> : <Asset name={layer.name as AssetName} />}
      </View>)}
    </View>
  </View>;
}
function Progress({ fraction, elapsed, reduced, label, busy = false, tall = false, ready = false }: { fraction: number; elapsed: number; reduced: boolean; label: string; busy?: boolean; tall?: boolean; ready?: boolean }) {
  const [fillWidth, setFillWidth] = useState(0);
  const activeMs = [780, 872, 973, 1074, 1120][Math.round((fraction - .1) / .2)] ?? 1120;
  const tick = ready ? elapsed % 2000 : Math.max(0, elapsed - 1150) % (activeMs + 620);
  const sweep = ready ? clamp((tick - 100) / 1050) : tick / activeMs;
  const opacity = ready ? tick < 120 ? .62 * easeOut(tick / 120) : tick < 1100 ? .62 : .62 * (1 - easeOut((tick - 1100) / 120)) : .94;
  return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{ busy }} accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }} style={[s.track, tall && s.preparingTrack]}>
    <View onLayout={event => setFillWidth(event.nativeEvent.layout.width)} style={[s.fill, { width: `${fraction * 100}%` }]}>
      {!reduced && (ready || elapsed >= 1150) && sweep <= 1 && <View accessible={false} style={[s.shimmer, { width: ready ? 56 : 30, left: ready ? -56 : -30, opacity, transform: [{ translateX: sweep * (fillWidth + (ready ? 56 : 30)) }] }]}><LinearGradient colors={['#FFFFFF00', '#FFFFFF9E', '#FFFFFF00']} start={{ x: 0, y: .5 }} end={{ x: 1, y: .5 }} style={s.gradient} /></View>}
    </View>
  </View>;
}

type HostProps = { session: OnboardingSession; onAction: (action: OnboardingAction) => void; onComplete: () => void };
export function OnboardingHost(props: HostProps) {
  const reduced = useReducedMotion();
  return <OnboardingScene key={props.session.revision} {...props} reduced={reduced} />;
}

function OnboardingScene({ session, onAction, onComplete, reduced }: HostProps & { reduced: boolean }) {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const preparing = session.step === 'preparing', welcome = session.step === 'welcome';
  const elapsed = useTimeline(reduced, session.revision, preparing, session.prepared);
  const [footerHeight, setFooterHeight] = useState(108);
  const title = useRef<View>(null), readyAction = useRef<View>(null), scroll = useRef<ScrollView>(null);
  const controls = useRef<Record<string, View | null>>({});
  const [translation] = useState(() => new Animated.Value(onboardingInitialTranslation(session.direction, width, reduced)));
  const field = session.step === 'group' ? 'groupSize' : session.step === 'interest' ? 'interests' : session.step;
  const selected = field === 'interests' ? session.draft.interests[0] : session.draft[field as keyof PreferenceDraft];
  const transition = useRef<ReturnType<typeof beginOnboardingTransition> | undefined>(undefined);
  const focusStep = useRef<() => void>(() => {});
  focusStep.current = () => focusDetailControl(session.direction === 'back' && typeof selected === 'string' && controls.current[selected] ? controls.current[selected] : title.current);
  useLayoutEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    const lifecycle = beginOnboardingTransition({
      frame: callback => requestAnimationFrame(callback),
      cancelFrame: id => cancelAnimationFrame(id),
      start: complete => {
        const animation = Animated.timing(translation, { toValue: 0, duration: session.direction === 'back' ? 440 : 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true });
        animation.start(({ finished }) => complete(finished));
        return () => animation.stop();
      },
      rest: () => translation.setValue(0),
      focus: () => focusStep.current(),
    }, reduced);
    transition.current = lifecycle;
    return () => lifecycle.cancel();
    // Keyed revision owns this lifecycle; answer/width/OS changes never replay it.
  }, []);
  useLayoutEffect(() => { if (reduced) transition.current?.reduceMotion(); }, [reduced]);
  useLayoutEffect(() => {
    if (!session.prepared) return;
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => focusDetailControl(readyAction.current)); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, [session.prepared]);
  const compact = height - insets.top - insets.bottom < 740 || fontScale > 1.2;
  const question = !welcome && !preparing ? headings[session.step as keyof typeof headings] : undefined;
  const questionNumber = ONBOARDING_STEPS.indexOf(session.step);
  const fraction = [.1, .3, .5, .7, .9][questionNumber - 1] ?? 0;
  const oldFraction = questionNumber <= 1 ? 0 : fraction - .2;
  const progress = reduced ? fraction : oldFraction + (fraction - oldFraction) * easeOut((elapsed - 20) / 400);
  const preparingFraction = session.prepared ? 1 : reduced ? .94 : elapsed < 120 ? 97 / 345 : elapsed < 1350 ? (97 + 93 * cssEaseInOut(clamp((elapsed - 120) / 1230))) / 345 : elapsed < 2550 ? (190 + 86 * cssEaseInOut(clamp((elapsed - 1350) / 1200))) / 345 : (276 + 48 * easeOut((elapsed - 2550) / 1200)) / 345;
  const stage = session.prepared ? 'Bugünün planı hazır!' : reduced ? 'Son dokunuşlar yapılıyor' : elapsed < 1200 ? 'Seçimlerin eşleştiriliyor' : elapsed < 2300 ? 'Sana uygun rotalar taranıyor' : elapsed < 3400 ? 'Planın dengeleniyor' : 'Son dokunuşlar yapılıyor';
  const disabled = !canContinueOnboarding(session);
  const label = welcome ? 'Başlayalım' : preparing ? 'Planı Gör' : session.step === 'duration' ? 'Planımı hazırla' : 'Devam et';
  return <View style={s.root} testID="production-onboarding">
    <StatusBar style="dark" />
    <Background session={session} reduced={reduced} elapsed={elapsed} width={width} />
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={s.safe}>
      <Animated.View testID="onboarding-scene" style={[s.safe, { transform: [{ translateX: translation }] }]}>
        <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { maxWidth: preparing ? 433 : 457, paddingHorizontal: preparing ? 24 : 32, paddingTop: Math.max(0, (welcome ? 34 : 28) - insets.top), paddingBottom: onboardingFooterClearance(footerHeight) }]}>
          <View style={s.nav}><BrandLogo size={welcome ? 28 : preparing ? 24 : 22} /><View style={[s.badge, (welcome || preparing) && s.mint, welcome && s.welcomeBadge, preparing && s.preparingBadge]}><Text style={[s.badgeText, (welcome || preparing) && s.green]}>{welcome ? 'ANKARA' : preparing ? session.prepared ? '● Hazır' : '● Hazırlanıyor' : question!.badge}</Text></View></View>
          {question && <><View style={s.headerProgress}><Progress fraction={progress} elapsed={elapsed} reduced={reduced} label={`Onboarding ilerlemesi, ${questionNumber}. soru`} /></View><Text style={s.eyebrow}>{questionNumber}. SORU</Text></>}
          <View ref={title} accessible focusable tabIndex={-1} accessibilityRole="header" accessibilityLabel={welcome ? 'Bugün sana uyan bir plan bulalım.' : preparing ? 'Senin için bugünün planını hazırlıyoruz.' : question!.title} style={welcome ? [s.welcomeIntro, compact && s.compactWelcome] : preparing ? s.preparingIntro : s.questionIntro}>
            {welcome && <Text accessible={false} style={s.welcomeEyebrow}>ANKARA’DA BUGÜN</Text>}
            <Text accessible={false} style={[s.title, welcome && s.welcomeTitle, preparing && s.preparingTitle]}>{welcome ? 'Bugün sana uyan\nbir plan bulalım.' : preparing ? 'Senin için bugünün planını hazırlıyoruz.' : question!.title}</Text>
          </View>
          <Text style={[s.copy, welcome && s.welcomeCopy]}>{welcome ? 'Ruh hâlini, ilgilerini ve vaktini seç; planını hazırlayalım.' : preparing ? 'Seçimlerini bir araya getirip bugün gerçekten yapabileceğin planları sıralıyoruz.' : question!.copy}</Text>
          {welcome && <View style={s.promise}><View style={s.promiseTile}><Asset name="3d065" /></View><View style={s.flex}><Text style={s.promiseTitle}>Gerçekten yapabileceğin bir plan</Text><Text style={s.hint}>Süresi, bütçesi ve neden sana uygun olduğu birlikte.</Text></View></View>}
          {question && <View style={{ marginTop: compact ? 24 : question.gap }}>
            {session.step === 'interest' ? <PreferenceOptions field="interests" draft={session.draft} onChange={value => onAction({ type: 'change', value })} /> : <View accessibilityRole="radiogroup" accessibilityLabel={question.title} style={s.grid}>
              {choices[session.step as keyof typeof choices].map(card => {
                const checked = session.draft[field as keyof PreferenceDraft] === card.value;
                const row = session.step === 'budget' || session.step === 'duration';
                return <Pressable key={card.value} accessibilityRole="radio" accessibilityLabel={`${card.label}: ${card.hint}`} accessibilityState={{ selected: checked, checked }} ref={node => { controls.current[card.value] = node; }} onPress={() => onAction({ type: 'change', value: { [field]: card.value } as Partial<PreferenceDraft> })} style={({ pressed }) => [s.card, row ? s.rowCard : s.tileCard, fontScale > 1.4 && !row && s.singleColumn, checked && s.selectedCard, checked && row && s.selectedRow, pressed && s.pressed]}>
                  <View style={[s.iconTile, row && s.rowTile, { backgroundColor: card.color }, card.color === C.surface && s.bordered]}><Asset name={card.icon} /></View>
                  <View style={[s.cardCopy, row && s.rowCopy]}><Text style={[s.cardTitle, row && s.rowTitle]}>{card.label}</Text><Text style={s.hint}>{card.hint}</Text></View>
                  {checked && <View style={[s.check, row && s.rowCheck]}><Asset name="f4c84" /><View style={s.checkMark}><Asset name="6057a" /></View></View>}
                </Pressable>;
              })}
            </View>}
          </View>}
          {preparing && <>
            <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.radar, compact && s.compactRadar]}>
              <Asset name="2569c" /><View style={s.radarMiddle}><Asset name="f1e66" /></View><View style={s.radarInner}><Asset name="04755" /></View>
              <View style={[s.spinner, !session.prepared && !reduced && { transform: [{ rotate: `${elapsed < 100 ? 0 : elapsed < 4550 ? (elapsed - 100) / 4450 * 1260 : 1350}deg` }] }]}>{session.prepared ? <Asset name="3fdf5" /> : <Image accessible={false} source={PREPARING_SPINNER} style={{ width: 26, height: 26 }} />}</View>
            </View>
            <Text accessibilityLiveRegion="polite" style={s.stage}>{stage}</Text><View accessibilityState={{ busy: !session.prepared || session.busy }}><Progress fraction={preparingFraction} elapsed={elapsed} reduced={reduced} ready={session.prepared} tall busy={!session.prepared || session.busy} label={session.prepared ? 'Planın hazır' : 'Planın hazırlanıyor'} /></View>
            <View style={s.summary}><Text style={s.summaryHeading}>SEÇTİĞİN PARAMETRELER</Text>{[
              ['Ruh hâlin:', session.draft.mood, C.blueWhisper],
              ['İlgi alanların:', session.draft.interests.join(' ve '), C.lavender],
              ['Bugünkü tercihler:', `${preferenceLabel(session.draft.budget)} · ${preferenceLabel(session.draft.groupSize)} · ${preferenceLabel(session.draft.duration)}`, C.mint],
            ].map(([name, value, color]) => <View key={name} style={[s.summaryRow, fontScale > 1.3 && s.summaryStack]}><Text style={s.summaryLabel}>{name}</Text><View style={[s.summaryPill, { backgroundColor: color }]}><Text style={s.summaryValue}>{value}</Text></View></View>)}</View>
            <Text style={s.readyNote}>{session.prepared ? 'Planın hazır. Ankara seni bekliyor.' : 'Az sonra bugünün planı hazır.'}</Text>
          </>}
        </ScrollView>
        <View onLayout={event => setFooterHeight(event.nativeEvent.layout.height)} style={[s.footer, { paddingHorizontal: preparing ? 24 : 32, paddingBottom: welcome ? 21 : preparing ? 40 : 28 }, compact && s.solidFooter]}>
          {session.step === 'mood' && <Text style={s.helper}>Bunu daha sonra değiştirebilirsin.</Text>}
          {session.step === 'interest' && <Text accessibilityLiveRegion="polite" style={[s.helper, s.count]}>{session.draft.interests.length} seçim yapıldı</Text>}
          {(!preparing || session.prepared) && <View style={s.actions}>
            {!welcome && !preparing && <Pressable accessibilityRole="button" accessibilityLabel="Önceki adıma dön" onPress={() => onAction({ type: 'back' })} style={({ pressed }) => [s.back, pressed && s.pressed]}><Asset name="bc612" /></Pressable>}
            <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, busy: session.busy }} disabled={disabled} ref={readyAction} onPress={preparing ? onComplete : () => onAction({ type: 'next' })} style={({ pressed }) => [s.primary, disabled && s.disabled, pressed && s.pressed]}>
              <View accessible={false} style={s.balance} /><Text style={s.primaryText}>{label}</Text><View style={s.marker}><Asset name="28a02" /></View>
            </Pressable>
          </View>}
          {welcome && <Text style={s.footnote}>◷ Yaklaşık 30 saniye</Text>}
        </View>
      </Animated.View>
    </SafeAreaView>
  </View>;
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas }, safe: { flex: 1 }, flex: { flex: 1 }, artwork: { position: 'absolute', inset: 0, overflow: 'hidden' },
  content: { width: '100%', alignSelf: 'center' }, nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, badge: { backgroundColor: C.lavender, borderRadius: 999, minWidth: 95, minHeight: 30, paddingVertical: 7, paddingHorizontal: 16, justifyContent: 'center' }, welcomeBadge: { minWidth: 80 }, preparingBadge: { minWidth: 117 }, badgeText: { fontFamily: F.medium, color: C.cobalt, fontSize: 11, lineHeight: 15, textAlign: 'center' }, mint: { backgroundColor: C.mint }, green: { color: C.venue },
  headerProgress: { marginTop: 12 }, track: { height: 6, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' }, preparingTrack: { height: 8 }, fill: { height: '100%', backgroundColor: C.cobalt, borderRadius: 4, overflow: 'hidden' }, shimmer: { position: 'absolute', top: 0, bottom: 0, width: 30 }, gradient: { flex: 1 }, eyebrow: { fontFamily: F.semiBold, fontSize: 11, lineHeight: 15, letterSpacing: 1.6, color: C.mutedText, marginTop: 15 },
  questionIntro: { marginTop: 20 }, title: { fontFamily: F.extraBold, color: C.navy, fontSize: 27, lineHeight: 35 }, copy: { fontFamily: F.regular, fontSize: 14, lineHeight: 18, color: C.mutedText, marginTop: 9 },
  welcomeIntro: { marginTop: 204 }, compactWelcome: { marginTop: 96 }, welcomeEyebrow: { fontFamily: F.semiBold, color: C.cobalt, fontSize: 11, lineHeight: 14, marginBottom: 17 }, welcomeTitle: { fontSize: 32, lineHeight: 40 }, welcomeCopy: { fontSize: 16, lineHeight: 20, marginTop: 8 }, promise: { marginTop: 48, minHeight: 142, borderRadius: 22, borderWidth: 1, borderColor: C.border, backgroundColor: '#FFFFFFEB', padding: 15, flexDirection: 'row', gap: 16, ...shadow }, promiseTile: { width: 52, height: 52, borderRadius: 18, backgroundColor: C.lavender, alignItems: 'center', justifyContent: 'center' }, promiseTitle: { fontFamily: F.bold, fontSize: 16, lineHeight: 20, color: C.navy, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, columnGap: 9 }, card: { backgroundColor: '#FFFFFFEB', borderRadius: 22, borderWidth: 1, borderColor: C.border, padding: 13, ...shadow }, selectedCard: { borderWidth: 2, borderColor: C.cobalt, padding: 12 }, selectedRow: { paddingHorizontal: 10, paddingVertical: 11 }, tileCard: { width: '48%', flexGrow: 1, minHeight: 148 }, singleColumn: { width: '100%' }, rowCard: { width: '100%', minHeight: 72, flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 11, paddingVertical: 12 }, iconTile: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, bordered: { borderWidth: 1, borderColor: C.border }, rowTile: { width: 44, height: 44 }, cardCopy: { flexShrink: 1 }, rowCopy: { flex: 1, paddingRight: 30 }, cardTitle: { color: C.navy, fontFamily: F.bold, fontSize: 17, lineHeight: 22, marginTop: 12 }, rowTitle: { marginTop: 0, fontSize: 15, lineHeight: 20 }, hint: { color: C.mutedText, fontFamily: F.regular, fontSize: 12, lineHeight: 16, marginTop: 6 }, check: { position: 'absolute', top: 12, right: 12 }, rowCheck: { top: '50%', marginTop: -11 }, checkMark: { position: 'absolute', top: 5, left: 5 },
  footer: { position: 'absolute', bottom: 0, alignSelf: 'center', width: '100%', maxWidth: 457, paddingTop: 16 }, solidFooter: { backgroundColor: C.canvas, borderTopWidth: 1, borderColor: C.border }, actions: { flexDirection: 'row', gap: 12, alignItems: 'stretch' }, back: { minWidth: 52, minHeight: 52, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center', ...shadow }, primary: { flex: 1, minWidth: 44, minHeight: 52, borderRadius: 22, backgroundColor: C.navy, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'center' }, primaryText: { flex: 1, textAlign: 'center', color: C.surface, fontFamily: F.semiBold, fontSize: 13, lineHeight: 18 }, balance: { width: 32 }, marker: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.yellow, justifyContent: 'center', alignItems: 'center' }, disabled: { opacity: .4 }, pressed: { opacity: .8 }, helper: { color: C.mutedText, fontFamily: F.regular, fontSize: 11, lineHeight: 14, marginBottom: 26, textAlign: 'center' }, count: { color: C.cobalt }, footnote: { fontFamily: F.regular, color: C.mutedText, fontSize: 11, lineHeight: 15, textAlign: 'center', marginTop: 16 },
  preparingIntro: { marginTop: 48 }, preparingTitle: { fontSize: 28, lineHeight: 36 }, radar: { width: 124, height: 124, alignSelf: 'center', marginTop: 87, marginBottom: 32 }, compactRadar: { marginTop: 28 }, radarMiddle: { position: 'absolute', left: 17, top: 17 }, radarInner: { position: 'absolute', left: 33, top: 33 }, spinner: { position: 'absolute', left: 49, top: 49 }, stage: { fontFamily: F.bold, color: C.navy, fontSize: 13, lineHeight: 17, marginBottom: 10 }, summary: { marginTop: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 22, padding: 17, ...shadow }, summaryHeading: { fontFamily: F.semiBold, color: C.mutedText, fontSize: 11, lineHeight: 14, marginBottom: 16 }, summaryRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }, summaryStack: { flexDirection: 'column', alignItems: 'flex-start' }, summaryLabel: { fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: C.mutedText, flexShrink: 1 }, summaryPill: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, maxWidth: '64%' }, summaryValue: { fontFamily: F.medium, color: C.navy, fontSize: 11, lineHeight: 16 }, readyNote: { color: C.cobalt, fontFamily: F.medium, fontSize: 12, lineHeight: 15, textAlign: 'center', marginTop: 30 },
});
