import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Alert, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Mood = 'Enerjik' | 'Sakin' | 'Sosyal' | 'Meraklı';
type Interest = 'Kahve' | 'Sanat' | 'Doğa' | 'Lezzet' | 'Etkinlik';
type Step = 'mood' | 'interest' | 'results';
type Place = { id: string; name: string; district: string; category: Interest; moods: Mood[]; rating: number; distance: number; note: string; latitude: number; longitude: number };

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
const places: Place[] = [
  { id: '1', name: 'CerModern', district: 'Altındağ', category: 'Sanat', moods: ['Meraklı', 'Sakin'], rating: 4.6, distance: 2.4, note: 'Sergi gez, avluda soluklan.', latitude: 39.9313, longitude: 32.8500 },
  { id: '2', name: 'Seğmenler Parkı', district: 'Çankaya', category: 'Doğa', moods: ['Sakin', 'Sosyal', 'Enerjik'], rating: 4.7, distance: 3.1, note: 'Kısa yürüyüş ve şehir içinde yeşil mola.', latitude: 39.8985, longitude: 32.8633 },
  { id: '3', name: 'Erimtan Müzesi', district: 'Altındağ', category: 'Sanat', moods: ['Meraklı', 'Sakin'], rating: 4.7, distance: 3.8, note: 'Ankara Kalesi rotasına kültür molası ekle.', latitude: 39.9382, longitude: 32.8624 },
  { id: '4', name: 'Kuğulu Park çevresi', district: 'Çankaya', category: 'Kahve', moods: ['Sakin', 'Sosyal'], rating: 4.5, distance: 1.8, note: 'Park turundan sonra yakınlarda kahve keşfet.', latitude: 39.9027, longitude: 32.8608 },
  { id: '5', name: 'CSO Ada Ankara', district: 'Altındağ', category: 'Etkinlik', moods: ['Sosyal', 'Meraklı'], rating: 4.8, distance: 2.9, note: 'Bugünün programına göz at, akşamı sahneye bırak.', latitude: 39.9368, longitude: 32.8439 },
  { id: '6', name: 'Atakule seyir rotası', district: 'Çankaya', category: 'Lezzet', moods: ['Sosyal', 'Meraklı'], rating: 4.4, distance: 4.2, note: 'Manzarayı yemek veya tatlı molasıyla birleştir.', latitude: 39.8868, longitude: 32.8553 },
];

export default function App() {
  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState<Mood>();
  const [chosen, setChosen] = useState<Interest[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [recommendationRun, setRecommendationRun] = useState(0);
  const results = useMemo(() => places.filter(p => !dismissed.includes(p.id)).map(p => ({ ...p, score: (mood && p.moods.includes(mood) ? 40 : 0) + (chosen.includes(p.category) ? 35 : 0) + p.rating * 4 - p.distance + ((Number(p.id) * 17 + recommendationRun * 13) % 11) })).sort((a, b) => b.score - a.score).slice(0, 5), [mood, chosen, dismissed, recommendationRun]);
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
        {results.map((p, i) => <View key={p.id} style={s.result}>
          <Text style={s.rank}>{i + 1}</Text><Text style={s.resultName}>{p.name}</Text>
          <Text style={s.meta}>★ {p.rating}  ·  {p.distance.toFixed(1)} km  ·  {p.district}</Text>
          <Text style={s.note}>{p.note}</Text><Text style={s.why}>Neden? {mood && p.moods.includes(mood) ? `${mood} moduna uygun` : 'yüksek puanlı'} · yakınında</Text>
          <View style={s.actions}><TouchableOpacity onPress={() => setSaved(c => c.includes(p.id) ? c.filter(id => id !== p.id) : [...c, p.id])}><Text style={s.action}>{saved.includes(p.id) ? '♥ Kaydedildi' : '♡ Kaydet'}</Text></TouchableOpacity><TouchableOpacity onPress={() => openInMaps(p)}><Text style={s.action}>Haritada aç</Text></TouchableOpacity><TouchableOpacity onPress={() => setDismissed(c => [...c, p.id])}><Text style={s.mutedAction}>Bana göre değil</Text></TouchableOpacity></View>
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
  result: { backgroundColor: c.card, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 18, marginBottom: 14, overflow: 'hidden' }, rank: { position: 'absolute', right: 14, top: 10, color: '#56603A', fontSize: 32, fontWeight: '900' }, resultName: { color: c.ink, fontSize: 19, fontWeight: '900', paddingRight: 38 }, meta: { color: c.muted, fontSize: 12, marginTop: 6 }, note: { color: c.ink, fontSize: 14, lineHeight: 20, marginTop: 16 }, why: { color: '#A8BD61', fontSize: 12, marginTop: 10 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, borderTopWidth: 1, borderTopColor: c.line, marginTop: 16, paddingTop: 14 }, action: { color: c.lime, fontWeight: '800', fontSize: 13 }, mutedAction: { color: c.muted, fontWeight: '700', fontSize: 13 }, secondaryButton: { height: 54, borderRadius: 17, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, secondaryButtonText: { color: c.ink, fontSize: 14, fontWeight: '800' },
});
