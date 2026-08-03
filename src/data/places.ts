import { Place } from '../types';

/**
 * MVP catalog curated from venue/operator pages. `verifiedAt` makes freshness
 * explicit so this file can later be replaced by a remote repository.
 */
export const places: Place[] = [
  { id: 'cer-modern', name: 'CerModern', district: 'Altındağ', address: 'Altınsoy Cd. No:3', category: 'Sanat', moods: ['Meraklı', 'Sakin'], editorialScore: 4.6, note: 'Sergi gez, avluda soluklan.', latitude: 39.9313, longitude: 32.8500, sourceUrl: 'https://www.cermodern.org/', verifiedAt: '2026-08-03' },
  { id: 'segmenler-parki', name: 'Seğmenler Parkı', district: 'Çankaya', address: 'Çankaya Cd.', category: 'Doğa', moods: ['Sakin', 'Sosyal', 'Enerjik'], editorialScore: 4.7, note: 'Şehir içinde yürüyüş ve yeşil mola.', latitude: 39.8985, longitude: 32.8633, sourceUrl: 'https://www.ankara.bel.tr/', verifiedAt: '2026-08-03' },
  { id: 'erimtan', name: 'Erimtan Arkeoloji ve Sanat Müzesi', district: 'Altındağ', address: 'Gözcü Sk. No:10', category: 'Sanat', moods: ['Meraklı', 'Sakin'], editorialScore: 4.7, note: 'Ankara Kalesi rotasına kültür molası ekle.', latitude: 39.9382, longitude: 32.8624, sourceUrl: 'https://www.erimtanmuseum.org/', verifiedAt: '2026-08-03' },
  { id: 'kugulu-park', name: 'Kuğulu Park', district: 'Çankaya', address: 'Tunalı Hilmi Cd.', category: 'Doğa', moods: ['Sakin', 'Sosyal'], editorialScore: 4.5, note: 'Tunalı rotasının ortasında kısa bir park molası.', latitude: 39.9027, longitude: 32.8608, sourceUrl: 'https://www.ankara.bel.tr/', verifiedAt: '2026-08-03' },
  { id: 'cso-ada', name: 'CSO Ada Ankara', district: 'Altındağ', address: 'Talatpaşa Blv. No:38', category: 'Etkinlik', moods: ['Sosyal', 'Meraklı'], editorialScore: 4.8, note: 'Güncel programdan bir konser seç.', latitude: 39.9368, longitude: 32.8439, sourceUrl: 'https://csoadaankara.ktb.gov.tr/', verifiedAt: '2026-08-03' },
  { id: 'atakule', name: 'Atakule', district: 'Çankaya', address: 'Çankaya Cd. No:1', category: 'Lezzet', moods: ['Sosyal', 'Meraklı'], editorialScore: 4.4, note: 'Şehir manzarasını yemek molasıyla birleştir.', latitude: 39.8868, longitude: 32.8553, sourceUrl: 'https://atakule.com.tr/', verifiedAt: '2026-08-03' },
  { id: 'anadolu-medeniyetleri', name: 'Anadolu Medeniyetleri Müzesi', district: 'Altındağ', address: 'Gözcü Sk. No:2', category: 'Sanat', moods: ['Meraklı', 'Sakin'], editorialScore: 4.8, note: 'Anadolu tarihini kronolojik bir rotada keşfet.', latitude: 39.9385, longitude: 32.8619, sourceUrl: 'https://muze.gov.tr/muze-detay?SectionId=ANM01&DistId=MRK', verifiedAt: '2026-08-03' },
  { id: 'genclik-parki', name: 'Gençlik Parkı', district: 'Altındağ', address: 'Doğanbey Mahallesi', category: 'Doğa', moods: ['Enerjik', 'Sosyal'], editorialScore: 4.4, note: 'Merkezde göl çevresinde yürüyüş yap.', latitude: 39.9361, longitude: 32.8516, sourceUrl: 'https://www.ankara.bel.tr/', verifiedAt: '2026-08-03' },
  { id: 'ankarali-vakif', name: 'Ankara Vakıf Eserleri Müzesi', district: 'Altındağ', address: 'Atatürk Blv. No:23', category: 'Sanat', moods: ['Meraklı', 'Sakin'], editorialScore: 4.6, note: 'Vakıf koleksiyonlarında sakin bir keşfe çık.', latitude: 39.9364, longitude: 32.8543, sourceUrl: 'https://www.vgm.gov.tr/', verifiedAt: '2026-08-03' },
  { id: 'botanik-parki', name: 'Botanik Parkı', district: 'Çankaya', address: 'Çankaya Cd.', category: 'Doğa', moods: ['Sakin', 'Enerjik'], editorialScore: 4.5, note: 'Atakule eteklerinde yeşil bir yürüyüş yap.', latitude: 39.8848, longitude: 32.8551, sourceUrl: 'https://www.ankara.bel.tr/', verifiedAt: '2026-08-03' },
];
