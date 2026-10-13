import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F, GEZEK_SURFACE_SHADOW as shadow } from '../../design/gezekTheme';
import type { PreferenceDraft, PreferenceField } from '../../preferenceEditor';
import { KNOWN_BUDGETS, KNOWN_DURATIONS, KNOWN_GROUP_SIZES, KNOWN_INTERESTS } from '../../types';
import { PREFERENCE_ASSETS } from './preferenceAssetXml';

export function PreferenceAsset({ name }: { name: keyof typeof PREFERENCE_ASSETS }) {
  const asset = PREFERENCE_ASSETS[name];
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width: asset.width, height: asset.height }}><SvgXml xml={asset.xml} /></View>;
}
export const preferenceLabel = (value?: string) => value === 'Ücretsiz' ? 'Bedava' : value === 'Tek' ? '1 kişi' : value === '5+' ? '5+ kişi' : value ?? 'Fark etmez';
export const preferenceFields = {
  mood: { label: 'Ruh hâli', title: 'Ruh hâlini seç', glyph: '≈', icon: 'mood', color: C.blueWhisper, description: 'Bugünkü planların temposunu buna göre ayarlansın.' },
  duration: { label: 'Süre', title: 'Ne kadar vaktin var?', glyph: '∿', icon: 'duration', color: C.lavender, description: 'Planlara ayırabileceğin maksimum süreyi seç. İlk durağa ulaşım ve eve dönüş hariç.' },
  budget: { label: 'Bütçe', title: 'Bugünkü bütçen', glyph: '₺', icon: 'budget', color: C.coral, description: 'Önerileri fiyat aralığına göre sadeleştirelim.' },
  groupSize: { label: 'Kişi sayısı', title: 'Kaç kişisiniz?', glyph: '••', icon: 'group', color: C.mint, description: 'Mekân ve plan önerilerini grubuna göre ayarla.' },
  interests: { label: 'İlgi alanların', title: 'Neler ilgini çekiyor?', glyph: '✦', icon: 'interest-art', color: C.lavender, description: 'Bir veya birkaçını seç. Sonraki önerilerinde dikkate alacağız.' },
} as const;
const interestCards = [
  { value: KNOWN_INTERESTS[0], hint: 'Nitelikli molalar', icon: 'interest-coffee', color: C.lavender },
  { value: KNOWN_INTERESTS[1], hint: 'Sergi ve galeriler', icon: 'interest-art', color: C.lavender },
  { value: KNOWN_INTERESTS[2], hint: 'Park ve açık hava', icon: 'interest-nature', color: C.mint },
  { value: KNOWN_INTERESTS[3], hint: 'Lokal tatlar', icon: 'interest-food', color: C.coral },
  { value: KNOWN_INTERESTS[4], hint: 'Konser, tiyatro ve atölyeler', icon: 'interest-event', color: C.lavender },
] as const;

/** Shared approved field controls; no onboarding progress or navigation is coupled here. */
export function PreferenceOptions({ field, draft, onChange }: { field: PreferenceField; draft: PreferenceDraft; onChange: (value: Partial<PreferenceDraft>) => void }) {
  if (field === 'interests') return <View style={s.grid}>{interestCards.map((card, index) => {
    const checked = draft.interests.includes(card.value);
    return <TouchableOpacity key={card.value} accessibilityRole="checkbox" accessibilityLabel={`${card.value}: ${card.hint}`} accessibilityState={{ checked }}
      onPress={() => onChange({ interests: checked ? draft.interests.filter(value => value !== card.value) : [...draft.interests, card.value] })}
      style={[s.interest, index === 4 && s.wideInterest, checked && s.checked]}>
      <View style={[s.tile, index === 4 && s.rowTile, { backgroundColor: card.color }]}><PreferenceAsset name={card.icon} /></View>
      <View style={[s.interestCopy, index === 4 && s.rowCopy]}><Text style={[s.interestTitle, index === 4 && s.rowTitle]}>{card.value}</Text><Text style={s.hint}>{card.hint}</Text></View>
      {checked && <View style={[s.check, index === 4 && s.rowCheck]}><PreferenceAsset name="selected-check" /><View style={s.checkMark}><PreferenceAsset name="check-mark" /></View></View>}
    </TouchableOpacity>;
  })}</View>;
  const options = field === 'mood' ? ['Sakin', 'Enerjik', 'Meraklı', 'Sosyal'] : field === 'budget' ? KNOWN_BUDGETS : field === 'duration' ? KNOWN_DURATIONS : KNOWN_GROUP_SIZES;
  return <View accessibilityRole="radiogroup" style={s.grid}>{options.map((value, index) => {
    const selected = draft[field] === value;
    return <TouchableOpacity key={value} accessibilityRole="radio" accessibilityLabel={preferenceLabel(value)} accessibilityState={{ selected }}
      onPress={() => onChange({ [field]: value } as Partial<PreferenceDraft>)} style={[s.option, index === 4 && s.full, selected && s.selected]}>
      <Text style={[s.optionText, selected && s.inverse]}>{preferenceLabel(value)}</Text>
      {selected && <View style={s.pip}><PreferenceAsset name="selected-pip" /></View>}
    </TouchableOpacity>;
  })}</View>;
}
const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: { width: '48%', flexGrow: 1, minHeight: 46, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.canvas, justifyContent: 'center', alignItems: 'center', padding: 12 },
  full: { width: '100%' }, selected: { backgroundColor: C.cobalt, borderColor: C.cobalt },
  optionText: { color: C.navy, fontFamily: F.semiBold, fontSize: 12, lineHeight: 20, textAlign: 'center' }, inverse: { color: C.canvas },
  pip: { position: 'absolute', top: 8, right: 10 },
  interest: { width: '48%', flexGrow: 1, minHeight: 148, borderRadius: 22, padding: 13, backgroundColor: C.surface, borderColor: C.border, borderWidth: 1, ...shadow },
  checked: { borderColor: C.cobalt, borderWidth: 2, padding: 12 }, wideInterest: { width: '100%', minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, interestCopy: { flexShrink: 1 },
  rowTitle: { marginTop: 0, fontSize: 15, lineHeight: 20 }, rowTile: { width: 44, height: 44 }, rowCopy: { marginRight: 28 },
  check: { position: 'absolute', right: 12, top: 12 }, rowCheck: { top: 23 }, checkMark: { position: 'absolute', top: 5, left: 5 },
  interestTitle: { color: C.navy, fontFamily: F.bold, fontSize: 17, lineHeight: 22, marginTop: 12 }, hint: { color: C.mutedText, fontFamily: F.regular, fontSize: 12, lineHeight: 16, marginTop: 6 },
});
