import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { Ankara101Warmup, createAnkara101ImageOpening } from '../../ankara101Media';
import { ANKARA101_MEDIA } from './ankara101Assets';

type Props = { mediaKey: string; style: StyleProp<ImageStyle>; enabled?: boolean; placeholderColor?: string; placeholder?: ReactNode; onReady?: () => void };
/** The View owns geometry. Explicit image dimensions override native asset defaults. */
export function Ankara101Image(props: Props) { return <DecodedImage key={props.mediaKey} {...props} />; }
function DecodedImage({ mediaKey, style, enabled = true, placeholderColor = '#E8ECF9', placeholder, onReady }: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const source = ANKARA101_MEDIA[mediaKey];
  useEffect(() => { if (!enabled) setReady(false); }, [enabled]);
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" testID={!source || failed ? 'ankara101-media-unavailable' : 'ankara101-media-slot'} style={[style, { overflow: 'hidden', backgroundColor: placeholderColor }]}>
    {!ready && <View testID="ankara101-image-placeholder" style={s.placeholder}>{placeholder}</View>}
    {source && enabled && !failed && <Image testID={ready ? 'ankara101-image-ready' : 'ankara101-image-loading'} accessible={false} source={source} resizeMode="cover" resizeMethod="resize" fadeDuration={0} style={[s.image, { opacity: ready ? 1 : 0 }]} onLoad={() => { setReady(true); onReady?.(); }} onError={() => { setReady(false); setFailed(true); }} />}
  </View>;
}
export function useAnkara101ImageOpening(origin: string) {
  const [request, setRequest] = useState<Ankara101Warmup>();
  const opening = useMemo(() => createAnkara101ImageOpening(setRequest), []);
  useEffect(() => () => opening.cancel(), [opening, origin]);
  return { request, opening };
}
export function Ankara101ImageWarmup({ request, onFinish }: { request: Ankara101Warmup; onFinish: (token: number, decoded: boolean) => void }) {
  const source = ANKARA101_MEDIA[request.mediaKey];
  useEffect(() => { if (!source) onFinish(request.token, false); }, [request.token, source]);
  return source ? <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[s.warmup, { width: request.width, height: request.height }]}>
    <Image testID="ankara101-media-warmup" source={source} accessible={false} resizeMode="cover" resizeMethod="resize" fadeDuration={0} style={s.image} onLoad={() => onFinish(request.token, true)} onError={() => onFinish(request.token, false)} />
  </View> : null;
}
const s = StyleSheet.create({
  image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  placeholder: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', opacity: .22 },
  warmup: { position: 'absolute', left: 0, top: 0, opacity: 0 },
});
