import { AccessibilityInfo, findNodeHandle, Platform, View } from 'react-native';

/** Web focus supports the render harness; native accessibility focus remains device-tested separately. */
export function focusDetailControl(node: View | null | undefined) {
  if (!node) return;
  if (Platform.OS === 'web') {
    (node as unknown as { focus?: () => void }).focus?.();
    return;
  }
  const handle = findNodeHandle(node);
  if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
}
