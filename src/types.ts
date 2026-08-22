export type Mood = 'Enerjik' | 'Sakin' | 'Sosyal' | 'Meraklı';
export type Interest = 'Kahve' | 'Sanat' | 'Doğa' | 'Lezzet' | 'Etkinlik';
export type BudgetPreference = 'Ücretsiz' | '₺' | '₺₺' | '₺₺₺' | 'Fark etmez';
export type GroupSizePreference = 'Tek' | '2 kişi' | '3–4 kişi' | '5+';
export type DurationPreference = '30–60 dk' | '1–2 saat' | '3–4 saat' | 'Yarım gün' | 'Fark etmez';
export const KNOWN_MOODS: readonly Mood[] = ['Enerjik', 'Sakin', 'Sosyal', 'Meraklı'];
export const KNOWN_INTERESTS: readonly Interest[] = ['Kahve', 'Sanat', 'Doğa', 'Lezzet', 'Etkinlik'];
export const KNOWN_BUDGETS: readonly BudgetPreference[] = ['Ücretsiz', '₺', '₺₺', '₺₺₺', 'Fark etmez'];
export const KNOWN_GROUP_SIZES: readonly GroupSizePreference[] = ['Tek', '2 kişi', '3–4 kişi', '5+'];
export const KNOWN_DURATIONS: readonly DurationPreference[] = ['30–60 dk', '1–2 saat', '3–4 saat', 'Yarım gün', 'Fark etmez'];
export type PriceLevel = 0 | 1 | 2 | 3;
export type RecommendationKind = 'experience' | 'place' | 'event' | 'idea';
export type CityId = string;

export type GuideCategory = 'Tarih' | 'Müze' | 'Doğa' | 'Mahalle' | 'Şehir Rotası';

export type Guide = {
  id: string;
  kind: 'guide';
  cityId: CityId;
  title: string;
  summary: string;
  paragraphs: string[];
  readMinutes: number;
  routeStops?: string[];
  practicalNote?: string;
  category: GuideCategory;
  district: string;
  sourceLabel: string;
  sourceUrl: string;
  verifiedAt: string;
};

export type City = {
  id: CityId;
  name: string;
  countryCode: string;
  timezone: string;
  center: { latitude: number; longitude: number };
  status: 'active' | 'planned' | 'paused';
};

export type ExperienceType = 'micro-route' | 'culture' | 'outdoors' | 'food-and-walk' | 'active';
export type WeatherCondition = 'any' | 'dry' | 'indoor';
export type ReservationRequirement = 'not-required' | 'recommended' | 'required';

export type ExperiencePoint = {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type ExperienceSource = {
  label: string;
  url: string;
  verifiedAt: string;
};

type ExperienceBase = {
  id: string;
  kind: 'experience';
  title: string;
  description: string;
  note: string;
  points: ExperiencePoint[];
  sources: ExperienceSource[];
  experienceType: ExperienceType;
  cityId: CityId;
  category: Interest;
  moods: Mood[];
  primaryInterests: Interest[];
  secondaryInterests: Interest[];
  groupSizes: GroupSizePreference[];
  minDurationMinutes: number;
  maxDurationMinutes: number;
  priceLevel: PriceLevel;
  district: string;
  latitude: number;
  longitude: number;
  availabilityNote: string;
  weather: WeatherCondition;
  reservation: ReservationRequirement;
  lastVerifiedAt: string;
  confidenceScore: number;
  editorialScore: number;
};

export type Experience = ExperienceBase & (
  | { lifecycle: 'evergreen'; expiresAt?: never }
  | { lifecycle: 'seasonal' | 'live'; expiresAt: string }
);

export type Place = {
  id: string;
  cityId: CityId;
  name: string;
  district: string;
  address: string;
  category: Interest;
  moods: Mood[];
  interests: Interest[];
  priceLevel: PriceLevel;
  editorialScore: number;
  note: string;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  verifiedAt: string;
};

export type Idea = {
  id: string;
  kind: 'idea';
  title: string;
  category: Interest;
  moods: Mood[];
  interests: Interest[];
  priceLevel: PriceLevel;
  editorialScore: number;
  note: string;
  actionLabel: string;
  actionUrl: string;
  groupSizes: GroupSizePreference[];
};

export type Event = {
  id: string;
  kind: 'event';
  title: string;
  venue: string;
  cityId: CityId;
  /** Display label retained while cityId is the stable data key. */
  city: string;
  startsAt: string;
  endsAt?: string;
  category: Interest;
  moods: Mood[];
  interests: Interest[];
  priceLevel: PriceLevel;
  editorialScore: number;
  note: string;
  sourceUrl: string;
  sourceLabel: string;
  priceNote?: string;
  verifiedAt: string;
  groupSizes: GroupSizePreference[];
};
