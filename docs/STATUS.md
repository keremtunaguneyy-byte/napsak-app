# N’apsak — Durum ve sıradaki iş

Kontrol tarihi: 7 Eylül 2026. Bu bir yayına hazır olma raporu değildir.

## Son güncelleme — #19 ve #21 main'de; etkinlik kataloğu yenileniyor

- #21 telefonda doğrulandı ve squash merge ile main'e alındı: `dcde744`. Mekân detayı, ilgili uygun planlar, plan detayı, kaydet/gizle/geri al main'dedir.
- #19 birleşik telefon testini geçti ve squash merge ile main'e alındı: `18f5172`. Ankara 101 seçim ekranı, Ankara Klasikleri ve Bir Ankaralı Gibi akışları main'dedir.
- #20 ortak proje hafızası paketi main'dedir: `fa0a0a6`.
- #22 dalında 7 Eylül 2026 tarihinde doğrulanan 12 Ankara etkinliği hazırlandı. TypeScript, 49/49 regresyon testi, katalog parity, 2.560 + 640 stres senaryosu ve 665 modüllük Android export başarılı. Tasarım ayrı sohbetle paralel sürüyor.

## Planlama tahmini — ölçülmüş tamamlanma oranı değildir

Mevcut kod, taslak PR'lar ve açık yayın işleri birlikte değerlendirilince kaba aralıklar: işlevsel MVP kod kapsamı %60–75, tasarım/marka %25–35, yayına hazırlık %20–30; genel ürün hazırlığı yaklaşık %45–55. Bunlar süre/maliyet vaadi veya test başarı oranı değildir. Öneri ve kalıcılık kodları ileride; nihai ana sayfa, cihaz onayı, güncel içerik ve operasyon geride olduğu için genel oran daha düşüktür. Sabit kabul listesi oluşturulunca bu öznel aralıkların yerine tamamlanan kabul maddeleri sayılmalıdır.

## Sürüm ayrımı

- GitHub main: `18f5172`; #19, #20 ve #21 dâhil.
- Güncel etkinlik adayı: `agent/current-events-20260907`; main'den ayrılan #22 çalışma dalı.
- Tasarım/marka ayrı sohbet ve şartname üzerinden ilerliyor; henüz uygulama koduna aktarılmadı.

## Gerçekte nerede kaldık?

| Alan | Durum | Sıradaki kanıt/iş |
|---|---|---|
| Ürün motoru | Experience, Mekân, Etkinlik, Fikir; beşli sonuç, gerekçe, çeşitlilik kodu var | İlgili testlerin güncel sonucu |
| Kullanıcı | Onboarding, tercihler, kayıt/gizleme/geri alma ve yerel kalıcılık var | Güncelleme/geri dönüş regresyonu |
| Ankara 101 | Gelişmiş editoryal görünüm #19 ile main'de; birleşik telefon testi geçti | Tasarım sistemiyle görsel uyarlama |
| Backend | Firebase Auth/Firestore, repository, cache, validation, sync kodu var | Canlı ortam ve deploy edilmiş kural kanıtı |
| Ana sayfa/marka | Tasarım sohbetinde çalışılıyor; yeni görünüm uygulanmış değil | Onaylı ekran + tasarım şartnamesi |
| Bağlam eskimesi | Tercih kaydı var; seçim zaman damgası yok | Ürün kuralı, sonra migration |
| Etkinlik | #22 dalında 10–20 Eylül tarihli 12 doğrulanmış kayıt; dürüst boş durum mevcut | Otomatik test ve telefon doğrulaması |
| Mekân → plan | #21 main'de; kullanıcı temel telefon akışını doğruladı | Tasarım sistemiyle görsel uyarlama, erişilebilirlik turu |

#22 otomatik kalite kapıları geçti; son kapı Etkinlik sekmesinin gerçek cihazda tarih, saat, fiyat ve kaynak bağlantısıyla doğrulanmasıdır.

## Çalışma sırası

1. Kaynaklı güncel etkinlik paketini test et, telefonda doğrula ve merge et.
2. Tasarım sohbetinden onaylı devir gelince tokenlar ve ana sayfa bileşenlerini uygula; beşli öneri davranışını koru.
3. Anlık bağlamın eskime kuralını kullanıcıyla kararlaştır; timestamp + geriye uyumlu migration ile uygula.
4. Backend dev/prod, kurallar, hata izleme, yedek/restore, veri silme ve gizlilik kontrollerini kanıtla.
5. Gerçek cihaz matrisi, performans, erişilebilirlik ve yayın/rollback provasıyla MVP çıkış kapısını kapat.

## İlk ürün işi: mekân detayından planlara geçiş

Onay kaynağı: mevcut konuşma ve PRODUCT_SPEC §9.4.

- Seçili mekânın ID'si Experience.points[].placeId içinde aranır.
- Gizlenen, süresi dolmuş ve mevcut uygunluk kurallarına uymayan planlar gösterilmez.
- Başlık: Bu mekânı kullanan N’apsak planları. Eşleşme yoksa bölüm gizli.
- Kart mevcut plan detayını açar; kaydetme/gizleme davranışını bozmaz.
- Test: eşleşen ID, benzer isimli farklı ID, gizlenen/expired plan, boş sonuç ve mevcut uygunluk filtresi.
- Veri şeması değişikliği gerekmemesi beklenir; uygulama incelemesinde doğrulanır.

## Teknik temeller — tamamlandı denmeyen kontrol listesi

Kullanıcının eski listesi on başlık: (1) kullanıcı/eşzamanlılık, (2) veri/database, (3) ölçek/maliyet, (4) güvenlik, (5) kimlik, (6) hata/loglama, (7) test/e2e, (8) gizlilik/KVKK, (9) altyapı/deploy, (10) performans. Önceki özette (11) yedek/kurtarma ve (12) analitik/içerik operasyonu ayrıca ayrıştırıldı; on iki maddenin tamamı birebir eski kullanıcı alıntısı değildir.

Öncelik: mevcut backend'in dev/prod ve yetki durumunu kanıtla → test/cihaz regresyonu → hata izleme, yedek/restore ve veri silme akışları → ölçümlü performans/maliyet/yük kontrolü. Azure'a geçiş ayrı onaylı teknik karar gerektirir; mevcut Firebase yönü sırf eski notta Azure geçtiği için değiştirilmez. Sayısal kapasite ve maliyet ölçüm olmadan ilan edilmez.
