import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { places } from './src/data/places';
import { loadPreferences, savePreferences } from './src/persistence';
import { recommendPlaces } from './src/recommendations';
import { Interest, Mood, Place } from './src/types';
import { Coordinates, resolveSavedPlaces, toggleId } from './src/domain';

type Step = 'welcome' | 'mood' | 'interest' | 'results' | 'saved';

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
export default function App() {
  return <SafeAreaProvider><AppContent /></SafeAreaProvider>;
}

function AppContent() {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<Step>('welcome');
  const [mood, setMood] = useState<Mood>();
  const [chosen, setChosen] = useState<Interest[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [recommendationRun, setRecommendationRun] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>();
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('Mesafeleri görmek için konumunu paylaş.');
  const results = useMemo(() => {
    return recommendPlaces({ places, mood, interests: chosen, dismissed, coordinates, limit: 5, seed: recommendationRun });
  }, [mood, chosen, dismissed, recommendationRun, coordinates]);
  const savedPlaces = useMemo(() => resolveSavedPlaces(places, saved), [saved]);

  useEffect(() => {
    loadPreferences().then(preferences => {
      setSaved(preferences.saved);
      setDismissed(preferences.dismissed);
      setMood(preferences.mood);
      setChosen(preferences.interests);
      if (preferences.onboardingCompleted && preferences.mood) setStep('results');
    }).finally(() => setHydrated(true));
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    savePreferences({ saved, dismissed, mood, interests: chosen, onboardingCompleted: step === 'results' || step === 'saved' }).catch(() => Alert.alert('Kayıt yapılamadı', 'Tercihlerin bu kez cihazına kaydedilemedi.'));
  }, [saved, dismissed, mood, chosen, step, hydrated]);

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
  const reset = () => { setStep('mood'); setMood(undefined); setChosen([]); setRecommendationRun(0); };
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

  if (!hydrated) return <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[s.safe, s.loading]}><StatusBar style="light" /><ActivityIndicator accessibilityLabel="Tercihler yükleniyor" color={c.lime} size="large" /><Text accessibilityLiveRegion="polite" style={s.loadingText}>Tercihlerin hazırlanıyor…</Text></SafeAreaView>;

  const stepNumber = step === 'welcome' ? '01' : step === 'mood' ? '02' : step === 'interest' ? '03' : '04';
  return <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={s.safe}>
    <StatusBar style="light" /><View style={s.orb} />
    <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={[s.page, width >= 700 && s.pageWide]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.header}><TouchableOpacity accessibilityRole="button" accessibilityLabel="N’apsak ana başlığı" hitSlop={12} onPress={() => step === 'saved' ? setStep('results') : undefined}><Text style={s.logo}>n’apsak?</Text></TouchableOpacity><View style={s.headerActions}>{(step === 'results' || step === 'saved') && <TouchableOpacity accessibilityRole="button" accessibilityLabel={step === 'saved' ? 'Önerilere dön' : `${saved.length} kaydedilen mekânı göster`} hitSlop={10} onPress={() => setStep(step === 'saved' ? 'results' : 'saved')}><Text style={s.savedLink}>{step === 'saved' ? 'Öneriler' : `Kaydedilenler (${saved.length})`}</Text></TouchableOpacity>}<Text accessibilityLabel={`Adım ${stepNumber}, toplam 4`} style={s.counter}>{stepNumber} / 04</Text></View></View>
      {step === 'welcome' && <View>
        <Text style={s.welcomeEmoji}>✦</Text>
        <Lead eyebrow="ANKARA’DA BUGÜN" title="Plan yapmak artık daha kolay." subtitle="Modunu ve ilgi alanlarını bir kez söyle; sana yakın, gününe uygun fikirleri birkaç saniyede bulalım." />
        <View style={s.promise}><Text style={s.promiseTitle}>Sana göre öneriler</Text><Text style={s.promiseText}>Tercihlerin yalnızca cihazında saklanır. İstediğin zaman değiştirebilirsin.</Text></View>
        <Button label="Hadi başlayalım" onPress={() => setStep('mood')} />
      </View>}
      {step === 'mood' && <View>
        <Lead eyebrow="ŞU AN" title="Nasıl hissediyorsun?" subtitle="Modunu seç, Ankara’da sana iyi gelecek bir plan bulalım." />
        <View style={s.grid}>{moods.map(x => <TouchableOpacity accessibilityRole="radio" accessibilityLabel={`${x.label}: ${x.hint}`} accessibilityState={{ selected: mood === x.label }} key={x.label} activeOpacity={.8} style={[s.mood, mood === x.label && s.selected]} onPress={() => setMood(x.label)}><Text style={s.emoji}>{x.emoji}</Text><Text style={s.cardTitle}>{x.label}</Text><Text style={s.hint}>{x.hint}</Text></TouchableOpacity>)}</View>
        <Button label="Devam et" disabled={!mood} onPress={() => setStep('interest')} />
      </View>}
      {step === 'interest' && <View>
        <Lead eyebrow="BUGÜN" title="Neye açıksın?" subtitle="Bir veya birkaç ilgi alanı seç. Kararsızsan hepsini bize bırak." />
        <View style={s.chips}>{interests.map(x => <TouchableOpacity accessibilityRole="checkbox" accessibilityLabel={x.label} accessibilityState={{ checked: chosen.includes(x.label) }} key={x.label} style={[s.chip, chosen.includes(x.label) && s.selected]} onPress={() => toggle(x.label)}><Text style={s.chipText}>{x.emoji}  {x.label}</Text></TouchableOpacity>)}</View>
        <Button label="Tercihlerimi kaydet ve 5 fikir ver" onPress={() => setStep('results')} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mod seçimine geri dön" hitSlop={10} onPress={() => setStep('mood')}><Text style={s.back}>← Modumu değiştir</Text></TouchableOpacity>
      </View>}
      {step === 'results' && <View>
        <Lead eyebrow="SANA GÖRE" title="Bugün bunlar olur." subtitle={`${mood} moduna ve seçimlerine göre sıraladık.`} />
        <View style={s.preferenceBar}><View style={s.preferenceCopy}><Text style={s.preferenceLabel}>TERCİHLERİN</Text><Text style={s.preferenceText}>{mood} · {chosen.length ? chosen.join(', ') : 'Her şeye açığım'}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Tercihleri düzenle" hitSlop={10} onPress={() => setStep('mood')}><Text style={s.edit}>Düzenle</Text></TouchableOpacity></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={coordinates ? 'Konumu yeniden güncelle' : 'Konum izni iste ve yakındaki mekânları bul'} accessibilityState={{ disabled: locating, busy: locating }} disabled={locating} onPress={requestLocation} style={[s.locationCard, locating && s.controlDisabled]}>
          {locating ? <ActivityIndicator color={c.lime} /> : <Text style={s.locationIcon}>{coordinates ? '✓' : '⌖'}</Text>}
          <View style={s.locationCopy}><Text style={s.locationTitle}>{coordinates ? 'Konum kullanılıyor' : 'Yakınımdakileri bul'}</Text><Text style={s.locationText}>{locationMessage}</Text></View>
        </TouchableOpacity>
        {results.map((p, i) => <View key={p.id} style={s.result}>
          <Text style={s.rank}>{i + 1}</Text><Text style={s.resultName}>{p.name}</Text>
          <Text style={s.meta}>N’apsak {p.editorialScore}  ·  {p.distance === undefined ? 'Konum bekleniyor' : `${p.distance.toFixed(1)} km`}  ·  {p.district}</Text>
          <Text style={s.address}>{p.address}</Text>
          <Text style={s.note}>{p.note}</Text><Text style={s.why}>Neden? {p.reasons.join(' · ')}</Text>
          <View style={s.actions}><Action label={saved.includes(p.id) ? 'Kaydedildi, kayıttan çıkar' : 'Mekânı kaydet'} onPress={() => setSaved(c => toggleId(c, p.id))} text={saved.includes(p.id) ? '♥ Kaydedildi' : '♡ Kaydet'} /><Action label={`${p.name} mekânını haritada aç`} onPress={() => openInMaps(p)} text="Haritada aç" /><Action label={`${p.name} resmî bilgisini aç`} onPress={() => openSource(p)} text="Resmî bilgi" /><Action label={`${p.name} önerisini gizle`} muted onPress={() => setDismissed(c => c.includes(p.id) ? c : [...c, p.id])} text="Bana göre değil" /></View>
        </View>)}
        {!results.length && <View style={s.empty}><Text style={s.emptyIcon}>↻</Text><Text style={s.emptyTitle}>Yeni bir öneri kalmadı</Text><Text style={s.emptyText}>“Bana göre değil” dediğin mekânları geri getirip yeniden başlayabilirsin.</Text><TouchableOpacity style={s.emptyAction} onPress={() => setDismissed([])}><Text style={s.emptyActionText}>Tüm önerileri geri getir</Text></TouchableOpacity></View>}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Farklı öneriler göster" style={s.secondaryButton} onPress={() => setRecommendationRun(run => run + 1)}><Text style={s.secondaryButtonText}>Bana farklı şeyler göster ↻</Text></TouchableOpacity>
        <Button label="Baştan farklı bir plan yap" onPress={reset} />
      </View>}
      {step === 'saved' && <View>
        <Lead eyebrow="LİSTEN" title="Kaydedilenler" subtitle="Sonra bakmak için ayırdığın Ankara mekânları burada." />
        {!savedPlaces.length && <View style={s.empty}><Text style={s.emptyIcon}>♡</Text><Text style={s.emptyTitle}>Henüz bir mekân kaydetmedin</Text><Text style={s.emptyText}>Önerilerdeki “Kaydet” seçeneğine dokunduğunda mekânlar burada görünecek.</Text><TouchableOpacity style={s.emptyAction} onPress={() => setStep('results')}><Text style={s.emptyActionText}>Önerilere dön</Text></TouchableOpacity></View>}
        {savedPlaces.map(p => <View key={p.id} style={s.result}><Text style={s.resultName}>{p.name}</Text><Text style={s.meta}>{p.category} · {p.district}</Text><Text style={s.address}>{p.address}</Text><Text style={s.note}>{p.note}</Text><View style={s.actions}><Action label={`${p.name} mekânını haritada aç`} onPress={() => openInMaps(p)} text="Haritada aç" /><Action label={`${p.name} mekânını kayıttan çıkar`} remove onPress={() => setSaved(current => current.filter(id => id !== p.id))} text="Kayıttan çıkar" /></View></View>)}
      </View>}
    </ScrollView></KeyboardAvoidingView>
  </SafeAreaView>;
}

