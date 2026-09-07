import { useEffect, useState } from 'react';
import { AppState, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDurationRange } from '../domain';
import { recommendExperiencesForPlace } from '../recommendations';
import { Experience, Place } from '../types';

type Props = {
  place: Place;
  context: Parameters<typeof recommendExperiencesForPlace>[1];
  saved: string[];
  onClose: () => void;
  onSave: (id: string) => void;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
  onOpenMaps: (place: Place) => void;
  onOpenSource: (place: Place) => void;
  onOpenPlanMap: (plan: Experience) => void;
  onOpenPlanSource: (plan: Experience) => void;
};

/** Keeps the underlying results/saved screen mounted, including its scroll position. */
export function PlaceDetails({ place, context, saved, onClose, onSave, onDismiss, onRestore, onOpenMaps, onOpenSource, onOpenPlanMap, onOpenPlanSource }: Props) {
  const [planId, setPlanId] = useState<string>();
  const [undoId, setUndoId] = useState<string>();
  const [now, setNow] = useState(() => new Date());
  const plans = recommendExperiencesForPlace(place, { ...context, limit: context.experiences.length, now });
  const plan = plans.find(item => item.id === planId);

  useEffect(() => {
    // Expire a live plan while the detail stays open, and refresh after backgrounding.
    const nextExpiry = context.experiences
      .filter(item => item.lifecycle !== 'evergreen')
      .map(item => Date.parse(item.expiresAt!))
      .filter(time => Number.isFinite(time) && time > now.getTime())
      .sort((a, b) => a - b)[0];
    const timer = nextExpiry === undefined ? undefined : setTimeout(() => setNow(new Date()), Math.min(2_147_483_647, Math.max(1, nextExpiry - Date.now())));
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') setNow(new Date()); });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, [context.experiences, now]);

  const back = () => planId ? setPlanId(undefined) : onClose();
  const hide = (id: string) => { onDismiss(id); setUndoId(id); setPlanId(undefined); };
  return <Modal visible animationType="slide" onRequestClose={back}>
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safe}>
      <View style={styles.bar}>
        <DetailAction text={planId ? 'Mekâna dön' : 'Geri dön'} onPress={back} />
        {!!planId && <DetailAction text="Kapat" onPress={onClose} />}
      </View>
      <ScrollView key={planId ?? place.id} contentContainerStyle={styles.page}>
        {undoId && context.dismissed.includes(undoId) && <View style={styles.card}>
          <Text accessibilityLiveRegion="polite" style={styles.text}>Plan gizlendi.</Text>
          <DetailAction text="Geri al" onPress={() => { onRestore(undoId); setUndoId(undefined); }} />
        </View>}
        {planId ? plan ? <>
          <Text accessibilityRole="header" style={styles.title}>{plan.title}</Text>
          <Text style={styles.meta}>{formatDurationRange(plan.minDurationMinutes, plan.maxDurationMinutes)} · {price(plan.priceLevel)} · {plan.district}</Text>
          <Text style={styles.text}>{plan.description}</Text>
          <Text style={styles.why}>{plan.reasons.join(' · ')}</Text>
          <Text accessibilityRole="header" style={styles.heading}>Planın durakları</Text>
          {plan.points.map((point, index) => <View key={`${index}-${point.placeId}`} style={styles.card}>
            <Text style={styles.text}>{index + 1}. {point.name}</Text>
          </View>)}
          <Text style={styles.text}>{plan.note}</Text>
          <Text style={styles.meta}>{plan.availabilityNote}</Text>
          <View style={styles.actions}>
            <DetailAction text={saved.includes(plan.id) ? 'Kaydedildi · Kayıttan çıkar' : 'Planı kaydet'} onPress={() => onSave(plan.id)} />
            <DetailAction text={plan.points.length > 1 ? 'Rotayı haritada aç' : 'Haritada aç'} onPress={() => onOpenPlanMap(plan)} />
            <DetailAction text="Resmî bilgi" onPress={() => onOpenPlanSource(plan)} />
            <DetailAction text="Bana göre değil" onPress={() => hide(plan.id)} />
          </View>
        </> : <>
          <Text accessibilityRole="header" style={styles.heading}>Bu plan artık gösterilemiyor</Text>
          <Text style={styles.text}>Plan güncellenmiş, süresi dolmuş veya tercihlerinle artık eşleşmiyor olabilir.</Text>
          <DetailAction text="Mekâna dön" onPress={() => setPlanId(undefined)} />
        </> : <>
          <Text accessibilityRole="header" style={styles.title}>{place.name}</Text>
          <Text style={styles.meta}>{place.category} · {place.district} · {price(place.priceLevel)}</Text>
          <Text style={styles.text}>{place.address}</Text>
          <Text style={styles.text}>{place.note}</Text>
          <View style={styles.actions}>
            <DetailAction text={saved.includes(place.id) ? 'Kaydedildi · Kayıttan çıkar' : 'Mekânı kaydet'} onPress={() => onSave(place.id)} />
            <DetailAction text="Haritada aç" onPress={() => onOpenMaps(place)} />
            <DetailAction text="Resmî bilgi" onPress={() => onOpenSource(place)} />
          </View>
          {plans.length > 0 && <View>
            <Text accessibilityRole="header" style={styles.heading}>Bu mekânı kullanan N’apsak planları</Text>
            {plans.map(item => <View key={item.id} style={styles.card}>
              <Text style={styles.headingSmall}>{item.title}</Text>
              <Text style={styles.meta}>{item.points.length} durak · {formatDurationRange(item.minDurationMinutes, item.maxDurationMinutes)} · {price(item.priceLevel)}</Text>
              <Text style={styles.why}>{item.reasons.join(' · ')}</Text>
              <View style={styles.actions}>
                <DetailAction text="Planı incele" label={`${item.title} planını incele`} onPress={() => setPlanId(item.id)} />
                <DetailAction text={saved.includes(item.id) ? 'Kaydedildi · Kayıttan çıkar' : 'Kaydet'} label={`${item.title}: ${saved.includes(item.id) ? 'kayıttan çıkar' : 'kaydet'}`} onPress={() => onSave(item.id)} />
              </View>
            </View>)}
          </View>}
        </>}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const price = (level: number) => '₺'.repeat(level) || 'Ücretsiz';
function DetailAction({ text, label = text, onPress }: { text: string; label?: string; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.action}><Text style={styles.actionText}>{text}</Text></TouchableOpacity>;
}

// Matches the existing screen; final brand tokens will replace these with the design rollout.
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#11120F' },
  bar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18 },
  page: { padding: 22, width: '100%', maxWidth: 720, alignSelf: 'center' },
  title: { color: '#F8F4EA', fontSize: 28, fontWeight: '800' },
  heading: { color: '#F8F4EA', fontSize: 22, fontWeight: '800', marginTop: 24, marginBottom: 14 },
  headingSmall: { color: '#F8F4EA', fontSize: 18, fontWeight: '700' },
  text: { color: '#F8F4EA', fontSize: 16, lineHeight: 24, marginTop: 12 },
  meta: { color: '#C4C1B8', fontSize: 14, lineHeight: 21, marginTop: 8 },
  why: { color: '#C6DE76', fontSize: 14, lineHeight: 21, marginTop: 12 },
  card: { backgroundColor: '#1B1D18', borderColor: '#32352C', borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  action: { minHeight: 48, minWidth: 48, justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 10 },
  actionText: { color: '#D5FF4B', fontSize: 14, fontWeight: '700' },
});
