import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { initialCatalog, initializeDataBackbone, queuePreferencesForRemoteSync } from './src/backend';
import { loadPreferences, savePreferences } from './src/persistence';
import { RecommendationItem, recommendAll } from './src/recommendations';
import { DEFAULT_RESULT_FILTER, RESULT_FILTERS, ResultFilter } from './src/resultFilters';
import { BudgetPreference, DurationPreference, Event, Experience, GroupSizePreference, Idea, Interest, Mood, Place } from './src/types';
import { Coordinates, dismissId, formatDurationRange, resolveSavedPlaces, restoreId, toggleId } from './src/domain';

type Step = 'welcome' | 'mood' | 'interest' | 'budget' | 'group' | 'duration' | 'results' | 'saved' | 'hidden';

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
  const { width } = useWindowDimensions();
  const [catalog, setCatalog] = useState(() => initialCatalog());
  const { places, ideas, events, experiences } = catalog;
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
  const results = useMemo(() => {
    return recommendAll({ places, ideas, events, experiences, filter: resultFilter, mood, interests: chosen, dismissed, budget, groupSize, duration, coordinates, limit: 5, seed: recommendationRun, previousBatch });
  }, [mood, chosen, dismissed, budget, groupSize, duration, recommendationRun, coordinates, previousBatch, resultFilter]);
  const catalogItems = useMemo<(Place | Idea | Event | Experience)[]>(() => [...experiences, ...places, ...ideas, ...events], [experiences, places, ideas, events]);
  const savedItems = useMemo(() => resolveSavedPlaces<Place | Idea | Event | Experience>(catalogItems, saved), [catalogItems, saved]);
  const hiddenItems = useMemo(() => resolveSavedPlaces<Place | Idea | Event | Experience>(catalogItems, dismissed), [catalogItems, dismissed]);

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


  if (!hydrated) return <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[s.safe, s.loading]}><StatusBar style="light" /><ActivityIndicator accessibilityLabel="Tercihler yükleniyor" color={c.lime} size="large" /><Text accessibilityLiveRegion="polite" style={s.loadingText}>Tercihlerin hazırlanıyor…</Text></SafeAreaView>;

  const stepNumber = step === 'welcome' ? '01' : step === 'mood' ? '02' : step === 'interest' ? '03' : step === 'budget' ? '04' : step === 'group' ? '05' : step === 'duration' ? '06' : '07';
  return <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={s.safe}>
    <StatusBar style="light" /><View style={s.orb} />
    <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scrollRef} contentContainerStyle={[s.page, width >= 700 && s.pageWide]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} onContentSizeChange={() => { if (scrollAfterRotation.current) { scrollAfterRotation.current = false; requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, recommendationsY.current - 10), animated: true })); } }}>
      <View style={s.header}><TouchableOpacity accessibilityRole="button" accessibilityLabel="N’apsak ana başlığı" hitSlop={12} onPress={() => step === 'saved' || step === 'hidden' ? setStep('results') : undefined}><Text style={s.logo}>N’apsak?</Text></TouchableOpacity><View style={s.headerActions}>{(step === 'results' || step === 'saved' || step === 'hidden') && <TouchableOpacity accessibilityRole="button" accessibilityLabel={step === 'saved' ? 'Önerilere dön' : `${saved.length} kaydedilen öneriyi göster`} hitSlop={10} onPress={() => setStep(step === 'saved' ? 'results' : 'saved')}><Text style={s.savedLink}>{step === 'saved' ? 'Öneriler' : `Kaydedilenler (${saved.length})`}</Text></TouchableOpacity>}<Text accessibilityLabel={`Adım ${stepNumber}, toplam 7`} style={s.counter}>{stepNumber} / 07</Text></View></View>
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
      {step === 'hidden' && <View>
        <Lead eyebrow="GİZLEDİKLERİN" title="Gizlediğim öneriler" subtitle="Bana göre değil dediğin planları ve diğer önerileri tek tek veya topluca geri getirebilirsin." />
        {!hiddenItems.length && <View style={s.empty}><Text style={s.emptyIcon}>✓</Text><Text style={s.emptyTitle}>Gizli önerin yok</Text><Text style={s.emptyText}>Bir öneriyi gizlediğinde burada görünür.</Text><TouchableOpacity style={s.emptyAction} onPress={() => setStep('results')}><Text style={s.emptyActionText}>Önerilere dön</Text></TouchableOpacity></View>}
        {hiddenItems.map(item => <View key={item.id} style={s.result}><Text style={s.resultName}>{itemTitle(item)}</Text><Text style={s.meta}>{itemMeta(item)}</Text>{'address' in item && <Text style={s.address}>{item.address}</Text>}<Text style={s.note}>{item.note}</Text><View style={s.actions}><Action label={`${itemTitle(item)} önerisini geri getir`} onPress={() => restorePlace(item.id)} text="Geri getir" /></View></View>)}
        {!!hiddenItems.length && <TouchableOpacity style={s.secondaryButton} onPress={() => setDismissed([])}><Text style={s.secondaryButtonText}>Tüm gizlenenleri geri getir</Text></TouchableOpacity>}
        <Button label="Önerilere dön" onPress={() => setStep('results')} />
      </View>}
      {step === 'saved' && <View>
        <Lead eyebrow="LİSTEN" title="Kaydedilenler" subtitle="Sonra bakmak için ayırdığın planlar ve diğer öneriler burada." />
        {!savedItems.length && <View style={s.empty}><Text style={s.emptyIcon}>♡</Text><Text style={s.emptyTitle}>Henüz bir öneri kaydetmedin</Text><Text style={s.emptyText}>Önerilerdeki “Kaydet” seçeneğine dokunduğunda burada görünecek.</Text><TouchableOpacity style={s.emptyAction} onPress={() => setStep('results')}><Text style={s.emptyActionText}>Önerilere dön</Text></TouchableOpacity></View>}
        {savedItems.map(item => <View key={item.id} style={s.result}><Text style={s.resultName}>{itemTitle(item)}</Text><Text style={s.meta}>{itemMeta(item)}</Text>{'address' in item && <Text style={s.address}>{item.address}</Text>}<Text style={s.note}>{item.note}</Text><View style={s.actions}>{'name' in item ? <Action label={`${item.name} mekânını haritada aç`} onPress={() => openInMaps(item)} text="Haritada aç" /> : item.kind === 'idea' ? <Action label={`${item.title} fikrini aç`} onPress={() => openIdea(item)} text={item.actionLabel} /> : item.kind === 'event' ? <Action label={`${item.title} etkinlik detayını aç`} onPress={() => openEvent(item)} text="Bilet / Detay" /> : <Action label={`${item.title} planının resmî bilgisini aç`} onPress={() => openExperienceSource(item)} text="Resmî bilgi" />}<Action label="Öneriyi kayıttan çıkar" remove onPress={() => setSaved(current => current.filter(id => id !== item.id))} text="Kayıttan çıkar" /></View></View>)}
      </View>}
    </ScrollView></KeyboardAvoidingView>
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
  loading: { alignItems: 'center', justifyContent: 'center', gap: 14 }, loadingText: { color: c.muted, fontSize: 14 },
  orb: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#4A5E13', opacity: .22, top: -120, right: -90 },
  header: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }, headerActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 }, logo: { color: c.ink, fontSize: 28, fontWeight: '900', letterSpacing: -1.2 }, savedLink: { color: c.lime, fontSize: 12, fontWeight: '800', paddingVertical: 10 }, counter: { color: '#C4C1B8', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  eyebrow: { color: c.lime, fontSize: 12, fontWeight: '800', letterSpacing: 2.2, marginBottom: 12 }, title: { color: c.ink, fontSize: 39, lineHeight: 43, fontWeight: '900', letterSpacing: -1.8 }, subtitle: { color: c.muted, fontSize: 16, lineHeight: 24, marginTop: 14, marginBottom: 30 },
  welcomeEmoji: { color: c.lime, fontSize: 48, marginBottom: 30 }, promise: { backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 18, padding: 18 }, promiseTitle: { color: c.ink, fontSize: 16, fontWeight: '900' }, promiseText: { color: c.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, mood: { width: '48%', minHeight: 145, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 18, justifyContent: 'flex-end' }, selected: { borderColor: c.lime, backgroundColor: '#252B18' }, emoji: { fontSize: 28, marginBottom: 17 }, cardTitle: { color: c.ink, fontSize: 19, fontWeight: '800' }, hint: { color: c.muted, fontSize: 12, marginTop: 4 },
  button: { minHeight: 62, borderRadius: 18, backgroundColor: c.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 21, paddingVertical: 12, marginTop: 28 }, disabled: { backgroundColor: '#5C6345' }, disabledText: { color: '#DADCCF' }, controlDisabled: { opacity: .65 }, buttonText: { flexShrink: 1, color: '#14160E', fontSize: 16, fontWeight: '900' }, arrow: { color: '#14160E', fontSize: 25 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 }, chip: { borderWidth: 1, borderColor: c.line, backgroundColor: c.card, borderRadius: 99, paddingVertical: 14, paddingHorizontal: 17 }, chipText: { color: c.ink, fontSize: 15, fontWeight: '700' }, back: { color: c.muted, textAlign: 'center', marginTop: 22, fontWeight: '700' },
  filterRow: { gap: 8, paddingBottom: 18 }, filterChip: { borderWidth: 1, borderColor: c.line, backgroundColor: c.card, borderRadius: 99, paddingVertical: 10, paddingHorizontal: 16 }, filterChipSelected: { backgroundColor: c.lime, borderColor: c.lime }, filterText: { color: c.ink, fontSize: 13, fontWeight: '800' }, filterTextSelected: { color: '#14160E' },
  result: { backgroundColor: c.card, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 18, marginBottom: 14, overflow: 'hidden' }, rank: { position: 'absolute', right: 14, top: 10, color: '#7D8C55', fontSize: 32, fontWeight: '900' }, resultName: { color: c.ink, fontSize: 19, fontWeight: '900', paddingRight: 38 }, meta: { color: '#C4C1B8', fontSize: 12, marginTop: 6 }, address: { color: '#C4C1B8', fontSize: 12, marginTop: 5 }, note: { color: c.ink, fontSize: 14, lineHeight: 20, marginTop: 16 }, why: { color: '#C6DE76', fontSize: 12, marginTop: 10 }, actions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 6, borderTopWidth: 1, borderTopColor: c.line, marginTop: 16, paddingTop: 8 }, actionHit: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, action: { color: c.lime, fontWeight: '800', fontSize: 13 }, mutedAction: { color: '#C4C1B8', fontWeight: '700', fontSize: 13 }, secondaryButton: { minHeight: 54, borderRadius: 17, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center', marginTop: 8, padding: 12 }, secondaryButtonText: { color: c.ink, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  kindBadge: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: '#2B321A', paddingHorizontal: 8, paddingVertical: 4, marginBottom: 10 }, kindBadgeText: { color: c.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#56603A', backgroundColor: '#202518', borderRadius: 18, padding: 16, marginBottom: 18 }, locationIcon: { color: c.lime, fontSize: 24, fontWeight: '900', width: 28, textAlign: 'center' }, locationCopy: { flex: 1 }, locationTitle: { color: c.ink, fontSize: 14, fontWeight: '900' }, locationText: { color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  undoBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#202518', borderWidth: 1, borderColor: '#56603A', borderRadius: 16, padding: 14, marginBottom: 14 }, undoText: { color: c.ink, fontSize: 13, fontWeight: '800' },
  preferenceBar: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.line, paddingBottom: 16, marginBottom: 18 }, preferenceCopy: { flex: 1 }, preferenceLabel: { color: c.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, preferenceText: { color: c.ink, fontSize: 13, fontWeight: '700', marginTop: 5 }, edit: { color: c.lime, fontSize: 13, fontWeight: '900' },
  empty: { alignItems: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 28, marginBottom: 18 }, emptyIcon: { color: c.lime, fontSize: 38, fontWeight: '900' }, emptyTitle: { color: c.ink, fontSize: 19, fontWeight: '900', marginTop: 14, textAlign: 'center' }, emptyText: { color: c.muted, fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' }, emptyAction: { borderWidth: 1, borderColor: c.lime, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, marginTop: 20 }, emptyActionText: { color: c.lime, fontSize: 13, fontWeight: '900' }, removeAction: { color: '#FF9A8D', fontWeight: '800', fontSize: 13 },
});
