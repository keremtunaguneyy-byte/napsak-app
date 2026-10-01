import Svg, { Circle, G, Path, Polygon, Rect, SvgProps } from 'react-native-svg';

export function GezekHomeHeaderArtwork(props: SvgProps) {
  return (
    <Svg width={430} height={440} viewBox="0 0 430 440" fill="none" accessible={false} {...props}>
      <Path d="M-50 -30 L290 -30 C240 60 215 130 145 185 C75 235 10 260 -50 265 Z" fill="#ECE9FF" opacity={0.95} />
      <Path d="M190 -30 L480 -30 L480 320 C420 295 375 235 340 165 C305 95 255 25 190 -30 Z" fill="#DFF3E8" opacity={0.92} />
      <Path d="M-50 110 C30 120 120 170 140 240 C65 255 -15 280 -50 285 Z" fill="#ECE9FF" opacity={0.45} />
      <Path d="M480 15 C395 20 330 85 352 175 C368 238 420 268 480 280" opacity={0.98} stroke="#3F65FC" strokeLinecap="round" strokeWidth={26} />
      <Circle cx={342} cy={116} fill="#FFC21A" r={9} />
      <Circle cx={356} cy={188} fill="#1D835B" opacity={0.85} r={4} />
    </Svg>
  );
}

export function GezekArchMark(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" accessible={false} {...props}>
      <Path d="M6 21V11a6 6 0 0 1 12 0v10" stroke="#1E7651" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} />
      <Path d="M4 21h16" stroke="#1E7651" strokeLinecap="round" strokeWidth={2.2} />
      <Circle cx={12} cy={13.5} fill="#FFC21A" r={1.8} />
    </Svg>
  );
}

export function GezekPlacesArtwork(props: SvgProps) {
  return (
    <Svg width={160} height={126} viewBox="0 0 160 126" fill="none" accessible={false} {...props}>
      <Circle cx={116} cy={63} fill="#FDEFC8" r={52} />
      <Path d="M88 126 V52 C88 32 104 16 124 16 C144 16 160 32 160 52 V126 Z" fill="#3F65FC" />
      <Path d="M104 126 V62 C104 50 113 41 124 41 C135 41 144 50 144 62 V126 Z" fill="#FAF9F5" />
      <Circle cx={124} cy={80} fill="#FFC21A" r={4.5} />
    </Svg>
  );
}

export function GezekEventsArtwork(props: SvgProps) {
  return (
    <Svg width={110} height={130} viewBox="0 0 110 130" fill="none" accessible={false} {...props}>
      <Circle cx={76} cy={56} fill="#FDEFC8" r={42} />
      <G transform="rotate(-8 62 66)">
        <Rect fill="#DDD6FE" height={30} rx={5} width={46} x={28} y={40} />
        <Circle cx={28} cy={55} fill="#FBE7DE" r={4} />
        <Circle cx={74} cy={55} fill="#FBE7DE" r={4} />
      </G>
      <G transform="rotate(6 68 56)">
        <Rect fill="#3F65FC" height={34} rx={5} width={50} x={40} y={30} />
        <Circle cx={40} cy={47} fill="#FBE7DE" r={4.5} />
        <Circle cx={90} cy={47} fill="#FBE7DE" r={4.5} />
      </G>
      <Circle cx={64} cy={58} fill="#FFC21A" r={4} />
    </Svg>
  );
}

export function GezekIdeasArtwork(props: SvgProps) {
  return (
    <Svg width={110} height={130} viewBox="0 0 110 130" fill="none" accessible={false} {...props}>
      <Circle cx={76} cy={52} fill="#FDF3D6" r={40} />
      <Polygon fill="#3F65FC" points="44,48 76,26 94,44 62,68" />
      <Polygon fill="#2A4FD8" points="62,68 94,44 88,74 54,82" />
      <Circle cx={62} cy={68} fill="#FFC21A" r={4.5} />
      <Path d="M84 28 Q84 34 89 34 Q84 34 84 40 Q84 34 79 34 Q84 34 84 28 Z" fill="#FFC21A" />
    </Svg>
  );
}
