import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Coordinates } from './src/domain';
import { places } from './src/data/places';
import { loadPreferences, savePreferences } from './src/persistence';
import { recommendPlaces } from './src/recommendations';
import { Interest, Mood, Place } from './src/types';
import { Coordinates, distanceInKm } from './src/domain';
import { loadPreferences, savePreferences } from './src/persistence';

type Step = 'mood' | 'interest' | 'results';

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
  const [step, setStep] = useState<Step>('mood');
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
    const ranked = recommendPlaces({ places, mood, interests: chosen, dismissed, coordinates, limit: places.length });
    const offset = ranked.length ? recommendationRun % ranked.length : 0;
    return [...ranked.slice(offset), ...ranked.slice(0, offset)].slice(0, 5);
  }, [mood, chosen, dismissed, recommendationRun, coordinates]);

  useEffect(() => {
    loadPreferences().then(preferences => {
      setSaved(preferences.saved);
      setDismissed(preferences.dismissed);
    }).finally(() => setHydrated(true));
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    savePreferences({ saved, dismissed }).catch(() => Alert.alert('Kayıt yapılamadı', 'Tercihlerin bu kez cihazına kaydedilemedi.'));
  }, [saved, dismissed, hydrated]);

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
  const reset = () => { setStep('mood'); setMood(undefined); setChosen([]); setDismissed([]); setRecommendationRun(0); };
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
  const openSource = (place: Place) => Linking.openURL(place.sourceUrl);

  return <SafeAreaView style={s.safe}>
    <StatusBar style="light" /><View style={s.orb} />
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <View style={s.header}><Text style={s.logo}>n’apsak?</Text><Text style={s.counter}>{step === 'mood' ? '01' : step === 'interest' ? '02' : '03'} / 03</Text></View>
      {step === 'mood' && <View>
        <Lead eyebrow="ŞU AN" title="Nasıl hissediyorsun?" subtitle="Modunu seç, Ankara’da sana iyi gelecek bir plan bulalım." />
        <View style={s.grid}>{moods.map(x => <TouchableOpacity key={x.label} activeOpacity={.8} style={[s.mood, mood === x.label && s.selected]} onPress={() => setMood(x.label)}><Text style={s.emoji}>{x.emoji}</Text><Text style={s.cardTitle}>{x.label}</Text><Text style={s.hint}>{x.hint}</Text></TouchableOpacity>)}</View>
        <Button label="Devam et" disabled={!mood} onPress={() => setStep('interest')} />
      </View>}
      {step === 'interest' && <View>
        <Lead eyebrow="BUGÜN" title="Neye açıksın?" subtitle="Bir veya birkaç ilgi alanı seç. Kararsızsan hepsini bize bırak." />
        <View style={s.chips}>{interests.map(x => <TouchableOpacity key={x.label} style={[s.chip, chosen.includes(x.label) && s.selected]} onPress={() => toggle(x.label)}><Text style={s.chipText}>{x.emoji}  {x.label}</Text></TouchableOpacity>)}</View>
        <Button label="Bana 5 fikir ver" onPress={() => setStep('results')} />
        <TouchableOpacity onPress={() => setStep('mood')}><Text style={s.back}>← Modumu değiştir</Text></TouchableOpacity>
      </View>}
      {step === 'results' && <View>
        <Lead eyebrow="SANA GÖRE" title="Bugün bunlar olur." subtitle={`${mood} moduna ve seçimlerine göre sıraladık.`} />
        <TouchableOpacity disabled={locating} onPress={requestLocation} style={s.locationCard}>
          {locating ? <ActivityIndicator color={c.lime} /> : <Text style={s.locationIcon}>{coordinates ? '✓' : '⌖'}</Text>}
          <View style={s.locationCopy}><Text style={s.locationTitle}>{coordinates ? 'Konum kullanılıyor' : 'Yakınımdakileri bul'}</Text><Text style={s.locationText}>{locationMessage}</Text></View>
        </TouchableOpacity>
        {results.map((p, i) => <View key={p.id} style={s.result}>
          <Text style={s.rank}>{i + 1}</Text><Text style={s.resultName}>{p.name}</Text>
          <Text style={s.meta}>N’apsak {p.editorialScore}  ·  {p.distance === undefined ? 'Konum bekleniyor' : `${p.distance.toFixed(1)} km`}  ·  {p.district}</Text>
          <Text style={s.address}>{p.address}</Text>
          <Text style={s.note}>{p.note}</Text><Text style={s.why}>Neden? {p.reasons.join(' · ')}</Text>
          <View style={s.actions}><TouchableOpacity onPress={() => setSaved(c => c.includes(p.id) ? c.filter(id => id !== p.id) : [...c, p.id])}><Text style={s.action}>{saved.includes(p.id) ? '♥ Kaydedildi' : '♡ Kaydet'}</Text></TouchableOpacity><TouchableOpacity onPress={() => openInMaps(p)}><Text style={s.action}>Haritada aç</Text></TouchableOpacity><TouchableOpacity onPress={() => openSource(p)}><Text style={s.action}>Resmî bilgi</Text></TouchableOpacity><TouchableOpacity onPress={() => setDismissed(c => [...c, p.id])}><Text style={s.mutedAction}>Bana göre değil</Text></TouchableOpacity></View>
        </View>)}
        <TouchableOpacity style={s.secondaryButton} onPress={() => setRecommendationRun(run => run + 1)}><Text style={s.secondaryButtonText}>Bana farklı şeyler göster ↻</Text></TouchableOpacity>
        <Button label="Baştan farklı bir plan yap" onPress={reset} />
      </View>}
    </ScrollView>
  </SafeAreaView>;
}

