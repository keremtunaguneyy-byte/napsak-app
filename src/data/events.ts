import { Event } from '../types';

/** Manually verified MVP catalogue. Dated listings are never inferred. */
export const events: Event[] = [
  {
    id: 'event-lp-odtu-visnelik-2026-08-11', kind: 'event', title: 'LP',
    venue: 'ODTÜ Mezunları Derneği Vişnelik Tesisi', city: 'Ankara',
    // Passo lists Ankara local time. The explicit offset is safe across device zones.
    startsAt: '2026-08-11T22:00:00+03:00', category: 'Etkinlik',
    moods: ['Enerjik', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 3, editorialScore: 5,
    note: 'LP’nin Ankara konseri. Güncel bilet durumu ve fiyat seçenekleri için etkinlik sayfasını kontrol et.',
    sourceUrl: 'https://www.passo.com.tr/tr/etkinlik/lp-ankara-odtu-visnelik-biletleri/12440319',
    sourceLabel: 'Passo', priceNote: 'Bilet kategorisine göre değişiyor',
    verifiedAt: '2026-08-06', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
];
