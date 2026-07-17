# N’apsak?

N’apsak?, “Bugün ne yapsam?” kararsızlığını 60 saniyeden kısa sürede çözmeyi hedefleyen, Ankara odaklı mobil aktivite ve mekân öneri uygulamasıdır.

## Mevcut MVP akışı

1. Kullanıcı ruh hâlini seçer.
2. İlgilendiği kategorileri işaretler.
3. Uygulama tercih, puan ve mesafeye göre beş öneri sıralar.
4. Kullanıcı öneriyi kaydedebilir veya “Bana göre değil” diyerek yenisini alabilir.

İlk geliştirme dilimi kontrollü örnek veriyle çalışır. Firebase ve Google Places entegrasyonu aynı öneri veri sözleşmesine sonradan bağlanacaktır.

## Teknoloji

- Expo SDK 57
- React Native
- TypeScript
- Planlanan backend: Firebase Authentication, Firestore ve Cloud Functions
- Planlanan mekân kaynağı: Google Places API (New)

## Çalıştırma

```bash
npm install
npm start
```

Ardından Expo Go ile terminaldeki QR kodu okutun.

## Durum

- [x] Ruh hâli seçimi
- [x] İlgi alanı seçimi
- [x] Açıklanabilir öneri sıralaması
- [x] Kaydet ve reddet etkileşimleri
- [x] Haritada açma
- [x] Farklı öneriler üretme
- [ ] Cihazda kalıcı kayıt
- [ ] Konum izni
- [ ] Firebase bağlantısı
- [ ] Güvenli Places geçidi

## Lisans

Bu proje portföy ve ürün geliştirme amacıyla sürdürülmektedir.
