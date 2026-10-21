import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { GEZEK_COLORS as C, GEZEK_FONT_FAMILIES as F, GEZEK_LAYOUT as L } from '../../design/gezekTheme';
import { PROXIMITY_COPY, ProximityFailure, ProximityState } from '../../proximitySession';
import { focusDetailControl } from './detailFocus';

// Existing approved onboarding check (Figma 88:241), unchanged local SVG.
import { ONBOARDING_ASSETS } from './onboardingAssetXml';

export function ProximityControl({ state, onPress, focusSequence }: {
  state: ProximityState; onPress: () => void; focusSequence: number;
}) {
  const node = useRef<View>(null);
  const { fontScale } = useWindowDimensions();
  const active = state.status === 'active', pending = state.status === 'acquiring';
  useEffect(() => {
    if (!focusSequence) return;
    const frame = requestAnimationFrame(() => focusDetailControl(node.current, true));
    return () => cancelAnimationFrame(frame);
  }, [focusSequence]);
  return <Pressable ref={node} testID="proximity-control" accessibilityRole="checkbox" accessibilityLabel={PROXIMITY_COPY.label}
    accessibilityHint={pending ? PROXIMITY_COPY.pending : PROXIMITY_COPY.hint}
    accessibilityState={{ checked: active, selected: active, busy: pending, disabled: pending }}
    disabled={pending} onPress={onPress} style={({ pressed }) => [s.control, fontScale >= 1.4 && s.large,
      active && s.selected, active && fontScale >= 1.4 && { paddingVertical: 6.5 }, (pending || pressed) && s.pressed]}>
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.marker, active && s.checked]}>
      {active && <SvgXml xml={ONBOARDING_ASSETS['6057a'].xml} width={12} height={12} />}
    </View>
    <Text accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" testID="proximity-label" style={[s.label, fontScale >= 1.4 && { lineHeight: 16 }]}>{pending ? PROXIMITY_COPY.pending : PROXIMITY_COPY.label}</Text>
  </Pressable>;
}
export function ProximityFeedback({ failure }: { failure: ProximityFailure }) {
  const message = PROXIMITY_COPY[failure];
  const { fontScale } = useWindowDimensions();
  useEffect(() => { AccessibilityInfo.announceForAccessibility(message); }, [message]);
  return <View pointerEvents="none" style={s.feedbackPosition}><View testID="proximity-feedback" style={s.feedback}>
    <Text testID="proximity-feedback-copy" style={[s.feedbackText, fontScale >= 1.4 && { lineHeight: 56 / 3 }]}>{message}</Text>
  </View></View>;
}
const s = StyleSheet.create({
  control: { width: 189, minHeight: 44, borderWidth: 1, borderColor: C.navy, backgroundColor: C.canvas,
    borderRadius: 22, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', gap: 8, alignItems: 'center' },
  large: { minHeight: 64, paddingVertical: 7 }, selected: { backgroundColor: C.mint, borderWidth: 1.5 }, pressed: { backgroundColor: C.lavender },
  marker: { width: 18, height: 18, flexShrink: 0, borderRadius: 9, borderWidth: 1, borderColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: C.navy }, label: { flex: 1, fontFamily: F.semiBold, fontSize: 12, lineHeight: 18, color: C.navy },
  feedbackPosition: { position: 'absolute', bottom: L.bottomNavigationHeight + 12, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 20, zIndex: 10 },
  feedback: { width: '100%', maxWidth: 353, minHeight: 56, backgroundColor: C.navy, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, zIndex: 10 },
  feedbackText: { fontFamily: F.medium, fontSize: 14, lineHeight: 20, color: C.surface },
});
