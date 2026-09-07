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
    id: 'event-sahane-oyun-cermodern-2026-09-10', kind: 'event', title: 'Fransız Yazlık Sineması: Şahane Oyun',
    venue: 'CerModern', city: 'Ankara', startsAt: '2026-09-10T19:45:00+03:00', endsAt: '2026-09-10T21:47:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 1, editorialScore: 4.7,
    note: 'Restore edilmiş Fransız komedisi, açık havada Türkçe altyazılı gösterilecek. Hava koşulları ve son bilet durumu için CerModern sayfasını kontrol et.',
    sourceUrl: 'https://www.cermodern.org/fransiz-yazlik-sinemasi-sahane-oyun', sourceLabel: 'CerModern', priceNote: '300 ₺',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-hayko-cepkin-visnelik-2026-09-11', kind: 'event', title: 'Hayko Cepkin: Electric',
    venue: 'ODTÜ MD Vişnelik', city: 'Ankara', startsAt: '2026-09-11T21:00:00+03:00',
    category: 'Etkinlik', moods: ['Enerjik', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 3, editorialScore: 4.9,
    note: 'Hayko Cepkin’in yüksek tempolu Electric turnesinin Ankara açılışı. Ayakta düzen ve güncel bilet koşulları için etkinlik sayfasını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/-hayko-cepkin-', sourceLabel: 'Bubilet', priceNote: '2.450 ₺; dönemsel indirim değişebilir',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-ters-yuz-2-cermodern-2026-09-11', kind: 'event', title: 'Açık Hava Film Gösterimi: Ters Yüz 2',
    venue: 'CerModern', city: 'Ankara', startsAt: '2026-09-11T20:00:00+03:00', endsAt: '2026-09-11T21:40:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 1, editorialScore: 4.4,
    note: 'Ters Yüz 2’nin Türkçe dublajlı açık hava gösterimi. Hava koşulları, kontenjan ve son bilet durumu için CerModern sayfasını kontrol et.',
    sourceUrl: 'https://www.cermodern.org/acik-hava-film-gosterimi-ters-yuz-2', sourceLabel: 'CerModern', priceNote: '300 ₺',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-erol-evgin-oran-2026-09-11', kind: 'event', title: 'Erol Evgin',
    venue: 'Oran Açıkhava Sahnesi', city: 'Ankara', startsAt: '2026-09-11T21:00:00+03:00',
    category: 'Etkinlik', moods: ['Sakin', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 3, editorialScore: 4.6,
    note: 'Erol Evgin’in koltuk seçmeli açık hava konseri. Kampanya, kategori ve güncel müsaitlik için bilet sayfasını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/erol-evgin-', sourceLabel: 'Bubilet', priceNote: 'Kategori ve kampanyaya göre değişiyor',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-pinhani-visnelik-2026-09-12', kind: 'event', title: 'Pinhani',
    venue: 'ODTÜ MD Vişnelik', city: 'Ankara', startsAt: '2026-09-12T21:00:00+03:00',
    category: 'Etkinlik', moods: ['Sakin', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 2, editorialScore: 4.6,
    note: 'Pinhani’nin Vişnelik Çim Amfi’de ayakta düzenlenen açık hava konseri. Güncel giriş koşulları için bilet sayfasını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/pinhani-', sourceLabel: 'Bubilet', priceNote: '800 ₺',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-sertab-erener-oran-2026-09-12', kind: 'event', title: 'Sertab Erener',
    venue: 'Oran Açıkhava Sahnesi', city: 'Ankara', startsAt: '2026-09-12T20:30:00+03:00',
    category: 'Etkinlik', moods: ['Enerjik', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 3, editorialScore: 4.9,
    note: 'Sertab Erener’in koltuk seçmeli açık hava konserinin ilk Ankara seansı. Kategori ve müsaitlik için bilet sayfasını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/sertab-erener-konseri-', sourceLabel: 'Bubilet', priceNote: '2.350 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-dogu-demirkol-yenimahalle-2026-09-12', kind: 'event', title: 'Doğu Demirkol',
    venue: 'Nazım Hikmet Kültür Merkezi – Genco Erkal Sahnesi', city: 'Ankara', startsAt: '2026-09-12T20:30:00+03:00',
    category: 'Etkinlik', moods: ['Sosyal', 'Meraklı'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 3, editorialScore: 4.7,
    note: 'Doğu Demirkol’un gündelik hayat ve yerel absürtlüklerden beslenen tek kişilik stand-up gösterisi. Güncel koltuklar için bilet sayfasını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/dogu-demirkol', sourceLabel: 'Bubilet', priceNote: '1.500 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi'],
  },
  {
    id: 'event-sertab-erener-oran-2026-09-13', kind: 'event', title: 'Sertab Erener',
    venue: 'Oran Açıkhava Sahnesi', city: 'Ankara', startsAt: '2026-09-13T20:30:00+03:00',
    category: 'Etkinlik', moods: ['Enerjik', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 3, editorialScore: 4.9,
    note: 'Sertab Erener’in koltuk seçmeli açık hava konserinin ikinci Ankara seansı. Kategori ve müsaitlik için bilet sayfasını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/sertab-erener-konseri-', sourceLabel: 'Bubilet', priceNote: '2.850 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-sakali-akustik-atakule-2026-09-16', kind: 'event', title: 'Şakalı Akustik: Harun Tekin & Koray Candemir',
    venue: 'Atakule Çim Teras', city: 'Ankara', startsAt: '2026-09-16T19:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Sosyal', 'Meraklı'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.8,
    note: 'Harun Tekin ve Koray Candemir’in akustik şarkıları sohbet ve mizahla birleştirdiği açık hava performansı. Güncel bilet koşullarını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/bir-yaz-aksami-sakali-akustik-harun-tekin-koray-candemir', sourceLabel: 'Bubilet', priceNote: '2.950 ₺',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-baba-meb-sura-2026-09-18', kind: 'event', title: 'Baba',
    venue: 'MEB Şura Salonu', city: 'Ankara', startsAt: '2026-09-18T20:30:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.9,
    note: 'Haluk Bilginer’in rol aldığı, hafıza ve baba-kız bağına odaklanan tek perdelik tiyatro oyunu. Etkinlik 12 yaş ve üzeri izleyiciler için.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/baba', sourceLabel: 'Bubilet', priceNote: '2.750 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi'],
  },
  {
    id: 'event-7-kocali-hurmuz-oran-2026-09-19', kind: 'event', title: '7 Kocalı Hürmüz Müzikali',
    venue: 'Oran Açıkhava Sahnesi', city: 'Ankara', startsAt: '2026-09-19T21:00:00+03:00',
    category: 'Sanat', moods: ['Enerjik', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.7,
    note: 'Sadık Şendil’in eserinin Müjdat Gezen yorumuyla sahnelendiği müzikal. Güncel kadro, koltuk ve bilet koşulları için etkinlik sayfasını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/7-kocali-hurmuz-', sourceLabel: 'Bubilet', priceNote: '1.350 ₺’den başlayan seçenekler',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-dktt-ankara-echoes-visnelik-2026-09-20', kind: 'event', title: 'Dolu Kadehi Ters Tut & Ankara Echoes',
    venue: 'ODTÜ MD Vişnelik', city: 'Ankara', startsAt: '2026-09-20T17:00:00+03:00',
    category: 'Etkinlik', moods: ['Enerjik', 'Sosyal'], interests: ['Etkinlik', 'Sanat'],
    priceLevel: 2, editorialScore: 4.7,
    note: 'Dolu Kadehi Ters Tut ve Ankara Echoes’ın Vişnelik Çim Amfi’deki numarasız açık hava konseri. Güncel giriş koşullarını kontrol et.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/kulup-visnelikte-', sourceLabel: 'Bubilet', priceNote: '830 ₺',
    verifiedAt: '2026-09-07', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
];

export const events: Event[] = ankaraEvents.map(event => ({ ...event, cityId: 'ankara' }));
