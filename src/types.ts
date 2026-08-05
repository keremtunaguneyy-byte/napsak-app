export type Mood = 'Enerjik' | 'Sakin' | 'Sosyal' | 'Meraklı';
export type Interest = 'Kahve' | 'Sanat' | 'Doğa' | 'Lezzet' | 'Etkinlik';
export type BudgetPreference = 'Ücretsiz' | '₺' | '₺₺' | '₺₺₺' | 'Fark etmez';
export type GroupSizePreference = 'Tek' | '2 kişi' | '3–4 kişi' | '5+';
export const KNOWN_MOODS: readonly Mood[] = ['Enerjik', 'Sakin', 'Sosyal', 'Meraklı'];
export const KNOWN_INTERESTS: readonly Interest[] = ['Kahve', 'Sanat', 'Doğa', 'Lezzet', 'Etkinlik'];
export const KNOWN_BUDGETS: readonly BudgetPreference[] = ['Ücretsiz', '₺', '₺₺', '₺₺₺', 'Fark etmez'];
export const KNOWN_GROUP_SIZES: readonly GroupSizePreference[] = ['Tek', '2 kişi', '3–4 kişi', '5+'];
export type PriceLevel = 0 | 1 | 2 | 3;

export type Place = {
  id: string;
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
