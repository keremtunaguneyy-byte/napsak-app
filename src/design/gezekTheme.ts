export const GEZEK_COLORS = {
  canvas: '#FAF9F5',
  navy: '#102452',
  cobalt: '#3F65FC',
  yellow: '#FFC21A',
  mint: '#DFF3E8',
  lavender: '#ECE9FF',
  coral: '#FFE2D9',
  mutedText: '#6F7890',
  border: '#E2E8F0',
  surface: '#FFFFFF',
  blueWhisper: '#EEF4FF',
  blueBorder: '#CAD9FF',
  venue: '#1E7651',
  event: '#8A6B00',
  danger: '#C94B4B',
  success: '#2F9C69',
  locationNotice: '#FFEFE8',
} as const;

export const GEZEK_SPACING = {
  section: 12,
} as const;

export const GEZEK_LAYOUT = {
  screenHorizontalInset: 20,
  minimumTouchTarget: 44,
  homeTopInset: 22,
  mainImageHeight: 100,
  alternativeImageSize: 112,
  selectorHeight: 74,
  bottomNavigationHeight: 74,
} as const;

export const GEZEK_RADII = {
  surface: 22,
  surfaceLarge: 24,
  image: 16,
  preference: 18,
  full: 999,
} as const;

export const GEZEK_TYPE = {
  home: { fontSize: 25, lineHeight: 30, letterSpacing: -0.45 },
  eyebrow: { fontSize: 10, lineHeight: 14, letterSpacing: 1.1 },
  section: { fontSize: 17, lineHeight: 22, letterSpacing: -0.15 },
  card: { fontSize: 16, lineHeight: 21, letterSpacing: -0.12 },
  body: { fontSize: 11, lineHeight: 16 },
  label: { fontSize: 11, lineHeight: 15 },
  small: { fontSize: 9, lineHeight: 13, letterSpacing: 0.1 },
  button: { fontSize: 13, lineHeight: 18 },
  navigation: { fontSize: 9, lineHeight: 12, letterSpacing: 0.05 },
} as const;

export const GEZEK_SURFACE_SHADOW = {
  shadowColor: GEZEK_COLORS.navy,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 7,
  elevation: 3,
} as const;

export const GEZEK_FONT_FAMILIES = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;
