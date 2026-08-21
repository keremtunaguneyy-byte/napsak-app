import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { initialCatalog, initializeDataBackbone, queuePreferencesForRemoteSync } from './src/backend';
import { loadPreferences, savePreferences } from './src/persistence';
import { RecommendationItem, recommendAll } from './src/recommendations';
import { DEFAULT_RESULT_FILTER, RESULT_FILTERS, ResultFilter } from './src/resultFilters';
import { BudgetPreference, DurationPreference, Event, Experience, GroupSizePreference, Guide, Idea, Interest, Mood, Place } from './src/types';
import { Coordinates, dismissId, formatDurationRange, resolveSavedPlaces, restoreId, toggleId } from './src/domain';
import { insiderRoutes } from './src/data/insiderRoutes';

type Step = 'welcome' | 'mood' | 'interest' | 'budget' | 'group' | 'duration' | 'results' | 'saved' | 'hidden' | 'guides';
type GuideView = 'landing' | 'classics' | 'insider';

const ANKARA_CASTLE_HERO = require('./assets/ankara101/ankara-castle-hero.jpg');
const KUGULU_TUNALI_HERO = require('./assets/ankara101/kugulu-tunali-hero.jpg');
const TUNALI_CAFE_DETAIL = require('./assets/ankara101/tunali-cafe-detail.jpg');
const CLASSICS_COLLECTION_ID = 'collection-ankara-classics';

const moods: { label: Mood; emoji: string; hint: string }[] = [
  { label: 'Enerjik', emoji: '⚡', hint: 'Hareket ve tempo' },
  { label: 'Sakin', emoji: '🌿', hint: 'Yavaşla ve nefes al' },
  { label: 'Sosyal', emoji: '✨', hint: 'İnsan içine karış' },
  { label: 'Meraklı', emoji: '🔎', hint: 'Yeni bir şey keşfet' },
];
const interests: { label: Interest; emoji: string }[] = [
  { label: 'Kahve', emoji: '☕' }, { label: 'Sanat', emoji: '🎨' },
  { label: 'Doğa', emoji: '🌳' }, { label: 'Lezzet', emoji: '🍜' },
  { label: 'Etkinlik', emoji: '🎭' },
];
const budgets: BudgetPreference[] = ['Ücretsiz', '₺', '₺₺', '₺₺₺', 'Fark etmez'];
const groupSizes: GroupSizePreference[] = ['Tek', '2 kişi', '3–4 kişi', '5+'];
const durations: DurationPreference[] = ['30–60 dk', '1–2 saat', '3–4 saat', 'Yarım gün', 'Fark etmez'];
export default function App() {
  return <SafeAreaProvider><AppContent /></SafeAreaProvider>;
}

