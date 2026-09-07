# N’apsak — Durum ve sıradaki iş

Kontrol tarihi: 7 Eylül 2026. Bu bir yayına hazır olma raporu değildir.

## Son güncelleme — #22 main'de; bağlam yenileme #23'te hazırlanıyor

- #21 telefonda doğrulandı ve squash merge ile main'e alındı: `dcde744`. Mekân detayı, ilgili uygun planlar, plan detayı, kaydet/gizle/geri al main'dedir.
- #19 birleşik telefon testini geçti ve squash merge ile main'e alındı: `18f5172`. Ankara 101 seçim ekranı, Ankara Klasikleri ve Bir Ankaralı Gibi akışları main'dedir.
- #20 ortak proje hafızası paketi main'dedir: `fa0a0a6`.
- #22 telefon testini geçti ve squash merge ile main'e alındı: `6f3f425`. 10–20 Eylül tarihli 12 doğrulanmış Ankara etkinliği main'dedir.
- #23 dalında geri dönen kullanıcı için altı saat/yeni gün kuralı, engellemeyen doğrulama kartı, v4→v5 migration ve onboarding tamamlanma düzeltmesi hazırlanıyor. TypeScript, 50/50 regresyon testi, katalog parity ve 2.560 + 640 stres senaryosu başarılı. Tasarım ayrı sohbetle paralel sürüyor.

## Planlama tahmini — ölçülmüş tamamlanma oranı değildir

Mevcut kod, taslak PR'lar ve açık yayın işleri birlikte değerlendirilince kaba aralıklar: işlevsel MVP kod kapsamı %60–75, tasarım/marka %25–35, yayına hazırlık %20–30; genel ürün hazırlığı yaklaşık %45–55. Bunlar süre/maliyet vaadi veya test başarı oranı değildir. Öneri ve kalıcılık kodları ileride; nihai ana sayfa, cihaz onayı, güncel içerik ve operasyon geride olduğu için genel oran daha düşüktür. Sabit kabul listesi oluşturulunca bu öznel aralıkların yerine tamamlanan kabul maddeleri sayılmalıdır.

## Sürüm ayrımı

- GitHub main: `6f3f425`; #19, #20, #21 ve #22 dâhil.
- Bağlam yenileme adayı: `agent/context-refresh-20260907`; main'den ayrılan #23 çalışma dalı.
- Tasarım/marka ayrı sohbet ve şartname üzerinden ilerliyor; henüz uygulama koduna aktarılmadı.

## Gerçekte nerede kaldık?

| Alan | Durum | Sıradaki kanıt/iş |
|---|---|---|
| Ürün motoru | Experience, Mekân, Etkinlik, Fikir; beşli sonuç, gerekçe, çeşitlilik kodu var | İlgili testlerin güncel sonucu |
| Kullanıcı | Onboarding, tercihler, kayıt/gizleme/geri alma ve yerel kalıcılık var; #23'te geri dönüş kuralı kodlandı | Telefon testi ve merge |
| Ankara 101 | Gelişmiş editoryal görünüm #19 ile main'de; birleşik telefon testi geçti | Tasarım sistemiyle görsel uyarlama |
| Backend | Firebase Auth/Firestore, repository, cache, validation, sync kodu var | Canlı ortam ve deploy edilmiş kural kanıtı |
| Ana sayfa/marka | Tasarım sohbetinde çalışılıyor; yeni görünüm uygulanmış değil | Onaylı ekran + tasarım şartnamesi |
| Bağlam eskimesi | #23'te altı saat/yeni gün kuralı, zaman damgası ve v5 migration hazır | Telefon doğrulaması |
| Etkinlik | #22 main'de; 10–20 Eylül tarihli 12 doğrulanmış kayıt ve dürüst boş durum mevcut | Düzenli içerik operasyonu |
| Mekân → plan | #21 main'de; kullanıcı temel telefon akışını doğruladı | Tasarım sistemiyle görsel uyarlama, erişilebilirlik turu |

#23'ün otomatik kalite kapıları geçiyor; son kapı eski kullanıcı migration'ı ile doğrulama kartının gerçek cihazda sınanmasıdır.

## Çalışma sırası

1. #23 bağlam yenilemesini telefonda doğrula ve merge et.
2. Tasarım sohbetinden onaylı devir gelince tokenlar ve ana sayfa bileşenlerini uygula; beşli öneri davranışını koru.
3. Backend dev/prod, kurallar, hata izleme, yedek/restore, veri silme ve gizlilik kontrollerini kanıtla.
4. Düzenli etkinlik içerik operasyonunu ve analitiği kur.
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