function Lead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) { return <><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.title}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text></>; }
function Button({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) { return <TouchableOpacity activeOpacity={.85} disabled={disabled} onPress={onPress} style={[s.button, disabled && s.disabled]}><Text style={s.buttonText}>{label}</Text><Text style={s.arrow}>→</Text></TouchableOpacity>; }

const c = { ink: '#F8F4EA', muted: '#AAA79F', bg: '#11120F', card: '#1B1D18', lime: '#D5FF4B', line: '#32352C' };
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg }, page: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48 },
  orb: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#4A5E13', opacity: .22, top: -120, right: -90 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 54 }, logo: { color: c.ink, fontSize: 25, fontWeight: '900', letterSpacing: -1.2 }, counter: { color: c.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  eyebrow: { color: c.lime, fontSize: 12, fontWeight: '800', letterSpacing: 2.2, marginBottom: 12 }, title: { color: c.ink, fontSize: 39, lineHeight: 43, fontWeight: '900', letterSpacing: -1.8 }, subtitle: { color: c.muted, fontSize: 16, lineHeight: 24, marginTop: 14, marginBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, mood: { width: '48%', minHeight: 145, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 18, justifyContent: 'flex-end' }, selected: { borderColor: c.lime, backgroundColor: '#252B18' }, emoji: { fontSize: 28, marginBottom: 17 }, cardTitle: { color: c.ink, fontSize: 19, fontWeight: '800' }, hint: { color: c.muted, fontSize: 12, marginTop: 4 },
  button: { height: 62, borderRadius: 18, backgroundColor: c.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 21, marginTop: 28 }, disabled: { opacity: .32 }, buttonText: { color: '#14160E', fontSize: 16, fontWeight: '900' }, arrow: { color: '#14160E', fontSize: 25 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 }, chip: { borderWidth: 1, borderColor: c.line, backgroundColor: c.card, borderRadius: 99, paddingVertical: 14, paddingHorizontal: 17 }, chipText: { color: c.ink, fontSize: 15, fontWeight: '700' }, back: { color: c.muted, textAlign: 'center', marginTop: 22, fontWeight: '700' },
  result: { backgroundColor: c.card, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 18, marginBottom: 14, overflow: 'hidden' }, rank: { position: 'absolute', right: 14, top: 10, color: '#56603A', fontSize: 32, fontWeight: '900' }, resultName: { color: c.ink, fontSize: 19, fontWeight: '900', paddingRight: 38 }, meta: { color: c.muted, fontSize: 12, marginTop: 6 }, address: { color: c.muted, fontSize: 12, marginTop: 5 }, note: { color: c.ink, fontSize: 14, lineHeight: 20, marginTop: 16 }, why: { color: '#A8BD61', fontSize: 12, marginTop: 10 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, borderTopWidth: 1, borderTopColor: c.line, marginTop: 16, paddingTop: 14 }, action: { color: c.lime, fontWeight: '800', fontSize: 13 }, mutedAction: { color: c.muted, fontWeight: '700', fontSize: 13 }, secondaryButton: { height: 54, borderRadius: 17, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, secondaryButtonText: { color: c.ink, fontSize: 14, fontWeight: '800' },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#56603A', backgroundColor: '#202518', borderRadius: 18, padding: 16, marginBottom: 18 }, locationIcon: { color: c.lime, fontSize: 24, fontWeight: '900', width: 28, textAlign: 'center' }, locationCopy: { flex: 1 }, locationTitle: { color: c.ink, fontSize: 14, fontWeight: '900' }, locationText: { color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
});