function AppContent() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular: require('@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf'),
    CormorantGaramond_600SemiBold: require('@expo-google-fonts/cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf'),
    SourceSans3_400Regular: require('@expo-google-fonts/source-sans-3/400Regular/SourceSans3_400Regular.ttf'),
    SourceSans3_600SemiBold: require('@expo-google-fonts/source-sans-3/600SemiBold/SourceSans3_600SemiBold.ttf'),
    SourceSans3_700Bold: require('@expo-google-fonts/source-sans-3/700Bold/SourceSans3_700Bold.ttf'),
    SourceSans3_800ExtraBold: require('@expo-google-fonts/source-sans-3/800ExtraBold/SourceSans3_800ExtraBold.ttf'),
  });
  const { width } = useWindowDimensions();
  const [catalog, setCatalog] = useState(() => initialCatalog());
  const { places, ideas, events, experiences, guides } = catalog;
  const [step, setStep] = useState<Step>('welcome');
  const [mood, setMood] = useState<Mood>();
  const [chosen, setChosen] = useState<Interest[]>([]);
  const [budget, setBudget] = useState<BudgetPreference>('Fark etmez');
  const [groupSize, setGroupSize] = useState<GroupSizePreference>();
  const [duration, setDuration] = useState<DurationPreference>('Fark etmez');
  const [lastDismissed, setLastDismissed] = useState<string>();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [recommendationRun, setRecommendationRun] = useState(0);
  const [previousBatch, setPreviousBatch] = useState<string[]>([]);
  const [resultFilter, setResultFilter] = useState<ResultFilter>(DEFAULT_RESULT_FILTER);
  const scrollRef = useRef<ScrollView>(null);
  const recommendationsY = useRef(0);
  const scrollAfterRotation = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>();
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('Mesafeleri görmek için konumunu paylaş.');
  const [guideScrollProgress, setGuideScrollProgress] = useState(0);
  const [guideView, setGuideView] = useState<GuideView>('landing');
  const guidePaperY = useRef(0);
  const guideAnchors = useRef<Record<string, number>>({});
  const results = useMemo(() => {
    return recommendAll({ places, ideas, events, experiences, filter: resultFilter, mood, interests: chosen, dismissed, budget, groupSize, duration, coordinates, limit: 5, seed: recommendationRun, previousBatch });
  }, [mood, chosen, dismissed, budget, groupSize, duration, recommendationRun, coordinates, previousBatch, resultFilter]);
  const catalogItems = useMemo<(Place | Idea | Event | Experience)[]>(() => [...experiences, ...places, ...ideas, ...events], [experiences, places, ideas, events]);
  const savedItems = useMemo(() => resolveSavedPlaces<Place | Idea | Event | Experience>(catalogItems, saved), [catalogItems, saved]);
  const hiddenItems = useMemo(() => resolveSavedPlaces<Place | Idea | Event | Experience>(catalogItems, dismissed), [catalogItems, dismissed]);
  const savedGuides = useMemo(() => resolveSavedPlaces<Guide>(guides, saved), [guides, saved]);
  const savedInsiderRoutes = useMemo(() => insiderRoutes.filter(route => saved.includes(route.id)), [saved]);
  const totalGuideMinutes = useMemo(() => guides.reduce((total, guide) => total + guide.readMinutes, 0), [guides]);

  useEffect(() => {
    loadPreferences().then(preferences => {
      setSaved(preferences.saved);
      setDismissed(preferences.dismissed);
      setMood(preferences.mood);
      setChosen(preferences.interests);
      setBudget(preferences.budget ?? 'Fark etmez');
      setGroupSize(preferences.groupSize);
      setDuration(preferences.duration ?? 'Fark etmez');
      if (preferences.onboardingCompleted && preferences.mood) setStep('results');
      initializeDataBackbone(preferences).then(setCatalog).catch(() => {
        // The embedded catalogue is already usable; remote recovery retries later.
      });
    }).finally(() => setHydrated(true));
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const preferences = { saved, dismissed, mood, interests: chosen, budget, groupSize, duration, onboardingCompleted: step !== 'welcome' };
    savePreferences(preferences).catch(() => Alert.alert('Kayıt yapılamadı', 'Tercihlerin bu kez cihazına kaydedilemedi.'));
    queuePreferencesForRemoteSync(preferences).catch(() => {
      // Local persistence remains authoritative while offline.
    });
  }, [saved, dismissed, mood, chosen, budget, groupSize, duration, step, hydrated]);
  useEffect(() => {
    if (!scrollAfterRotation.current) return;
    // Effects run after commit; two frames also let native layout settle before
    // using the anchor measured in ScrollView content coordinates.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!scrollAfterRotation.current) return;
      scrollAfterRotation.current = false;
      scrollRef.current?.scrollTo({ y: Math.max(0, recommendationsY.current - 10), animated: true });
    }));
  }, [recommendationRun]);
  useEffect(() => {
    if (step !== 'guides') return;
    setGuideScrollProgress(0);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
  }, [guideView, step]);

  const requestLocation = async () => {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationMessage('Konum izni kapalı. Ayarlardan dilediğin zaman açabilirsin.');
        if (!permission.canAskAgain) Alert.alert('Konum izni gerekli', 'Yakınındaki sonuçları görmek için uygulama ayarlarından konum iznini açabilirsin.', [{ text: 'Vazgeç', style: 'cancel' }, { text: 'Ayarları aç', onPress: () => Linking.openSettings() }]);
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoordinates(current.coords);
      setLocationMessage('Canlı konumuna göre mesafeler güncellendi.');
    } catch {
      setLocationMessage('Konum alınamadı. Bağlantını kontrol edip tekrar dene.');
    } finally {
      setLocating(false);
    }
  };
  const toggle = (item: Interest) => setChosen(current => current.includes(item) ? current.filter(x => x !== item) : [...current, item]);
  const reset = () => { setStep('mood'); setMood(undefined); setChosen([]); setBudget('Fark etmez'); setGroupSize(undefined); setDuration('Fark etmez'); setRecommendationRun(0); setPreviousBatch([]); setResultFilter(DEFAULT_RESULT_FILTER); };
  const rotateRecommendations = () => {
    setPreviousBatch(results.map(place => place.id));
    scrollAfterRotation.current = true;
    setRecommendationRun(run => run + 1);
  };
  const dismissPlace = (id: string) => { setDismissed(c => dismissId(c, id)); setLastDismissed(id); };
  const restorePlace = (id: string) => setDismissed(current => restoreId(current, id));
  const selectResultFilter = (filter: ResultFilter) => {
    setResultFilter(filter);
    setPreviousBatch([]);
    setRecommendationRun(run => run + 1);
  };
  const openInMaps = async (place: Place) => {
    const label = encodeURIComponent(place.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${place.latitude},${place.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`,
    });
    if (!url || !(await Linking.canOpenURL(url))) {
      Alert.alert('Harita açılamadı', 'Bu cihazda kullanılabilir bir harita uygulaması bulunamadı.');
      return;
    }
    await Linking.openURL(url);
  };
  const openSource = async (place: Place) => {
    try {
      if (!(await Linking.canOpenURL(place.sourceUrl))) throw new Error('unsupported URL');
      await Linking.openURL(place.sourceUrl);
    } catch {
      Alert.alert('Bağlantı açılamadı', 'Resmî bilgi bağlantısı şu anda açılamıyor. Lütfen tekrar dene.');
    }
  };
  const openIdea = async (idea: Idea) => {
    try {
      if (!(await Linking.canOpenURL(idea.actionUrl))) throw new Error('unsupported URL');
      await Linking.openURL(idea.actionUrl);
    } catch {
      Alert.alert('Bağlantı açılamadı', 'Bu fikir için bağlantı şu anda açılamıyor. Lütfen tekrar dene.');
    }
  };
  const openEvent = async (event: Event) => {
    try {
      if (!(await Linking.canOpenURL(event.sourceUrl))) throw new Error('unsupported URL');
      await Linking.openURL(event.sourceUrl);
    } catch {
      Alert.alert('Bağlantı açılamadı', 'Etkinlik detay bağlantısı şu anda açılamıyor. Lütfen tekrar dene.');
    }
  };
  const openExperienceSource = async (experience: Experience) => {
    try {
      const source = experience.sources[0];
      if (!source || !(await Linking.canOpenURL(source.url))) throw new Error('unsupported URL');
      await Linking.openURL(source.url);
    } catch {
      Alert.alert('Bağlantı açılamadı', 'Bu planın resmî bilgi bağlantısı şu anda açılamıyor. Lütfen tekrar dene.');
    }
  };
  const openGuideSource = async (guide: Guide) => {
    try {
      if (!(await Linking.canOpenURL(guide.sourceUrl))) throw new Error('unsupported URL');
      await Linking.openURL(guide.sourceUrl);
    } catch {
      Alert.alert('Bağlantı açılamadı', 'Rehberin resmî kaynağı şu anda açılamıyor. Lütfen tekrar dene.');
    }
  };
  const scrollToGuide = (guideId: string) => {
    const anchor = guideAnchors.current[guideId];
    if (anchor === undefined) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, guidePaperY.current + anchor - 20), animated: true });
  };
  const openInsiderMap = async () => {
    try {
      const route = insiderRoutes[0];
      if (!route || !(await Linking.canOpenURL(route.mapUrl))) throw new Error('unsupported URL');
      await Linking.openURL(route.mapUrl);
    } catch {
      Alert.alert('Harita açılamadı', 'Rota bağlantısı şu anda açılamıyor. Lütfen tekrar dene.');
    }
  };


  if (!hydrated || (!fontsLoaded && !fontError)) return <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[s.safe, s.loading]}><StatusBar style="light" /><ActivityIndicator accessibilityLabel="Tercihler yükleniyor" color={c.lime} size="large" /><Text accessibilityLiveRegion="polite" style={s.loadingText}>Tercihlerin hazırlanıyor…</Text></SafeAreaView>;

  const stepNumber = step === 'welcome' ? '01' : step === 'mood' ? '02' : step === 'interest' ? '03' : step === 'budget' ? '04' : step === 'group' ? '05' : step === 'duration' ? '06' : '07';
  const isGuideArticle = step === 'guides' && guideView !== 'landing';
  return <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={s.safe}>
    <StatusBar style="light" /><View style={s.orb} />
    <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {isGuideArticle && <EditorialTopBar title={guideView === 'classics' ? 'ANKARA 101' : 'BİR ANKARALI GİBİ'} saved={guideView === 'classics' ? saved.includes(CLASSICS_COLLECTION_ID) : saved.includes(insiderRoutes[0].id)} onBack={() => setGuideView('landing')} onSave={() => setSaved(current => toggleId(current, guideView === 'classics' ? CLASSICS_COLLECTION_ID : insiderRoutes[0].id))} />}
    {isGuideArticle && <View accessibilityLabel={`Ankara 101 okuma ilerlemesi yüzde ${Math.round(guideScrollProgress)}`} style={s.readingProgressTrack}><View style={[s.readingProgressFill, { width: `${guideScrollProgress}%` }]} /></View>}
    <ScrollView ref={scrollRef} contentContainerStyle={[s.page, width >= 700 && !isGuideArticle && s.pageWide, step === 'guides' && guideView === 'landing' && s.guideLandingPage, isGuideArticle && s.guideArticlePage]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} scrollEventThrottle={32} onScroll={event => {
      if (!isGuideArticle) return;
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const maxScroll = Math.max(1, contentSize.height - layoutMeasurement.height);
      setGuideScrollProgress(Math.min(100, Math.max(0, (contentOffset.y / maxScroll) * 100)));
    }} onContentSizeChange={() => { if (scrollAfterRotation.current) { scrollAfterRotation.current = false; requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, recommendationsY.current - 10), animated: true })); } }}>
      {!isGuideArticle && <View style={s.header}><TouchableOpacity accessibilityRole="button" accessibilityLabel="N’apsak ana başlığı" hitSlop={12} onPress={() => ['saved', 'hidden', 'guides'].includes(step) ? setStep('results') : undefined}><Text style={s.logo}>N’apsak?</Text></TouchableOpacity>{step !== 'guides' && <View style={s.headerActions}><Text accessibilityLabel={`Adım ${stepNumber}, toplam 7`} style={s.counter}>{stepNumber} / 07</Text></View>}</View>}
      {step === 'welcome' && <View>
        <Text style={s.welcomeEmoji}>✦</Text>
        <Lead eyebrow="ANKARA’DA BUGÜN" title="Plan yapmak artık daha kolay." subtitle="Modunu ve ilgi alanlarını bir kez söyle; sana yakın, gününe uygun fikirleri birkaç saniyede bulalım." />
        <View style={s.promise}><Text style={s.promiseTitle}>Sana göre öneriler</Text><Text style={s.promiseText}>Tercihlerin cihazında saklanır; çevrimiçiyken anonim hesabınla güvenli biçimde eşitlenebilir. İstediğin zaman değiştirebilirsin.</Text></View>
        <Button label="Hadi başlayalım" onPress={() => setStep('mood')} />
      </View>}
      {step === 'mood' && <View>
        <Lead eyebrow="ŞU AN" title="Bugün neye açıksın?" subtitle="Modunu seç, Ankara’da sana iyi gelecek bir plan bulalım." />
        <View style={s.grid}>{moods.map(x => <TouchableOpacity accessibilityRole="radio" accessibilityLabel={`${x.label}: ${x.hint}`} accessibilityState={{ selected: mood === x.label }} key={x.label} activeOpacity={.8} style={[s.mood, mood === x.label && s.selected]} onPress={() => setMood(x.label)}><Text style={s.emoji}>{x.emoji}</Text><Text style={s.cardTitle}>{x.label}</Text><Text style={s.hint}>{x.hint}</Text></TouchableOpacity>)}</View>
        <Button label="Devam et" disabled={!mood} onPress={() => setStep('interest')} />
      </View>}
      {step === 'interest' && <View>
        <Lead eyebrow="BUGÜN" title="Neye açıksın?" subtitle="Bir veya birkaç ilgi alanı seç. Kararsızsan hepsini bize bırak." />
        <View style={s.chips}>{interests.map(x => <TouchableOpacity accessibilityRole="checkbox" accessibilityLabel={x.label} accessibilityState={{ checked: chosen.includes(x.label) }} key={x.label} style={[s.chip, chosen.includes(x.label) && s.selected]} onPress={() => toggle(x.label)}><Text style={s.chipText}>{x.emoji}  {x.label}</Text></TouchableOpacity>)}</View>
        <Button label="Bütçeyi seç" onPress={() => setStep('budget')} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mod seçimine geri dön" hitSlop={10} onPress={() => setStep('mood')}><Text style={s.back}>← Modumu değiştir</Text></TouchableOpacity>
      </View>}
      {step === 'budget' && <View>
        <Lead eyebrow="BÜTÇE" title="Bütçen ne olsun?" subtitle="Bu kesin eleme değil; iyi eşleşen fikirler sadece sıralamada dengelenir." />
        <View style={s.chips}>{budgets.map(x => <TouchableOpacity accessibilityRole="radio" accessibilityLabel={x} accessibilityState={{ selected: budget === x }} key={x} style={[s.chip, budget === x && s.selected]} onPress={() => setBudget(x)}><Text style={s.chipText}>{x}</Text></TouchableOpacity>)}</View>
        <Button label="Kişi sayısını seç" onPress={() => setStep('group')} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="İlgi seçimine geri dön" hitSlop={10} onPress={() => setStep('interest')}><Text style={s.back}>← İlgilerimi değiştir</Text></TouchableOpacity>
      </View>}
      {step === 'group' && <View>
        <Lead eyebrow="KİŞİ SAYISI" title="Kaç kişisiniz?" subtitle="Katalogda kesin kapasite yoksa bunu kategori, mod ve aktivite sinyalleriyle sıralamaya yansıtırız." />
        <View style={s.chips}>{groupSizes.map(x => <TouchableOpacity accessibilityRole="radio" accessibilityLabel={x} accessibilityState={{ selected: groupSize === x }} key={x} style={[s.chip, groupSize === x && s.selected]} onPress={() => setGroupSize(x)}><Text style={s.chipText}>{x}</Text></TouchableOpacity>)}</View>
        <Button label="Süreyi seç" disabled={!groupSize} onPress={() => setStep('duration')} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Bütçe seçimine geri dön" hitSlop={10} onPress={() => setStep('budget')}><Text style={s.back}>← Bütçemi değiştir</Text></TouchableOpacity>
      </View>}
      {step === 'duration' && <View>
        <Lead eyebrow="SÜRE" title="Kaç saatin var?" subtitle="N’apsak planlarında bu seçim gerçek bir uygunluk sınırıdır; sürene sığmayan uzun planları göstermeyiz." />
        <View style={s.chips}>{durations.map(x => <TouchableOpacity accessibilityRole="radio" accessibilityLabel={x} accessibilityState={{ selected: duration === x }} key={x} style={[s.chip, duration === x && s.selected]} onPress={() => setDuration(x)}><Text style={s.chipText}>{x}</Text></TouchableOpacity>)}</View>
        <Button label="Tercihlerimi kaydet ve 5 plan ver" onPress={() => setStep('results')} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Kişi sayısı seçimine geri dön" hitSlop={10} onPress={() => setStep('group')}><Text style={s.back}>← Kişi sayısını değiştir</Text></TouchableOpacity>
      </View>}
      {step === 'results' && <View>
        <Lead eyebrow="SANA GÖRE" title="Bugün bunlar olur." subtitle={`${mood} moduna, ilgi, bütçe, kişi sayısı ve süre seçimlerine göre sıraladık.`} />
        <View style={s.preferenceBar}><View style={s.preferenceCopy}><Text style={s.preferenceLabel}>TERCİHLERİN</Text><Text style={s.preferenceText}>{mood} · {chosen.length ? chosen.join(', ') : 'Her şeye açığım'} · {budget} · {groupSize ?? 'Kişi sayısı yok'} · {duration}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Tercihleri düzenle" hitSlop={10} onPress={() => setStep('mood')}><Text style={s.edit}>Düzenle</Text></TouchableOpacity></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {RESULT_FILTERS.map(filter => <TouchableOpacity key={filter.value} accessibilityRole="tab" accessibilityState={{ selected: resultFilter === filter.value }} onPress={() => selectResultFilter(filter.value)} style={[s.filterChip, resultFilter === filter.value && s.filterChipSelected]}><Text style={[s.filterText, resultFilter === filter.value && s.filterTextSelected]}>{filter.label}</Text></TouchableOpacity>)}
        </ScrollView>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={coordinates ? 'Konumu yeniden güncelle' : 'Konum izni iste ve yakındaki mekânları bul'} accessibilityState={{ disabled: locating, busy: locating }} disabled={locating} onPress={requestLocation} style={[s.locationCard, locating && s.controlDisabled]}>
          {locating ? <ActivityIndicator color={c.lime} /> : <Text style={s.locationIcon}>{coordinates ? '✓' : '⌖'}</Text>}
          <View style={s.locationCopy}><Text style={s.locationTitle}>{coordinates ? 'Konum kullanılıyor' : 'Yakınımdakileri bul'}</Text><Text style={s.locationText}>{locationMessage}</Text></View>
        </TouchableOpacity>
        {lastDismissed && <View style={s.undoBar}><Text style={s.undoText}>Öneri gizlendi.</Text><TouchableOpacity accessibilityRole="button" onPress={() => { restorePlace(lastDismissed); setLastDismissed(undefined); }}><Text style={s.edit}>Geri al</Text></TouchableOpacity></View>}
        <View onLayout={event => { recommendationsY.current = event.nativeEvent.layout.y; }} />
        {results.map((item, i) => <RecommendationCard key={item.id} item={item} rank={i + 1} saved={saved.includes(item.id)} onSave={() => setSaved(current => toggleId(current, item.id))} onDismiss={() => dismissPlace(item.id)} onOpenPlaceMaps={openInMaps} onOpenPlaceSource={openSource} onOpenIdea={openIdea} onOpenEvent={openEvent} onOpenExperienceSource={openExperienceSource} />)}
        {!results.length && <View style={s.empty}><Text style={s.emptyIcon}>{resultFilter === 'event' ? '◷' : '↻'}</Text><Text style={s.emptyTitle}>{resultFilter === 'event' ? 'Yaklaşan etkinlik bulunamadı' : 'Yeni bir öneri kalmadı'}</Text><Text style={s.emptyText}>{resultFilter === 'event' ? 'Doğrulanmış katalogda henüz yaklaşan bir Ankara etkinliği yok. Yeni tarihler doğrulandıkça burada görünecek.' : '“Bana göre değil” dediklerini geri getirip yeniden başlayabilirsin.'}</Text>{resultFilter !== 'event' && <TouchableOpacity style={s.emptyAction} onPress={() => setDismissed([])}><Text style={s.emptyActionText}>Tüm önerileri geri getir</Text></TouchableOpacity>}</View>}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Farklı öneriler göster" style={s.secondaryButton} onPress={rotateRecommendations}><Text style={s.secondaryButtonText}>Bana farklı şeyler göster ↻</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Gizlediğim önerileri göster" style={s.secondaryButton} onPress={() => setStep('hidden')}><Text style={s.secondaryButtonText}>Gizlediğim öneriler ({hiddenItems.length})</Text></TouchableOpacity>
        <Button label="Baştan farklı bir plan yap" onPress={reset} />
      </View>}
      {step === 'guides' && guideView === 'landing' && <Ankara101Landing onOpenClassics={() => setGuideView('classics')} onOpenInsider={() => setGuideView('insider')} />}
      {step === 'guides' && guideView === 'classics' && <ClassicsGuide guides={guides} totalMinutes={totalGuideMinutes} saved={saved} onSaveGuide={guide => setSaved(current => toggleId(current, guide.id))} onOpenSource={openGuideSource} onPaperLayout={y => { guidePaperY.current = y; }} onChapterLayout={(id, y) => { guideAnchors.current[id] = y; }} onOpenContents={scrollToGuide} />}
      {step === 'guides' && guideView === 'insider' && <InsiderGuide saved={saved.includes(insiderRoutes[0].id)} onBack={() => setGuideView('landing')} onSave={() => setSaved(current => toggleId(current, insiderRoutes[0].id))} onOpenMap={openInsiderMap} />}
      {step === 'hidden' && <View>
        <Lead eyebrow="GİZLEDİKLERİN" title="Gizlediğim öneriler" subtitle="Bana göre değil dediğin planları ve diğer önerileri tek tek veya topluca geri getirebilirsin." />
        {!hiddenItems.length && <View style={s.empty}><Text style={s.emptyIcon}>✓</Text><Text style={s.emptyTitle}>Gizli önerin yok</Text><Text style={s.emptyText}>Bir öneriyi gizlediğinde burada görünür.</Text><TouchableOpacity style={s.emptyAction} onPress={() => setStep('results')}><Text style={s.emptyActionText}>Önerilere dön</Text></TouchableOpacity></View>}
        {hiddenItems.map(item => <View key={item.id} style={s.result}><Text style={s.resultName}>{itemTitle(item)}</Text><Text style={s.meta}>{itemMeta(item)}</Text>{'address' in item && <Text style={s.address}>{item.address}</Text>}<Text style={s.note}>{item.note}</Text><View style={s.actions}><Action label={`${itemTitle(item)} önerisini geri getir`} onPress={() => restorePlace(item.id)} text="Geri getir" /></View></View>)}
        {!!hiddenItems.length && <TouchableOpacity style={s.secondaryButton} onPress={() => setDismissed([])}><Text style={s.secondaryButtonText}>Tüm gizlenenleri geri getir</Text></TouchableOpacity>}
        <Button label="Önerilere dön" onPress={() => setStep('results')} />
      </View>}
      {step === 'saved' && <View>
        <Lead eyebrow="LİSTEN" title="Kaydedilenler" subtitle="Sonra bakmak için ayırdığın planlar ve diğer öneriler burada." />
        {!savedItems.length && !savedGuides.length && !savedInsiderRoutes.length && !saved.includes(CLASSICS_COLLECTION_ID) && <View style={s.empty}><Text style={s.emptyIcon}>♡</Text><Text style={s.emptyTitle}>Henüz bir şey kaydetmedin</Text><Text style={s.emptyText}>Önerilerde veya Ankara 101’de “Kaydet”e dokunduğunda burada görünür.</Text><TouchableOpacity style={s.emptyAction} onPress={() => setStep('results')}><Text style={s.emptyActionText}>Ana sayfaya dön</Text></TouchableOpacity></View>}
        {savedItems.map(item => <View key={item.id} style={s.result}><Text style={s.resultName}>{itemTitle(item)}</Text><Text style={s.meta}>{itemMeta(item)}</Text>{'address' in item && <Text style={s.address}>{item.address}</Text>}<Text style={s.note}>{item.note}</Text><View style={s.actions}>{'name' in item ? <Action label={`${item.name} mekânını haritada aç`} onPress={() => openInMaps(item)} text="Haritada aç" /> : item.kind === 'idea' ? <Action label={`${item.title} fikrini aç`} onPress={() => openIdea(item)} text={item.actionLabel} /> : item.kind === 'event' ? <Action label={`${item.title} etkinlik detayını aç`} onPress={() => openEvent(item)} text="Bilet / Detay" /> : <Action label={`${item.title} planının resmî bilgisini aç`} onPress={() => openExperienceSource(item)} text="Resmî bilgi" />}<Action label="Öneriyi kayıttan çıkar" remove onPress={() => setSaved(current => current.filter(id => id !== item.id))} text="Kayıttan çıkar" /></View></View>)}
        {savedGuides.map(guide => <GuideCard key={guide.id} guide={guide} saved onSave={() => setSaved(current => current.filter(id => id !== guide.id))} onOpen={() => openGuideSource(guide)} />)}
        {saved.includes(CLASSICS_COLLECTION_ID) && <SavedEditorialCard eyebrow="ANKARA KLASİKLERİ" title="Şehrin tarihini okumaya nereden başlamalı?" onOpen={() => { setGuideView('classics'); setStep('guides'); }} onRemove={() => setSaved(current => current.filter(id => id !== CLASSICS_COLLECTION_ID))} />}
        {savedInsiderRoutes.map(route => <SavedEditorialCard key={route.id} eyebrow="BİR ANKARALI GİBİ" title={route.title} onOpen={() => { setGuideView('insider'); setStep('guides'); }} onRemove={() => setSaved(current => current.filter(id => id !== route.id))} />)}
      </View>}
    </ScrollView>
    {['results', 'saved', 'hidden', 'guides'].includes(step) && !isGuideArticle && <View accessibilityRole="tablist" style={s.bottomNav}>
      <NavTab label="Ana Sayfa" selected={step === 'results' || step === 'hidden'} editorial={step === 'guides'} onPress={() => setStep('results')} />
      <NavTab label={`Kaydedilenler (${saved.length})`} selected={step === 'saved'} editorial={step === 'guides'} onPress={() => setStep('saved')} />
      <NavTab label="Ankara 101" selected={step === 'guides'} editorial={step === 'guides'} onPress={() => { setGuideView('landing'); setStep('guides'); }} />
    </View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function Lead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) { return <><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.title}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text></>; }
function itemTitle(item: Place | Idea | Event | Experience): string { return 'name' in item ? item.name : item.title; }
function itemMeta(item: Place | Idea | Event | Experience): string {
  if ('name' in item) return `${item.category} · ${item.district}`;
  if (item.kind === 'experience') return `N’apsak · ${item.district} · ${formatDurationRange(item.minDurationMinutes, item.maxDurationMinutes)}`;
  if (item.kind === 'event') return `Etkinlik · ${item.venue}`;
  return `Fikir · ${item.category}`;
}
function Button({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) { return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} activeOpacity={.85} disabled={disabled} onPress={onPress} style={[s.button, disabled && s.disabled]}><Text style={[s.buttonText, disabled && s.disabledText]}>{label}</Text><Text style={[s.arrow, disabled && s.disabledText]}>→</Text></TouchableOpacity>; }
function Action({ label, onPress, text, muted, remove }: { label: string; onPress: () => void; text: string; muted?: boolean; remove?: boolean }) { return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} hitSlop={6} onPress={onPress} style={s.actionHit}><Text style={remove ? s.removeAction : muted ? s.mutedAction : s.action}>{text}</Text></TouchableOpacity>; }
function NavTab({ label, selected, editorial, onPress }: { label: string; selected: boolean; editorial?: boolean; onPress: () => void }) { return <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected }} onPress={onPress} style={s.navTab}><Text numberOfLines={1} style={[s.navText, editorial && s.navTextEditorial, selected && s.navTextSelected, editorial && selected && s.navTextEditorialSelected]}>{label}</Text></TouchableOpacity>; }

function EditorialTopBar({ title, saved, onBack, onSave }: { title: string; saved: boolean; onBack: () => void; onSave: () => void }) {
  return <View style={s.editorialTopBar}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ankara 101 seçimine dön" hitSlop={12} onPress={onBack} style={s.editorialTopAction}><Text style={s.editorialBack}>‹</Text></TouchableOpacity>
    <Text numberOfLines={1} style={s.editorialTopTitle}>{title}</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={saved ? 'Rehberi kayıttan çıkar' : 'Rehberi kaydet'} accessibilityState={{ selected: saved }} hitSlop={12} onPress={onSave} style={s.editorialTopAction}><Text style={[s.editorialBookmark, saved && s.editorialBookmarkSaved]}>{saved ? '♥' : '♡'}</Text></TouchableOpacity>
  </View>;
}

function Ankara101Landing({ onOpenClassics, onOpenInsider }: { onOpenClassics: () => void; onOpenInsider: () => void }) {
  return <View style={s.editorialLanding}>
    <Text style={s.editorialEyebrow}>ANKARA 101</Text>
    <View style={s.editorialAccent} />
    <Text style={s.editorialLandingTitle}>Şehri iki farklı şekilde keşfet.</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ankara Klasikleri rehberini aç" activeOpacity={.9} onPress={onOpenClassics} style={s.editorialChoice}>
      <View style={s.editorialChoiceCopy}><Text style={s.editorialChoiceTitle}>Ankara{`\n`}Klasikleri</Text><View style={s.choiceRule} /><Text style={s.editorialChoiceText}>Tarih, kültür ve şehrin simge durakları</Text></View>
      <Image source={ANKARA_CASTLE_HERO} resizeMode="cover" style={s.editorialChoiceImage} />
    </TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Bir Ankaralı Gibi rotalarını aç" activeOpacity={.9} onPress={onOpenInsider} style={s.editorialChoice}>
      <Image source={KUGULU_TUNALI_HERO} resizeMode="cover" style={s.editorialChoiceImage} />
      <View style={s.editorialChoiceCopy}><Text style={s.editorialChoiceTitle}>Bir Ankaralı{`\n`}Gibi</Text><View style={s.choiceRule} /><Text style={s.editorialChoiceText}>Yerel rotalar, küçük duraklar ve gerçek Ankara</Text></View>
    </TouchableOpacity>
  </View>;
}

function ClassicsGuide({ guides, totalMinutes, saved, onSaveGuide, onOpenSource, onPaperLayout, onChapterLayout, onOpenContents }: { guides: Guide[]; totalMinutes: number; saved: string[]; onSaveGuide: (guide: Guide) => void; onOpenSource: (guide: Guide) => void; onPaperLayout: (y: number) => void; onChapterLayout: (id: string, y: number) => void; onOpenContents: (id: string) => void }) {
  const [contentsOpen, setContentsOpen] = useState(false);
  return <View>
    <ImageBackground source={ANKARA_CASTLE_HERO} resizeMode="cover" style={s.classicsHero}>
      <LinearGradient colors={['transparent', 'rgba(10,10,8,.12)', 'rgba(10,10,8,.92)']} locations={[0, .45, 1]} style={s.heroGradient}>
        <Text style={s.classicsHeroTitle}>ANKARA KLASİKLERİ</Text>
        <Text style={s.classicsHeroDeck}>Şehrin tarihini okumaya nereden başlamalı?</Text>
      </LinearGradient>
    </ImageBackground>
    <View onLayout={event => onPaperLayout(event.nativeEvent.layout.y)} style={s.classicsPaper}>
      <View style={s.classicsMetaRow}><Text style={s.classicsMeta}>{guides.length} BÖLÜM</Text><Text style={s.classicsMeta}>YAKLAŞIK {totalMinutes} DK</Text><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: contentsOpen }} onPress={() => setContentsOpen(open => !open)}><Text style={s.classicsContentsButton}>{contentsOpen ? 'KAPAT' : 'İÇİNDEKİLER'}</Text></TouchableOpacity></View>
      {contentsOpen && <View style={s.classicsContents}>{guides.map((guide, index) => <TouchableOpacity key={guide.id} accessibilityRole="link" onPress={() => { setContentsOpen(false); requestAnimationFrame(() => requestAnimationFrame(() => onOpenContents(guide.id))); }} style={s.classicsContentsRow}><Text style={s.classicsContentsNumber}>{String(index + 1).padStart(2, '0')}</Text><Text style={s.classicsContentsTitle}>{index === 0 ? 'Kale’den Ulus’a: Şehrin ilk katmanı' : guide.title}</Text><Text style={s.classicsContentsArrow}>↓</Text></TouchableOpacity>)}</View>}
      {guides.map((guide, index) => <ClassicChapter key={guide.id} guide={guide} index={index} saved={saved.includes(guide.id)} onLayout={y => onChapterLayout(guide.id, y)} onSave={() => onSaveGuide(guide)} onOpenSource={() => onOpenSource(guide)} />)}
      <View style={s.classicsEnd}><Text style={s.classicsEndMark}>✦</Text><Text style={s.classicsEndTitle}>Ankara, bakmasını bilene konuşur.</Text><Text style={s.classicsEndText}>Ziyaret saatleri ve koşullar değişebilir. Yola çıkmadan bölüm sonundaki resmî kaynağı kontrol et.</Text></View>
    </View>
  </View>;
}

function ClassicChapter({ guide, index, saved, onSave, onOpenSource, onLayout }: { guide: Guide; index: number; saved: boolean; onSave: () => void; onOpenSource: () => void; onLayout: (y: number) => void }) {
  const displayTitle = index === 0 ? 'Kale’den Ulus’a: Şehrin ilk katmanı' : guide.title;
  return <View onLayout={event => onLayout(event.nativeEvent.layout.y)} style={s.classicChapter}>
    <Text style={s.classicChapterEyebrow}>{String(index + 1).padStart(2, '0')} · {guide.category.toLocaleUpperCase('tr-TR')}</Text>
    <Text style={s.classicChapterTitle}>{displayTitle}</Text>
    <View style={s.classicOrnament}><View style={s.classicOrnamentLine} /><Text style={s.classicOrnamentMark}>✦</Text><View style={s.classicOrnamentLine} /></View>
    <Text style={s.classicStandfirst}>{guide.summary}</Text>
    {guide.paragraphs.map((paragraph, paragraphIndex) => <Text key={paragraphIndex} style={s.classicParagraph}>{paragraph}</Text>)}
    {!!guide.routeStops?.length && <View style={s.classicRouteStrip}><Text style={s.classicRouteLabel}>BU BÖLÜMDE</Text><Text style={s.classicRouteText}>{guide.routeStops.join('  ·  ')}</Text></View>}
    {guide.practicalNote && <View style={s.classicTip}><Text style={s.classicTipLabel}>KISA NOT</Text><Text style={s.classicTipText}>{guide.practicalNote}</Text></View>}
    <View style={s.classicActions}><TouchableOpacity accessibilityRole="button" onPress={onSave} style={s.classicActionHit}><Text style={s.classicAction}>{saved ? '♥ Kaydedildi' : '♡ Bölümü kaydet'}</Text></TouchableOpacity><TouchableOpacity accessibilityRole="link" onPress={onOpenSource} style={s.classicActionHit}><Text style={s.classicSource}>Kaynaklar ↗</Text></TouchableOpacity></View>
  </View>;
}

function InsiderGuide({ saved, onBack, onSave, onOpenMap }: { saved: boolean; onBack: () => void; onSave: () => void; onOpenMap: () => void }) {
  const route = insiderRoutes[0];
  return <View>
    <Image source={KUGULU_TUNALI_HERO} resizeMode="cover" style={s.insiderHero} />
    <View style={s.insiderPaper}>
      <Text style={s.insiderMeta}>{route.eyebrow} · {route.durationLabel.toLocaleUpperCase('tr-TR')} · {route.budgetLabel.toLocaleUpperCase('tr-TR')}</Text>
      <Text style={s.insiderTitle}>{route.title}</Text>
      <View style={s.insiderIntroRow}><Text style={s.insiderSprig}>❧</Text><Text style={s.insiderIntro}>{route.intro}</Text></View>
      <View style={s.insiderFeatureRow}>
        <View style={s.insiderTimeline}>{route.stops.map((stop, index) => <View key={stop.name} style={s.insiderStop}><View style={s.insiderStopRail}><View style={s.insiderStopDot}><Text style={s.insiderStopNumber}>{String(index + 1).padStart(2, '0')}</Text></View>{index < route.stops.length - 1 && <View style={s.insiderStopLine} />}</View><View style={s.insiderStopCopy}><Text style={s.insiderStopName}>{stop.name}</Text><Text style={s.insiderStopNote}>— {stop.note}</Text><Text style={s.insiderStopDetail}>{stop.detail}</Text></View></View>)}</View>
        <View style={s.insiderAside}><Image source={TUNALI_CAFE_DETAIL} resizeMode="cover" style={s.insiderDetailImage} /><View style={s.friendNote}><View style={s.friendTape} /><Text style={s.friendNoteTitle}>ARKADAŞ NOTU</Text><Text style={s.friendNoteText}>{route.friendNote}</Text><Text style={s.friendHeart}>♡</Text></View></View>
      </View>
      <View style={s.miniMap}><Text style={s.miniMapLabel}>ROTANIN AKIŞI</Text><View style={s.miniMapPath}>{route.stops.map((stop, index) => <View key={stop.name} style={s.miniMapStop}><View style={s.miniMapDot}><Text style={s.miniMapDotText}>{index + 1}</Text></View><Text style={s.miniMapStopText}>{stop.name}</Text>{index < route.stops.length - 1 && <Text style={s.miniMapArrow}>→</Text>}</View>)}</View></View>
      <View style={s.insiderActions}><TouchableOpacity accessibilityRole="link" onPress={onOpenMap} style={s.insiderMapButton}><Text style={s.insiderMapButtonText}>⌖  Rotayı haritada aç</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: saved }} onPress={onSave} style={s.insiderSaveButton}><Text style={s.insiderSaveButtonText}>{saved ? '♥  Kaydedildi' : '♡  Kaydet'}</Text></TouchableOpacity></View>
      <TouchableOpacity accessibilityRole="button" onPress={onBack} style={s.insiderBack}><Text style={s.insiderBackText}>← Ankara 101 seçimine dön</Text></TouchableOpacity>
    </View>
  </View>;
}

function SavedEditorialCard({ eyebrow, title, onOpen, onRemove }: { eyebrow: string; title: string; onOpen: () => void; onRemove: () => void }) {
  return <View style={s.result}><View style={s.kindBadge}><Text style={s.kindBadgeText}>{eyebrow}</Text></View><Text style={s.resultName}>{title}</Text><View style={s.actions}><Action label={`${title} içeriğini aç`} onPress={onOpen} text="Aç" /><Action label={`${title} içeriğini kayıttan çıkar`} remove onPress={onRemove} text="Kayıttan çıkar" /></View></View>;
}

function GuideCard({ guide, saved, onSave, onOpen }: { guide: Guide; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return <View style={s.result}>
    <View style={s.kindBadge}><Text style={s.kindBadgeText}>ANKARA 101</Text></View>
    <Text style={s.resultName}>{guide.title}</Text>
    <Text style={s.meta}>{guide.category} · {guide.district}</Text>
    <Text style={s.note}>{guide.summary}</Text>
    <Text style={s.sourceNote}>Kaynak: {guide.sourceLabel}</Text>
    <View style={s.actions}><Action label={saved ? `${guide.title} rehberini kayıttan çıkar` : `${guide.title} rehberini kaydet`} onPress={onSave} text={saved ? '♥ Kaydedildi' : '♡ Kaydet'} /><Action label={`${guide.title} resmî kaynağını aç`} onPress={onOpen} text="Kaynağı aç" /></View>
  </View>;
}

function RecommendationCard({ item, rank, saved, onSave, onDismiss, onOpenPlaceMaps, onOpenPlaceSource, onOpenIdea, onOpenEvent, onOpenExperienceSource }: { item: RecommendationItem; rank: number; saved: boolean; onSave: () => void; onDismiss: () => void; onOpenPlaceMaps: (place: Place) => void; onOpenPlaceSource: (place: Place) => void; onOpenIdea: (idea: Idea) => void; onOpenEvent: (event: Event) => void; onOpenExperienceSource: (experience: Experience) => void }) {
  const title = item.kind === 'place' ? item.name : item.title;
  return <View style={s.result}>
    <Text style={s.rank}>{rank}</Text><View style={s.kindBadge}><Text style={s.kindBadgeText}>{item.kind === 'experience' ? 'N’APSAK' : item.kind === 'place' ? 'MEKÂN' : item.kind === 'event' ? 'ETKİNLİK' : 'FİKİR'}</Text></View>
    <Text style={s.resultName}>{title}</Text>
    {item.kind === 'experience' ? <><Text style={s.meta}>{formatDurationRange(item.minDurationMinutes, item.maxDurationMinutes)} · {'₺'.repeat(item.priceLevel) || 'Ücretsiz'} · {item.distance === undefined ? item.district : `${item.distance.toFixed(1)} km · ${item.district}`}</Text><Text style={s.address}>{item.points.map(point => point.name).join(' → ')}</Text></> : item.kind === 'place' ? <><Text style={s.meta}>N’apsak {item.editorialScore}  ·  {item.distance === undefined ? 'Konum bekleniyor' : `${item.distance.toFixed(1)} km`}  ·  {item.district}</Text><Text style={s.address}>{item.address}</Text></> : item.kind === 'event' ? <Text style={s.meta}>{item.venue} · {item.city} · {new Date(item.startsAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'long', timeStyle: 'short' })}{item.priceNote ? ` · ${item.priceNote}` : ''}</Text> : <Text style={s.meta}>Zamansız fikir · {item.category} · {'₺'.repeat(item.priceLevel) || 'Ücretsiz'}</Text>}
    {item.kind === 'experience' && <Text style={s.note}>{item.description}</Text>}<Text style={s.note}>{item.note}</Text><Text style={s.why}>Neden? {item.reasons.join(' · ')}</Text>
    <View style={s.actions}><Action label={saved ? 'Kaydedildi, kayıttan çıkar' : 'Öneriyi kaydet'} onPress={onSave} text={saved ? '♥ Kaydedildi' : '♡ Kaydet'} />{item.kind === 'experience' ? <Action label={`${item.title} planının resmî bilgisini aç`} onPress={() => onOpenExperienceSource(item)} text="Resmî bilgi" /> : item.kind === 'place' ? <><Action label={`${item.name} mekânını haritada aç`} onPress={() => onOpenPlaceMaps(item)} text="Haritada aç" /><Action label={`${item.name} resmî bilgisini aç`} onPress={() => onOpenPlaceSource(item)} text="Resmî bilgi" /></> : item.kind === 'idea' ? <Action label={`${item.title} fikrini aç`} onPress={() => onOpenIdea(item)} text={item.actionLabel} /> : <Action label={`${item.title} etkinlik detayını aç`} onPress={() => onOpenEvent(item)} text="Bilet / Detay" />}<Action label={`${title} önerisini gizle`} muted onPress={onDismiss} text="Bana göre değil" /></View>
  </View>;
}

const c = { ink: '#F8F4EA', muted: '#AAA79F', bg: '#11120F', card: '#1B1D18', lime: '#D5FF4B', line: '#32352C' };
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg }, page: { flexGrow: 1, width: '100%', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32 }, pageWide: { maxWidth: 720, alignSelf: 'center', paddingHorizontal: 32 },
  readingProgressTrack: { height: 3, backgroundColor: '#352F29', overflow: 'hidden' }, readingProgressFill: { height: 3, backgroundColor: '#8F2938' },
  guideLandingPage: { paddingHorizontal: 18, paddingBottom: 24 }, guideArticlePage: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 },
  editorialTopBar: { minHeight: 61, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0E100E' }, editorialTopAction: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, editorialBack: { color: '#F2E7CF', fontFamily: 'CormorantGaramond_400Regular', fontSize: 46, lineHeight: 48 }, editorialTopTitle: { flex: 1, color: '#F2E7CF', fontFamily: 'SourceSans3_600SemiBold', fontSize: 14, letterSpacing: 2.5, textAlign: 'center' }, editorialBookmark: { color: '#F2E7CF', fontFamily: 'SourceSans3_400Regular', fontSize: 27 }, editorialBookmarkSaved: { color: '#A73343' },
  editorialLanding: { paddingBottom: 8 }, editorialEyebrow: { color: '#BD6B63', fontFamily: 'SourceSans3_800ExtraBold', fontSize: 12, letterSpacing: 4 }, editorialAccent: { width: 45, height: 3, backgroundColor: '#A73343', marginTop: 13, marginBottom: 18 }, editorialLandingTitle: { color: '#F2E7CF', fontFamily: 'CormorantGaramond_400Regular', fontSize: 39, lineHeight: 43, marginBottom: 24 },
  editorialChoice: { minHeight: 238, flexDirection: 'row', backgroundColor: '#F2E7CF', borderRadius: 13, overflow: 'hidden', marginBottom: 14 }, editorialChoiceCopy: { width: '42%', paddingHorizontal: 17, paddingVertical: 22, justifyContent: 'center' }, editorialChoiceImage: { flex: 1, minHeight: 238 }, editorialChoiceTitle: { color: '#2F2022', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 31, lineHeight: 31 }, choiceRule: { width: 39, height: 3, backgroundColor: '#A73343', marginTop: 18, marginBottom: 14 }, editorialChoiceText: { color: '#493B35', fontFamily: 'SourceSans3_400Regular', fontSize: 13, lineHeight: 18 },
  classicsHero: { height: 430, backgroundColor: '#302820' }, heroGradient: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 22, paddingBottom: 28 }, classicsHeroTitle: { color: '#F7ECD7', fontFamily: 'CormorantGaramond_400Regular', fontSize: 42, lineHeight: 45, letterSpacing: .2 }, classicsHeroDeck: { color: '#F7ECD7', fontFamily: 'SourceSans3_400Regular', fontSize: 18, lineHeight: 24, marginTop: 6 },
  classicsPaper: { backgroundColor: '#F2E7CF' }, classicsMetaRow: { minHeight: 55, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#CDBE9F', paddingHorizontal: 22 }, classicsMeta: { color: '#80675D', fontFamily: 'SourceSans3_700Bold', fontSize: 9, letterSpacing: 1.25 }, classicsContentsButton: { color: '#7A2635', fontFamily: 'SourceSans3_800ExtraBold', fontSize: 10, letterSpacing: 1.1 }, classicsContents: { paddingHorizontal: 22, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#CDBE9F' }, classicsContentsRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#DDCFB4' }, classicsContentsNumber: { width: 31, color: '#8F2938', fontFamily: 'SourceSans3_700Bold', fontSize: 10 }, classicsContentsTitle: { flex: 1, color: '#3B2C28', fontFamily: 'SourceSans3_600SemiBold', fontSize: 13, lineHeight: 17 }, classicsContentsArrow: { color: '#8F2938', fontSize: 15 },
  classicChapter: { paddingHorizontal: 22, paddingTop: 42, paddingBottom: 34, borderBottomWidth: 1, borderBottomColor: '#CDBE9F' }, classicChapterEyebrow: { color: '#7A2635', fontFamily: 'SourceSans3_800ExtraBold', fontSize: 11, letterSpacing: 2.2 }, classicChapterTitle: { color: '#2F2022', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 38, lineHeight: 40, marginTop: 14 }, classicOrnament: { flexDirection: 'row', alignItems: 'center', gap: 9, width: 130, marginTop: 18, marginBottom: 20 }, classicOrnamentLine: { flex: 1, height: 1, backgroundColor: '#8F2938' }, classicOrnamentMark: { color: '#8F2938', fontSize: 11 }, classicStandfirst: { color: '#3D302C', fontFamily: 'SourceSans3_600SemiBold', fontSize: 18, lineHeight: 26, marginBottom: 18 }, classicParagraph: { color: '#493B35', fontFamily: 'SourceSans3_400Regular', fontSize: 16, lineHeight: 26, marginBottom: 15 }, classicRouteStrip: { borderWidth: 1, borderColor: '#BCA887', borderRadius: 12, padding: 15, marginTop: 8, marginBottom: 15 }, classicRouteLabel: { color: '#7A2635', fontFamily: 'SourceSans3_800ExtraBold', fontSize: 10, letterSpacing: 1.4, marginBottom: 8 }, classicRouteText: { color: '#493B35', fontFamily: 'SourceSans3_600SemiBold', fontSize: 13, lineHeight: 20 }, classicTip: { backgroundColor: '#E7D8BA', borderLeftWidth: 3, borderLeftColor: '#7A2635', padding: 14, marginBottom: 14 }, classicTipLabel: { color: '#7A2635', fontFamily: 'SourceSans3_800ExtraBold', fontSize: 9, letterSpacing: 1.5, marginBottom: 5 }, classicTipText: { color: '#59443C', fontFamily: 'SourceSans3_400Regular', fontSize: 13, lineHeight: 19 }, classicActions: { minHeight: 51, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }, classicActionHit: { minHeight: 44, justifyContent: 'center' }, classicAction: { color: '#7A2635', fontFamily: 'SourceSans3_700Bold', fontSize: 12 }, classicSource: { color: '#5E4D46', fontFamily: 'SourceSans3_600SemiBold', fontSize: 12 }, classicsEnd: { alignItems: 'center', backgroundColor: '#302124', paddingHorizontal: 27, paddingVertical: 47 }, classicsEndMark: { color: '#D4B968', fontSize: 24 }, classicsEndTitle: { color: '#F2E7CF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 27, lineHeight: 31, textAlign: 'center', marginTop: 13 }, classicsEndText: { color: '#CCBEA7', fontFamily: 'SourceSans3_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10 },
  insiderHero: { width: '100%', height: 330, backgroundColor: '#302820' }, insiderPaper: { backgroundColor: '#F2E7CF', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 32 }, insiderMeta: { color: '#7A2635', fontFamily: 'SourceSans3_800ExtraBold', fontSize: 11, letterSpacing: 1.4 }, insiderTitle: { color: '#251C1A', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 42, lineHeight: 42, marginTop: 12 }, insiderIntroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 15, marginBottom: 23 }, insiderSprig: { color: '#6F7650', fontFamily: 'CormorantGaramond_400Regular', fontSize: 28 }, insiderIntro: { flex: 1, color: '#3E332F', fontFamily: 'SourceSans3_400Regular', fontSize: 15, lineHeight: 21 }, insiderFeatureRow: { flexDirection: 'row', gap: 12 }, insiderTimeline: { flex: 1 }, insiderStop: { flexDirection: 'row', minHeight: 126 }, insiderStopRail: { width: 42, alignItems: 'center' }, insiderStopDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#8F2938', alignItems: 'center', justifyContent: 'center' }, insiderStopNumber: { color: '#FFF5E5', fontFamily: 'SourceSans3_700Bold', fontSize: 13 }, insiderStopLine: { width: 1, flex: 1, borderLeftWidth: 1, borderLeftColor: '#8F2938', borderStyle: 'dashed' }, insiderStopCopy: { flex: 1, paddingLeft: 8, paddingBottom: 15 }, insiderStopName: { color: '#2F2824', fontFamily: 'SourceSans3_700Bold', fontSize: 15, lineHeight: 19 }, insiderStopNote: { color: '#8F2938', fontFamily: 'SourceSans3_600SemiBold', fontSize: 12, marginTop: 3 }, insiderStopDetail: { color: '#65534B', fontFamily: 'SourceSans3_400Regular', fontSize: 11, lineHeight: 16, marginTop: 7 }, insiderAside: { width: '35%' }, insiderDetailImage: { width: '100%', aspectRatio: .8, borderRadius: 13 }, friendNote: { position: 'relative', borderWidth: 1, borderColor: '#8F2938', borderRadius: 8, padding: 11, marginTop: 18, backgroundColor: '#F4EAD5' }, friendTape: { position: 'absolute', top: -7, alignSelf: 'center', width: 42, height: 12, backgroundColor: '#8D8A65', opacity: .75 }, friendNoteTitle: { color: '#7A2635', fontFamily: 'SourceSans3_800ExtraBold', fontSize: 9, letterSpacing: 1.2, borderBottomWidth: 1, borderBottomColor: '#8F2938', paddingBottom: 6 }, friendNoteText: { color: '#493B35', fontFamily: 'SourceSans3_400Regular', fontSize: 11, lineHeight: 16, marginTop: 8 }, friendHeart: { color: '#8F2938', fontSize: 20, textAlign: 'right', marginTop: 5 },
  miniMap: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#BCA887', paddingVertical: 16, marginTop: 20 }, miniMapLabel: { color: '#7A2635', fontFamily: 'SourceSans3_800ExtraBold', fontSize: 9, letterSpacing: 1.5, marginBottom: 11 }, miniMapPath: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5 }, miniMapStop: { flexDirection: 'row', alignItems: 'center', gap: 5 }, miniMapDot: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#8F2938', alignItems: 'center', justifyContent: 'center' }, miniMapDotText: { color: '#FFF5E5', fontFamily: 'SourceSans3_700Bold', fontSize: 9 }, miniMapStopText: { color: '#51413B', fontFamily: 'SourceSans3_600SemiBold', fontSize: 10 }, miniMapArrow: { color: '#6F7650', fontSize: 12 }, insiderActions: { flexDirection: 'row', gap: 10, marginTop: 22 }, insiderMapButton: { flex: 1.15, minHeight: 56, borderRadius: 10, backgroundColor: '#6F704B', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, insiderMapButtonText: { color: '#FFF8E8', fontFamily: 'SourceSans3_700Bold', fontSize: 13, textAlign: 'center' }, insiderSaveButton: { flex: 1, minHeight: 56, borderRadius: 10, borderWidth: 1, borderColor: '#8F2938', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, insiderSaveButtonText: { color: '#7A2635', fontFamily: 'SourceSans3_700Bold', fontSize: 13, textAlign: 'center' }, insiderBack: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 13 }, insiderBackText: { color: '#7A2635', fontFamily: 'SourceSans3_600SemiBold', fontSize: 12 },
  loading: { alignItems: 'center', justifyContent: 'center', gap: 14 }, loadingText: { color: c.muted, fontSize: 14 },
  orb: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#4A5E13', opacity: .22, top: -120, right: -90 },
  header: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }, headerActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 }, logo: { color: c.ink, fontFamily: 'SourceSans3_800ExtraBold', fontSize: 29, letterSpacing: -1.2 }, savedLink: { color: c.lime, fontSize: 12, fontWeight: '800', paddingVertical: 10 }, counter: { color: '#C4C1B8', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  eyebrow: { color: c.lime, fontSize: 12, fontWeight: '800', letterSpacing: 2.2, marginBottom: 12 }, title: { color: c.ink, fontSize: 39, lineHeight: 43, fontWeight: '900', letterSpacing: -1.8 }, subtitle: { color: c.muted, fontSize: 16, lineHeight: 24, marginTop: 14, marginBottom: 30 },
  welcomeEmoji: { color: c.lime, fontSize: 48, marginBottom: 30 }, promise: { backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 18, padding: 18 }, promiseTitle: { color: c.ink, fontSize: 16, fontWeight: '900' }, promiseText: { color: c.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, mood: { width: '48%', minHeight: 145, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 18, justifyContent: 'flex-end' }, selected: { borderColor: c.lime, backgroundColor: '#252B18' }, emoji: { fontSize: 28, marginBottom: 17 }, cardTitle: { color: c.ink, fontSize: 19, fontWeight: '800' }, hint: { color: c.muted, fontSize: 12, marginTop: 4 },
  button: { minHeight: 62, borderRadius: 18, backgroundColor: c.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 21, paddingVertical: 12, marginTop: 28 }, disabled: { backgroundColor: '#5C6345' }, disabledText: { color: '#DADCCF' }, controlDisabled: { opacity: .65 }, buttonText: { flexShrink: 1, color: '#14160E', fontSize: 16, fontWeight: '900' }, arrow: { color: '#14160E', fontSize: 25 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 }, chip: { borderWidth: 1, borderColor: c.line, backgroundColor: c.card, borderRadius: 99, paddingVertical: 14, paddingHorizontal: 17 }, chipText: { color: c.ink, fontSize: 15, fontWeight: '700' }, back: { color: c.muted, textAlign: 'center', marginTop: 22, fontWeight: '700' },
  searchInput: { minHeight: 54, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card, color: c.ink, fontSize: 15, paddingHorizontal: 16, marginBottom: 22 }, filterLabel: { color: c.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 9 }, guideCount: { color: '#C4C1B8', fontSize: 12, fontWeight: '800', marginBottom: 14 }, sourceNote: { color: '#C6DE76', fontSize: 11, lineHeight: 16, marginTop: 12 },
  filterRow: { gap: 8, paddingBottom: 18 }, filterChip: { borderWidth: 1, borderColor: c.line, backgroundColor: c.card, borderRadius: 99, paddingVertical: 10, paddingHorizontal: 16 }, filterChipSelected: { backgroundColor: c.lime, borderColor: c.lime }, filterText: { color: c.ink, fontSize: 13, fontWeight: '800' }, filterTextSelected: { color: '#14160E' },
  result: { backgroundColor: c.card, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 18, marginBottom: 14, overflow: 'hidden' }, rank: { position: 'absolute', right: 14, top: 10, color: '#7D8C55', fontSize: 32, fontWeight: '900' }, resultName: { color: c.ink, fontSize: 19, fontWeight: '900', paddingRight: 38 }, meta: { color: '#C4C1B8', fontSize: 12, marginTop: 6 }, address: { color: '#C4C1B8', fontSize: 12, marginTop: 5 }, note: { color: c.ink, fontSize: 14, lineHeight: 20, marginTop: 16 }, why: { color: '#C6DE76', fontSize: 12, marginTop: 10 }, actions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 6, borderTopWidth: 1, borderTopColor: c.line, marginTop: 16, paddingTop: 8 }, actionHit: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, action: { color: c.lime, fontWeight: '800', fontSize: 13 }, mutedAction: { color: '#C4C1B8', fontWeight: '700', fontSize: 13 }, secondaryButton: { minHeight: 54, borderRadius: 17, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center', marginTop: 8, padding: 12 }, secondaryButtonText: { color: c.ink, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  kindBadge: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: '#2B321A', paddingHorizontal: 8, paddingVertical: 4, marginBottom: 10 }, kindBadgeText: { color: c.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#56603A', backgroundColor: '#202518', borderRadius: 18, padding: 16, marginBottom: 18 }, locationIcon: { color: c.lime, fontSize: 24, fontWeight: '900', width: 28, textAlign: 'center' }, locationCopy: { flex: 1 }, locationTitle: { color: c.ink, fontSize: 14, fontWeight: '900' }, locationText: { color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  undoBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#202518', borderWidth: 1, borderColor: '#56603A', borderRadius: 16, padding: 14, marginBottom: 14 }, undoText: { color: c.ink, fontSize: 13, fontWeight: '800' },
  preferenceBar: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.line, paddingBottom: 16, marginBottom: 18 }, preferenceCopy: { flex: 1 }, preferenceLabel: { color: c.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, preferenceText: { color: c.ink, fontSize: 13, fontWeight: '700', marginTop: 5 }, edit: { color: c.lime, fontSize: 13, fontWeight: '900' },
  empty: { alignItems: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 28, marginBottom: 18 }, emptyIcon: { color: c.lime, fontSize: 38, fontWeight: '900' }, emptyTitle: { color: c.ink, fontSize: 19, fontWeight: '900', marginTop: 14, textAlign: 'center' }, emptyText: { color: c.muted, fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' }, emptyAction: { borderWidth: 1, borderColor: c.lime, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, marginTop: 20 }, emptyActionText: { color: c.lime, fontSize: 13, fontWeight: '900' }, removeAction: { color: '#FF9A8D', fontWeight: '800', fontSize: 13 },
  bottomNav: { minHeight: 64, flexDirection: 'row', alignItems: 'stretch', borderTopWidth: 1, borderTopColor: c.line, backgroundColor: '#171914', paddingHorizontal: 8 }, navTab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }, navText: { color: c.muted, fontSize: 11, fontWeight: '800', textAlign: 'center' }, navTextSelected: { color: c.lime }, navTextEditorial: { fontFamily: 'SourceSans3_600SemiBold', color: '#9C9B94' }, navTextEditorialSelected: { color: '#F2E7CF' },
});
