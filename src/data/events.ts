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
    id: 'event-amadeus-congresium-2026-10-16', kind: 'event', title: 'AMADEUS - Veda Turnesi',
    venue: 'Congresium Ankara', city: 'Ankara', startsAt: '2026-10-16T20:30:00+03:00', endsAt: '2026-10-16T23:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.9,
    note: 'Peter Shaffer’ın Mozart ile Salieri arasındaki ilişkiyi anlatan, ara dâhil 150 dakikalık tiyatro oyunu. Etkinlik 12 yaş ve üzeri izleyiciler için.',
    sourceUrl: 'https://www.bubilet.com.tr/ankara/etkinlik/amadeus', sourceLabel: 'Bubilet', priceNote: '2.195 ₺’den başlayan seçenekler',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-cso-iki-keman-bir-miras-2026-10-16', kind: 'event', title: 'Cumhurbaşkanlığı Senfoni Orkestrası — İki Keman Bir Miras',
    venue: 'CSO Ada Ankara, Ziraat Bankası Ana Salon', city: 'Ankara', startsAt: '2026-10-16T20:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 1, editorialScore: 4.5,
    note: 'Suna Kan anısına Gürer Aykal yönetiminde, Pelin Halkacı Akın ve Özgecan Günöz solistliğinde konser. Altı yaş ve altı alınmıyor. Güncel koltuk ve bilet durumunu kaynaktan kontrol et.',
    sourceUrl: 'https://biletinial.com/tr-tr/muzik/cumhurbaskanligi-senfoni-orkestrasi-iki-keman-bir-miras-cso', sourceLabel: 'Biletinial', priceNote: 'Tam bilet 150 ₺’den; öğrenci 75 ₺’den',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-sempre-mozart-ankara-dob-2026-10-23', kind: 'event', title: 'Sempre Mozart — Ankara DOB',
    venue: 'CSO Ada Ankara, Bankkart Mavi Salon', city: 'Ankara', startsAt: '2026-10-23T20:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 1, editorialScore: 4.5,
    note: 'Mozart eserlerinden seçkiler; soprano, bariton ve piyano eşliğinde konser. Yedi yaş altı izleyicilerin getirilmemesi isteniyor. Güncel koltuk ve bilet durumunu kaynaktan kontrol et.',
    sourceUrl: 'https://biletinial.com/tr-tr/opera-bale/sempre-mozart-ankara-dob', sourceLabel: 'Biletinial', priceNote: '2. kategori 170 ₺; 1. kategori 250 ₺',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-magic-bubbles-csoada-2026-10-24', kind: 'event', title: 'Magic Bubbles',
    venue: 'CSO Ada Ankara, Fuaye', city: 'Ankara', startsAt: '2026-10-24T17:00:00+03:00',
    category: 'Etkinlik', moods: ['Enerjik', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 1, editorialScore: 4.5,
    note: 'Baloncukların renklerle buluştuğu aile gösterisi. Her katılımcı için bilet gerekiyor. Güncel giriş kuralları ve bilet durumunu kaynaktan kontrol et.',
    sourceUrl: 'https://biletinial.com/tr-tr/muzik/magic-bubbles-csoada', sourceLabel: 'Biletinial', priceNote: 'Tam bilet 480 ₺',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-falda-carmen-xl-ataturk-sanat-2026-10-31', kind: 'event', title: 'Falda CARMEN Çıktı XL Müzikali',
    venue: 'Çankaya Belediyesi Atatürk Sanat Merkezi', city: 'Ankara', startsAt: '2026-10-31T20:30:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 3, editorialScore: 4.5,
    note: 'Carmen hikâyesini flamenko, opera ve tiyatroyla yeniden yorumlayan müzikal. On altı yaş ve üzeri izleyiciler için. Güncel koltuk ve bilet durumunu kaynaktan kontrol et.',
    sourceUrl: 'https://www.biletix.com/etkinlik/5FFEA/TURKIYE/tr/falda-carmen-cikti-xl-muzikali-31-10-2026-ankara', sourceLabel: 'Biletix', priceNote: '1.350 ₺’den',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-bir-aile-provasi-ataturk-sanat-2026-11-01', kind: 'event', title: 'Bir Aile Provası: Yaşayın Gitsin',
    venue: 'Çankaya Belediyesi Atatürk Sanat Merkezi, Kırmızı Salon', city: 'Ankara', startsAt: '2026-11-01T20:30:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 2, editorialScore: 4.5,
    note: 'Figen’in aile ilişkileri ve kendini arayışı üzerine BKM yapımı tiyatro oyunu. On üç yaş sınırı bulunuyor. Kaynaklarda süre farklı verildiği için bitiş saati belirtilmedi; güncel bilgiyi bilet sayfasından kontrol et.',
    sourceUrl: 'https://www.biletix.com/etkinlik/55AP6/TURKIYE/tr', sourceLabel: 'Biletix', priceNote: '550 ₺’den',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-ankara-kadin-orkestrasi-csoada-2026-11-02', kind: 'event', title: 'Ankara Kadın Orkestrası Konseri',
    venue: 'CSO Ada Ankara, Ziraat Bankası Ana Salon', city: 'Ankara', startsAt: '2026-11-02T19:30:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 2, editorialScore: 4.5,
    note: 'Eve Dönüş temalı konser yalnız kadın izleyicilere yönelik düzenleniyor. Altı yaş ve altı alınmıyor. Güncel giriş koşulları ve bilet durumunu kaynaktan kontrol et.',
    sourceUrl: 'https://biletinial.com/tr-tr/muzik/ankara-kadin-orkestrasi-konseri-csoada', sourceLabel: 'Biletinial', priceNote: '5. kategori 650 ₺’den',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-satonun-altinda-ataturk-sanat-2026-11-07', kind: 'event', title: 'Şatonun Altında',
    venue: 'Çankaya Belediyesi Atatürk Sanat Merkezi, Mavi Salon', city: 'Ankara', startsAt: '2026-11-07T20:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 2, editorialScore: 4.5,
    note: 'Macbeth’in hikâyesini iki çamaşırcı kadının gözünden anlatan fiziksel tiyatro oyunu. On altı yaş ve üzeri izleyiciler için. Kaynaklardaki süre bilgisi farklı olduğundan bitiş saati belirtilmedi; güncel bilet durumunu kontrol et.',
    sourceUrl: 'https://dt.biletinial.com/tr-tr/tiyatro/satonun-altinda-yy', sourceLabel: 'Biletinial', priceNote: '877 ₺’den',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
  {
    id: 'event-ataturke-saygi-csoada-tarihi-2026-11-10', kind: 'event', title: 'Gazi Mustafa Kemal Atatürk’ü Anıyoruz — Atatürk’e Saygı Konseri',
    venue: 'CSO Ada Ankara, Tarihi Salon', city: 'Ankara', startsAt: '2026-11-10T20:00:00+03:00',
    category: 'Sanat', moods: ['Sakin', 'Meraklı', 'Sosyal'], interests: ['Sanat', 'Etkinlik'],
    priceLevel: 1, editorialScore: 4.5,
    note: 'Ankara Devlet Klasik Türk Müziği Korosu, Suat Kılıç yönetiminde Atatürk’ün sevdiği eserleri seslendiriyor. Altı yaş ve altı alınmıyor. Güncel koltuk ve bilet durumunu kaynaktan kontrol et.',
    sourceUrl: 'https://biletinial.com/tr-tr/muzik/gazi-mustafa-kemal-ataturku-aniyoruz-ataturke-saygi-konseri-csoada', sourceLabel: 'Biletinial', priceNote: 'Tam bilet 260 ₺’den; öğrenci 130 ₺’den',
    verifiedAt: '2026-10-12', groupSizes: ['Tek', '2 kişi', '3–4 kişi', '5+'],
  },
];

export const events: Event[] = ankaraEvents.map(event => ({ ...event, cityId: 'ankara' }));
