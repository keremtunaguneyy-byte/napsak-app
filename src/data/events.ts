import { Event } from '../types';

/**
 * Manually verified Ankara MVP catalogue.
 *
 * Dated listings are never inferred. The recommendation layer removes an item
 * after its scheduled start, while sourceUrl and verifiedAt make every listing
 * auditable when a venue or ticket provider changes its programme.
 */
const ankaraEvents: Omit<Event, 'cityId'>[] = [
  {
    id: 'event-ankara-open-wta-125-2026-09-21', kind: 'event', title: 'Türk Telekom Ankara Open WTA 125',
    venue: 'Topspin Bilkent Tenis Akademisi', city: 'Ankara', startsAt: '2026-09-21T10:00:00+03:00',
    category: 'Etkinlik', moods: ['Enerjik', 'Meraklı', 'Sosyal'], interests: ['Etkinlik'],
    priceLevel: 2, editorialScore: 4.7,
    note: 'Ankara Open WTA 125’in 21 Eylül günlük giriş seansı. Turnuva 21–27 Eylül boyunca sürüyor; güncel seans ve bilet durumu için satış sayfasını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/turk-telekom-ankara-open-wta-125', sourceLabel: 'Bubilet', priceNote: '21 Eylül günlük giriş 864 ₺',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-one-more-atilim-2026-09-23', kind: 'event', title: 'ONE MORE',
    venue: 'Atılım Sahne', city: 'Ankara', startsAt: '2026-09-23T21:00:00+03:00',
    category: 'Sanat', moods: ['Sosyal', 'Meraklı'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.7,
    note: 'Polisiye gerilim klişelerini absürt komedi ve seyirci katılımıyla yeniden kuran interaktif sahne oyunu. Güncel koltuk ve seans koşullarını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/one-more', sourceLabel: 'Bubilet', priceNote: '23 Eylül seansı 5.000 ₺',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-sami-yusuf-congresium-2026-09-24', kind: 'event', title: 'Sami Yusuf',
    venue: 'Congresium Ankara', city: 'Ankara', startsAt: '2026-09-24T21:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.8,
    note: 'Sami Yusuf’un dünya müziği geleneklerini çağdaş düzenlemeler ve orkestra eşliğinde sunduğu Ankara konseri. Güncel kategori ve bilet durumunu kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/sami-yusuf', sourceLabel: 'Bubilet', priceNote: '2.750 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-tca-burger-fries-workshop-2026-09-24', kind: 'event', title: 'TCA | Burger & Fries Workshop',
    venue: 'TCA - Turkish Culinary Academy - Ankara', city: 'Ankara', startsAt: '2026-09-24T19:00:00+03:00', endsAt: '2026-09-24T22:00:00+03:00',
    category: 'Lezzet', moods: ['Meraklı', 'Sosyal'], interests: ['Lezzet', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.5,
    note: 'Burger ekmeği, köfte, patates ve sos tekniklerine odaklanan yaklaşık üç saatlik uygulamalı mutfak atölyesi. Malzemeler ücrete dâhil; güncel kontenjanı kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/tca-burger-fries-workshop', sourceLabel: 'Bubilet', priceNote: '2.100 ₺',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi'],
  },
  {
    id: 'event-trivia-night-alti-ustu-2026-09-26', kind: 'event', title: 'Trivia Night - Bilgi Yarışması',
    venue: 'Altı Üstü Bar', city: 'Ankara', startsAt: '2026-09-26T19:00:00+03:00',
    category: 'Etkinlik', moods: ['Sosyal', 'Meraklı'], interests: ['Etkinlik'],
    priceLevel: 1, editorialScore: 4.4,
    note: 'Genel kültür, tarih, bilim, dizi-film ve güncel kültür başlıklarını takım rekabetiyle birleştiren bilgi yarışması. Bireysel katılım da mümkün.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/trivia-night-', sourceLabel: 'Bubilet', priceNote: '250 ₺',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-candles-echoes-meb-sura-2026-09-26', kind: 'event', title: 'Candles and Echoes - Ankara',
    venue: 'MEB Şura Salonu', city: 'Ankara', startsAt: '2026-09-26T21:00:00+03:00', endsAt: '2026-09-26T22:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 2, editorialScore: 4.7,
    note: 'Yaylılar ve üflemeli çalgıyla klasik müzik, tango, film müzikleri ve Türk müziğinden seçkiler sunan yaklaşık 60 dakikalık enstrümantal dinleti.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/candles-and-echoes-ankara', sourceLabel: 'Bubilet', priceNote: '952 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-happy-pigs-cayyolu-2026-09-27', kind: 'event', title: 'Happy Pig\'s Öğreniyor',
    venue: 'Ankara Çayyolu Sahne', city: 'Ankara', startsAt: '2026-09-27T17:00:00+03:00',
    category: 'Etkinlik', moods: ['Enerjik', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 2, editorialScore: 4.4,
    note: 'Trafik kuralları, sayılar, mevsimler ve renkleri oyunlarla ele alan, çocuk katılımlı aile tiyatrosu. Güncel yaş ve giriş kurallarını bilet sayfasından kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/happy-pigs-ogreniyor', sourceLabel: 'Bubilet', priceNote: '672 ₺',
    verifiedAt: '2026-09-16', groupSizes: ['2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-ankara-cocktail-festival-2026-09-27', kind: 'event', title: 'Ankara Cocktail Festival',
    venue: 'Club Mirador', city: 'Ankara', startsAt: '2026-09-27T14:00:00+03:00',
    category: 'Lezzet', moods: ['Enerjik', 'Sosyal', 'Meraklı'], interests: ['Lezzet', 'Etkinlik'],
    priceLevel: 2, editorialScore: 4.5,
    note: 'Miksoloji, yerel lezzetler ve sahne performanslarını bir araya getiren festivalin 27 Eylül günlük girişi. Yaş, kimlik ve erken giriş koşullarını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/ankara-cocktail-festival', sourceLabel: 'Bubilet', priceNote: '650 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-ajda-pekkan-oran-2026-09-30', kind: 'event', title: 'Ajda Pekkan',
    venue: 'Oran Açıkhava Sahnesi', city: 'Ankara', startsAt: '2026-09-30T21:00:00+03:00',
    category: 'Sanat', moods: ['Enerjik', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.8,
    note: 'Ajda Pekkan’ın Oran Açıkhava Sahnesi’ndeki Ankara konseri. Güncel kategori, koltuk ve bilet müsaitliğini satış sayfasından kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/ajda-pekkan', sourceLabel: 'Bubilet', priceNote: '3.158,40 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-bubble-show-cukurambar-2026-10-03', kind: 'event', title: 'Bubble Show',
    venue: 'Çukurambar Kültür Sanat Merkezi', city: 'Ankara', startsAt: '2026-10-03T14:00:00+03:00', endsAt: '2026-10-03T14:45:00+03:00',
    category: 'Etkinlik', moods: ['Enerjik', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 2, editorialScore: 4.5,
    note: 'Dev baloncuklar, ışık efektleri ve interaktif oyunlarla ilerleyen 45 dakikalık aile gösterisi. İki yaş ve üzeri her izleyici için ayrı bilet gerekiyor.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/bubble-show', sourceLabel: 'Bubilet', priceNote: '694 ₺',
    verifiedAt: '2026-09-16', groupSizes: ['2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-tastydays-visnelik-2026-10-11', kind: 'event', title: 'TastyDays Ankara Gastronomi Festival',
    venue: 'ODTÜ MD Vişnelik', city: 'Ankara', startsAt: '2026-10-11T12:00:00+03:00',
    category: 'Lezzet', moods: ['Enerjik', 'Sosyal', 'Meraklı'], interests: ['Lezzet', 'Etkinlik'],
    priceLevel: 2, editorialScore: 4.5,
    note: 'Gastronomi, müzik, workshop ve deneyim alanlarını buluşturan festivalin 11 Ekim günlük girişi. Ayrıntılı program henüz açıklanmadığı için güncel akışı kaynaktan kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/tastydays', sourceLabel: 'Bubilet', priceNote: '11 Ekim günlük giriş 650 ₺',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-amadeus-congresium-2026-10-16', kind: 'event', title: 'AMADEUS - Veda Turnesi',
    venue: 'Congresium Ankara', city: 'Ankara', startsAt: '2026-10-16T20:30:00+03:00', endsAt: '2026-10-16T23:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.9,
    note: 'Peter Shaffer’ın Mozart ile Salieri arasındaki ilişkiyi anlatan, ara dâhil 150 dakikalık tiyatro oyunu. Etkinlik 12 yaş ve üzeri izleyiciler için.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/amadeus', sourceLabel: 'Bubilet', priceNote: '1.695 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-16', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
];

export const events: Event[] = ankaraEvents.map(event => ({ ...event, cityId: 'ankara' }));