function Lead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) { return <><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.title}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text></>; }
function Button({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) { return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} activeOpacity={.85} disabled={disabled} onPress={onPress} style={[s.button, disabled && s.disabled]}><Text style={[s.buttonText, disabled && s.disabledText]}>{label}</Text><Text style={[s.arrow, disabled && s.disabledText]}>→</Text></TouchableOpacity>; }
function Action({ label, onPress, text, muted, remove }: { label: string; onPress: () => void; text: string; muted?: boolean; remove?: boolean }) { return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} hitSlop={6} onPress={onPress} style={s.actionHit}><Text style={remove ? s.removeAction : muted ? s.mutedAction : s.action}>{text}</Text></TouchableOpacity>; }

const c = { ink: '#F8F4EA', muted: '#AAA79F', bg: '#11120F', card: '#1B1D18', lime: '#D5FF4B', line: '#32352C' };
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg }, page: { flexGrow: 1, width: '100%', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32 }, pageWide: { maxWidth: 720, alignSelf: 'center', paddingHorizontal: 32 },
  loading: { alignItems: 'center', justifyContent: 'center', gap: 14 }, loadingText: { color: c.muted, fontSize: 14 },
  orb: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#4A5E13', opacity: .22, top: -120, right: -90 },
  header: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }, headerActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 }, logo: { color: c.ink, fontSize: 25, fontWeight: '900', letterSpacing: -1.2 }, savedLink: { color: c.lime, fontSize: 12, fontWeight: '800', paddingVertical: 10 }, counter: { color: '#C4C1B8', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  eyebrow: { color: c.lime, fontSize: 12, fontWeight: '800', letterSpacing: 2.2, marginBottom: 12 }, title: { color: c.ink, fontSize: 39, lineHeight: 43, fontWeight: '900', letterSpacing: -1.8 }, subtitle: { color: c.muted, fontSize: 16, lineHeight: 24, marginTop: 14, marginBottom: 30 },
  welcomeEmoji: { color: c.lime, fontSize: 48, marginBottom: 30 }, promise: { backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 18, padding: 18 }, promiseTitle: { color: c.ink, fontSize: 16, fontWeight: '900' }, promiseText: { color: c.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, mood: { width: '48%', minHeight: 145, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 18, justifyContent: 'flex-end' }, selected: { borderColor: c.lime, backgroundColor: '#252B18' }, emoji: { fontSize: 28, marginBottom: 17 }, cardTitle: { color: c.ink, fontSize: 19, fontWeight: '800' }, hint: { color: c.muted, fontSize: 12, marginTop: 4 },
  button: { minHeight: 62, borderRadius: 18, backgroundColor: c.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 21, paddingVertical: 12, marginTop: 28 }, disabled: { backgroundColor: '#5C6345' }, disabledText: { color: '#DADCCF' }, controlDisabled: { opacity: .65 }, buttonText: { flexShrink: 1, color: '#14160E', fontSize: 16, fontWeight: '900' }, arrow: { color: '#14160E', fontSize: 25 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 }, chip: { borderWidth: 1, borderColor: c.line, backgroundColor: c.card, borderRadius: 99, paddingVertical: 14, paddingHorizontal: 17 }, chipText: { color: c.ink, fontSize: 15, fontWeight: '700' }, back: { color: c.muted, textAlign: 'center', marginTop: 22, fontWeight: '700' },
  result: { backgroundColor: c.card, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 18, marginBottom: 14, overflow: 'hidden' }, rank: { position: 'absolute', right: 14, top: 10, color: '#7D8C55', fontSize: 32, fontWeight: '900' }, resultName: { color: c.ink, fontSize: 19, fontWeight: '900', paddingRight: 38 }, meta: { color: '#C4C1B8', fontSize: 12, marginTop: 6 }, address: { color: '#C4C1B8', fontSize: 12, marginTop: 5 }, note: { color: c.ink, fontSize: 14, lineHeight: 20, marginTop: 16 }, why: { color: '#C6DE76', fontSize: 12, marginTop: 10 }, actions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 6, borderTopWidth: 1, borderTopColor: c.line, marginTop: 16, paddingTop: 8 }, actionHit: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, action: { color: c.lime, fontWeight: '800', fontSize: 13 }, mutedAction: { color: '#C4C1B8', fontWeight: '700', fontSize: 13 }, secondaryButton: { minHeight: 54, borderRadius: 17, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center', marginTop: 8, padding: 12 }, secondaryButtonText: { color: c.ink, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#56603A', backgroundColor: '#202518', borderRadius: 18, padding: 16, marginBottom: 18 }, locationIcon: { color: c.lime, fontSize: 24, fontWeight: '900', width: 28, textAlign: 'center' }, locationCopy: { flex: 1 }, locationTitle: { color: c.ink, fontSize: 14, fontWeight: '900' }, locationText: { color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  preferenceBar: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.line, paddingBottom: 16, marginBottom: 18 }, preferenceCopy: { flex: 1 }, preferenceLabel: { color: c.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, preferenceText: { color: c.ink, fontSize: 13, fontWeight: '700', marginTop: 5 }, edit: { color: c.lime, fontSize: 13, fontWeight: '900' },
  empty: { alignItems: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 28, marginBottom: 18 }, emptyIcon: { color: c.lime, fontSize: 38, fontWeight: '900' }, emptyTitle: { color: c.ink, fontSize: 19, fontWeight: '900', marginTop: 14, textAlign: 'center' }, emptyText: { color: c.muted, fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' }, emptyAction: { borderWidth: 1, borderColor: c.lime, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, marginTop: 20 }, emptyActionText: { color: c.lime, fontSize: 13, fontWeight: '900' }, removeAction: { color: '#FF9A8D', fontWeight: '800', fontSize: 13 },
});
