export type Mood = 'Enerjik' | 'Sakin' | 'Sosyal' | 'Meraklı';
export type Interest = 'Kahve' | 'Sanat' | 'Doğa' | 'Lezzet' | 'Etkinlik';

export type Place = {
  id: string;
  name: string;
  district: string;
  address: string;
  category: Interest;
  moods: Mood[];
  editorialScore: number;
  note: string;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  verifiedAt: string;
};
