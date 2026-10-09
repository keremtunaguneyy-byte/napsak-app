import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, ViewProps } from 'react-native';
import { DETAIL_UNDO_EXIT_MS, UndoNotice } from '../../detailFlow';

/** Presentation only: undo eligibility and dismissal persistence belong to the controller. */
export function UndoNoticeTransition({ notice, children, style, ...props }: ViewProps & { notice: UndoNotice }) {
  const progress = useRef(new Animated.Value(0)).current;
  // Be conservative until the asynchronous native preference resolves.
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    if (!notice.exiting) return;
    if (reducedMotion) { progress.setValue(1); return; }
    const animation = Animated.timing(progress, { toValue: 1, duration: DETAIL_UNDO_EXIT_MS, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [notice.sequence, notice.exiting, reducedMotion, progress]);
  useEffect(() => () => progress.stopAnimation(), [progress]);
  if (notice.exiting && reducedMotion) return null;
  return <Animated.View {...props} pointerEvents={notice.exiting ? 'none' : 'auto'} style={[style, {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) }],
  }]}>{children}</Animated.View>;
}
