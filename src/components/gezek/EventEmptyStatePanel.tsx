import { useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F } from '../../design/gezekTheme';
import type { EventPresentationState } from '../../eventPresentation';
import { focusDetailControl } from './detailFocus';
import { PreferenceAsset } from './PreferenceControls';

export const EVENT_EMPTY_COPY = {
  budget_no_match: { eyebrow: 'BÜTÇE EŞLEŞMESİ', title: 'Bedava etkinlik bulamadık', description: 'Şu anda bütçene uyan ücretsiz bir etkinlik yok. Bütçeyi değiştirerek diğer güncel etkinliklere bakabilirsin.', action: 'Bütçeyi değiştir', image: require('../../../assets/gezek/preferences/event-budget.png') },
  all_dismissed: { eyebrow: 'GİZLENEN ETKİNLİKLER', title: 'Etkinlik önerilerini gizledin', description: 'Sana uyan güncel etkinlikler var; fakat hepsini gizledin. Yalnızca bu ekrandaki etkinlik önerilerini geri getirebilirsin.', action: 'Etkinlikleri geri getir', image: require('../../../assets/gezek/preferences/event-dismissed.png') },
  no_current_catalog: { eyebrow: 'GÜNCEL KATALOG', title: 'Şu an güncel etkinlik yok', description: 'Yeni doğrulanan etkinlikler eklendiğinde burada görünecek.', action: undefined, image: require('../../../assets/gezek/preferences/event-catalog.png') },
  load_error: { eyebrow: 'BAĞLANTI SORUNU', title: 'Etkinlikler yüklenemedi', description: 'Güncel etkinlik verilerine şu anda ulaşamıyoruz. Bağlantını kontrol edip yeniden deneyebilirsin.', action: 'Tekrar dene', image: require('../../../assets/gezek/preferences/event-error.png') },
  loading: { eyebrow: 'YENİDEN DENENİYOR', title: 'Etkinlikler yükleniyor', description: 'Güncel ve doğrulanmış etkinlikleri yeniden kontrol ediyoruz.', action: 'Yükleniyor…', image: require('../../../assets/gezek/preferences/event-loading.png') },
} as const;
export function EventEmptyStatePanel({ state, onAction, focusAction, description }: { state: Exclude<EventPresentationState, 'populated'>; onAction: (node?: View | null) => void; focusAction?: number; description?: string }) {
  const title = useRef<View>(null);
  const action = useRef<View>(null);
  const copy = EVENT_EMPTY_COPY[state];
  useEffect(() => { const frame = requestAnimationFrame(() => focusDetailControl(title.current)); return () => cancelAnimationFrame(frame); }, [state]);
  useEffect(() => { if (!focusAction) return; const frame = requestAnimationFrame(() => focusDetailControl(action.current)); return () => cancelAnimationFrame(frame); }, [focusAction]);
  return <View testID={`event-empty-${state}`} accessibilityState={{ busy: state === 'loading' }} style={s.panel}>
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.status}><Image accessible={false} source={copy.image} style={s.icon} /><Text accessible={false} style={s.eyebrow}>{copy.eyebrow}</Text></View>
    <View ref={title} focusable tabIndex={-1} accessible accessibilityRole="header" accessibilityLabel={copy.title}><Text accessible={false} style={s.title}>{copy.title}</Text></View>
    <Text style={s.description}>{description ?? copy.description}</Text>
    {copy.action ? <TouchableOpacity ref={action} accessibilityRole="button" accessibilityLabel={copy.action} accessibilityState={{ disabled: state === 'loading', busy: state === 'loading' }} disabled={state === 'loading'} onPress={() => onAction(action.current)} style={[s.action, state === 'all_dismissed' && s.restore]}><Text style={s.actionText}>{copy.action}</Text></TouchableOpacity>
      : <View style={s.information}><PreferenceAsset name="information-dot" /><Text style={s.informationText}>Burada otomatik olarak görünecek.</Text></View>}
  </View>;
}
const s = StyleSheet.create({
  panel: { minHeight: 302, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,.9)', backgroundColor: 'rgba(223,243,232,.72)', padding: 23 },
  status: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 16 }, icon: { width: 48, height: 48 }, eyebrow: { flex: 1, color: C.cobalt, fontFamily: F.semiBold, fontSize: 10, lineHeight: 14, marginTop: 2 },
  title: { color: C.navy, fontFamily: F.extraBold, fontSize: 23, lineHeight: 30, minHeight: 60 }, description: { color: '#6F788F', fontFamily: F.regular, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 11 },
  action: { minHeight: 48, borderRadius: 18, backgroundColor: C.cobalt, alignItems: 'center', justifyContent: 'center', padding: 14 }, restore: { backgroundColor: C.navy }, actionText: { fontFamily: F.semiBold, fontSize: 14, lineHeight: 20, textAlign: 'center', color: C.surface },
  information: { minHeight: 48, padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.52)', flexDirection: 'row', alignItems: 'center', gap: 12 }, informationText: { flex: 1, color: C.navy, fontFamily: F.semiBold, fontSize: 12, lineHeight: 20 },
});
