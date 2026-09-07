# N’apsak — Durum ve sıradaki iş

Kontrol tarihi: 7 Eylül 2026. Bu bir yayına hazır olma raporu değildir.

## Son güncelleme — #23 main'de; Firebase ortam kapısı #24'te hazırlanıyor

- #21 telefonda doğrulandı ve squash merge ile main'e alındı: `dcde744`. Mekân detayı, ilgili uygun planlar, plan detayı, kaydet/gizle/geri al main'dedir.
- #19 birleşik telefon testini geçti ve squash merge ile main'e alındı: `18f5172`. Ankara 101 seçim ekranı, Ankara Klasikleri ve Bir Ankaralı Gibi akışları main'dedir.
- #20 ortak proje hafızası paketi main'dedir: `fa0a0a6`.
- #22 telefon testini geçti ve squash merge ile main'e alındı: `6f3f425`. 10–20 Eylül tarihli 12 doğrulanmış Ankara etkinliği main'dedir.
- #23 telefon testini geçti ve squash merge ile main'e alındı: `8074432`. Altı saat/yeni gün bağlam yenilemesi ve v5 tercih migration'ı main'dedir.
- #24 dalında Firebase public env sözleşmesi ve secret sızdırmayan release ön-kontrolü hazırlanıyor. Eksik/placeholder/yanlış ortam, production→dev proje ve production→emulator bağlantıları reddediliyor. TypeScript, 53/53 test, stres, katalog ve 666 modüllük Android export geçti. Rules emulator denemesi kod hatasıyla değil, çalışma ortamındaki Java 17 nedeniyle durdu; Firebase CLI Java 21+ istiyor ve bu test geçmiş sayılmadı.

## Planlama tahmini — ölçülmüş tamamlanma oranı değildir

Mevcut kod, taslak PR'lar ve açık yayın işleri birlikte değerlendirilince kaba aralıklar: işlevsel MVP kod kapsamı %60–75, tasarım/marka %25–35, yayına hazırlık %20–30; genel ürün hazırlığı yaklaşık %45–55. Bunlar süre/maliyet vaadi veya test başarı oranı değildir. Öneri ve kalıcılık kodları ileride; nihai ana sayfa, cihaz onayı, güncel içerik ve operasyon geride olduğu için genel oran daha düşüktür. Sabit kabul listesi oluşturulunca bu öznel aralıkların yerine tamamlanan kabul maddeleri sayılmalıdır.

## Sürüm ayrımı

- GitHub main: `8074432`; #19–#23 dâhil.
- Backend hazırlık adayı: `agent/backend-readiness-20260907`; main'den ayrılan #24 çalışma dalı.
- Tasarım/marka ayrı sohbet ve şartname üzerinden ilerliyor; henüz uygulama koduna aktarılmadı.

## Gerçekte nerede kaldık?

| Alan | Durum | Sıradaki kanıt/iş |
|---|---|---|
| Ürün motoru | Experience, Mekân, Etkinlik, Fikir; beşli sonuç, gerekçe, çeşitlilik kodu var | İlgili testlerin güncel sonucu |
| Kullanıcı | Onboarding, tercihler, kayıt/gizleme/geri alma, bağlam yenileme ve yerel kalıcılık main'de | Tasarım uyarlaması ve uçtan uca test |
| Ankara 101 | Gelişmiş editoryal görünüm #19 ile main'de; birleşik telefon testi geçti | Tasarım sistemiyle görsel uyarlama |
| Backend | Firebase Auth/Firestore, repository, cache, validation ve sync var; #24'te env kapısı hazırlanıyor | #24 testi, gerçek dev/prod proje ve deploy kanıtı |
| Ana sayfa/marka | Tasarım sohbetinde çalışılıyor; yeni görünüm uygulanmış değil | Onaylı ekran + tasarım şartnamesi |
| Bağlam eskimesi | #23 main'de; altı saat/yeni gün kuralı, zaman damgası ve v5 migration telefon testli | Tasarım sistemiyle görsel uyarlama |
| Etkinlik | #22 main'de; 10–20 Eylül tarihli 12 doğrulanmış kayıt ve dürüst boş durum mevcut | Düzenli içerik operasyonu |
| Mekân → plan | #21 main'de; kullanıcı temel telefon akışını doğruladı | Tasarım sistemiyle görsel uyarlama, erişilebilirlik turu |

#24'ün otomatik kalite kapıları hazırlanıyor. Bu PR gerçek Firebase projesi oluşturmaz veya canlı deploy kanıtı sayılmaz; yanlış/eksik yapılandırmanın sessizce paketlenmesini engelleyen sözleşmedir.

## Çalışma sırası

1. #24 Firebase env/release ön-kontrolünü tamamla ve merge et.
2. Security Rules sözleşmesini ve emulator testlerini genişlet.
3. Kullanıcı verisini cihazdan ve remote anonim hesaptan silme akışını ekle.
4. Hata gözlemi ile kişisel veri içermeyen analitik olay sözleşmesini kur.
5. Düzenli etkinlik içerik doğrulama/sona erme operasyonunu otomatikleştir.
6. Backup/export ve restore provasını kanıtla.
7. Tasarım sohbetinden onaylı devir gelir gelmez tokenlar, ana sayfa ve kart/detay ailesini uygula.
8. Uçtan uca test, cihaz matrisi, performans, erişilebilirlik ve yayın/rollback kapılarını kapat.

PR numaraları tasarım devrinin geliş zamanına göre yer değiştirebilir. Öngörülen dilimler: #24 env kapısı; #25 rules; #26 veri silme; #27 hata gözlemi; #28 analitik; #29 etkinlik operasyonu; #30 backup/restore; #31 tasarım tokenları; #32 ana sayfa; #33 kart/detay ekranları; #34 erişilebilirlik; #35 performans; #36 e2e/cihaz matrisi; #37 release ve mağaza hazırlığı.

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
