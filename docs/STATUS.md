# N’apsak — Durum ve sıradaki iş

Kontrol tarihi: 8 Eylül 2026. Bu bir yayına hazır olma raporu değildir.

## Son güncelleme — #32 main'de; erişilebilirlik tabanı #33'te hazırlanıyor

- #21 telefonda doğrulandı ve squash merge ile main'e alındı: `dcde744`. Mekân detayı, ilgili uygun planlar, plan detayı, kaydet/gizle/geri al main'dedir.
- #19 birleşik telefon testini geçti ve squash merge ile main'e alındı: `18f5172`. Ankara 101 seçim ekranı, Ankara Klasikleri ve Bir Ankaralı Gibi akışları main'dedir.
- #20 ortak proje hafızası paketi main'dedir: `fa0a0a6`.
- #22 telefon testini geçti ve squash merge ile main'e alındı: `6f3f425`. 10–20 Eylül tarihli 12 doğrulanmış Ankara etkinliği main'dedir.
- #23 telefon testini geçti ve squash merge ile main'e alındı: `8074432`. Altı saat/yeni gün bağlam yenilemesi ve v5 tercih migration'ı main'dedir.
- #24 telefon testini geçti ve squash merge ile main'e alındı: `fc74b19`. Firebase ortam sözleşmesi ve release ön-kontrolü main'dedir.
- #25 Java 21 CI'da gerçek Firestore emulator testini geçti ve squash merge ile main'e alındı: `8a0eff8`. Sertleştirilmiş Rules ve sürekli CI kanıtı main'dedir.
- #26 telefon testini geçti ve squash merge ile main'e alındı: `4487034`. Çift onaylı Ayarlar/veri silme ekranı, yerel v1–v5 temizliği, sync queue temizliği, sahibine ait Firestore belge silme ve ayrı Auth sonucu main'dedir.
- #27 telefon testini geçti ve squash merge ile main'e alındı: `139c7cb`. Gizlilik güvenli Sentry temeli, render hata sınırı, kritik operasyon hata kodları ve release preflight main'dedir. Expo geliştirme LogBox'ının kontrollü test hatasını ayrıca göstermesi beklenen geliştirme davranışıdır; release arayüzünde test düğmesi yoktur.
- #28 telefon regresyonunu geçti ve squash merge ile main'e alındı: `065a00f`. Sağlayıcıdan bağımsız, fail-closed analitik olay sözleşmesi main'dedir; transport varsayılan olarak bağlı olmadığı için cihazdan analitik verisi gönderilmez.
- #29 telefon testini geçti ve squash merge ile main'e alındı: `711ead3`. Kaydedilenler bütün içerik türleri için tek zaman sırasındadır; son kaydedilen en üstte gösterilir.
- #30 telefon testini geçti ve squash merge ile main'e alındı: `a260bd0`. Ana sonuç, Kaydedilenler ve plan detayındaki N’apsak planları sıralı Google Maps yürüyüş rotası açar; tek duraklı planlar harita araması açar.
- #31 otomatik kontrolleri geçti ve squash merge ile main'e alındı: `717d5da`. Günlük etkinlik envanteri, ileri tarih ufku ve kaynak doğrulama yaşı kontrolü main'dedir.
- #32 otomatik kontrolleri geçti ve squash merge ile main'e alındı: `a857e8f`. Production Firestore export ve ayrı recovery restore için fail-closed dry-run/apply aracı main'dedir. Bu çalışma ortamında `gcloud` bulunmadığı için gerçek bulut provası henüz yoktur.
- #33 dalında ekran okuyucu rolleri/etiketleri, durum semantiği, görsel açıklamaları ve 44 px dokunma hedefleri için erişilebilirlik tabanı hazırlanıyor.

## Planlama tahmini — ölçülmüş tamamlanma oranı değildir

Mevcut kod, taslak PR'lar ve açık yayın işleri birlikte değerlendirilince kaba aralıklar: işlevsel MVP kod kapsamı %60–75, tasarım/marka %25–35, yayına hazırlık %20–30; genel ürün hazırlığı yaklaşık %45–55. Bunlar süre/maliyet vaadi veya test başarı oranı değildir. Öneri ve kalıcılık kodları ileride; nihai ana sayfa, cihaz onayı, güncel içerik ve operasyon geride olduğu için genel oran daha düşüktür. Sabit kabul listesi oluşturulunca bu öznel aralıkların yerine tamamlanan kabul maddeleri sayılmalıdır.

## Sürüm ayrımı

- GitHub main: `a857e8f`; #19–#32 dâhil.
- Erişilebilirlik tabanı adayı: `agent/accessibility-baseline-20260908`; main ağacından ayrılan #33 çalışma dalı.
- Tasarım/marka ayrı sohbet ve şartname üzerinden ilerliyor; henüz uygulama koduna aktarılmadı.

## Gerçekte nerede kaldık?

| Alan | Durum | Sıradaki kanıt/iş |
|---|---|---|
| Ürün motoru | Experience, Mekân, Etkinlik, Fikir; beşli sonuç, gerekçe, çeşitlilik kodu var | İlgili testlerin güncel sonucu |
| Kullanıcı | Onboarding, tercihler, kayıt/gizleme/geri alma, bağlam yenileme ve yerel kalıcılık main'de | Tasarım uyarlaması ve uçtan uca test |
| Ankara 101 | Gelişmiş editoryal görünüm #19 ile main'de; birleşik telefon testi geçti | Tasarım sistemiyle görsel uyarlama |
| Backend | Firebase Auth/Firestore, repository, cache, validation, sync, env kapısı, Rules CI ve veri silme main'de | Gerçek dev/prod proje ve deploy kanıtı |
| Hata gözlemi | #27 main'de; env-gated Sentry, veri minimizasyonu, render hata sınırı ve telefon testi var | Gerçek development DSN, source map ve dashboard olayı |
| Ürün analitiği | #28 main'de; kişisel veri içermeyen izinli olay sözleşmesi ve uygulama bağlantıları var, veri gönderimi kapalı | Sağlayıcı, veri bölgesi/saklama, açıklama/izin ve canlı şema kanıtı |
| Kaydedilenler | #29 main'de; türler arası tek akış, son kaydedilen önce sırası ve telefon kanıtı var | Tasarım sistemiyle görsel uyarlama |
| N’apsak harita rotası | #30 main'de; kart, Kaydedilenler ve detay akışı telefonda doğrulandı | Tasarım sistemiyle görsel uyarlama |
| Ana sayfa/marka | Tasarım sohbetinde çalışılıyor; yeni görünüm uygulanmış değil | Onaylı ekran + tasarım şartnamesi |
| Bağlam eskimesi | #23 main'de; altı saat/yeni gün kuralı, zaman damgası ve v5 migration telefon testli | Tasarım sistemiyle görsel uyarlama |
| Etkinlik | #22 içeriği ve #31 günlük envanter/tazelik kontrolü main'de | Düzenli başarısızlık takibi ve kaynak yenilemesi |
| Yedek/kurtarma | #32 güvenli komut planı ve dry-run aracı main'de | Gerçek bucket/IAM, production export ve ayrı recovery restore kanıtı |
| Mekân → plan | #21 main'de; kullanıcı temel telefon akışını doğruladı | Tasarım sistemiyle görsel uyarlama |
| Erişilebilirlik | Temel Safe Area/etiketler var; #33 kapsamlı semantik ve CI kapısı ekliyor | TalkBack telefon turu, büyük yazı ve kontrast ölçümü |

#26'nın env'siz telefon testinde yerel silme ve yeniden kalıcılık kanıtlandı. Gerçek Firestore/Auth silme kanıtı development Firebase projesi bağlandıktan sonra ayrıca alınmalıdır.

## Çalışma sırası

1. #33 erişilebilirlik tabanını otomatik kontrol ve TalkBack telefon turuyla doğrula.
2. Development Sentry projesi, source map ve dashboard olayını canlı ortam hazırlığında kanıtla.
3. Tasarım sohbetinden onaylı devir gelir gelmez tokenlar, ana sayfa ve kart/detay ailesini uygula.
4. Uçtan uca test, cihaz matrisi, performans ve yayın/rollback kapılarını kapat.

PR numaraları tasarım devrinin geliş zamanına göre yer değiştirebilir. Güncel öngörü: #33 erişilebilirlik tabanı; gerçek Firebase/Sentry ortam bağlantısı; tasarım devri geldiğinde tokenlar, ana sayfa ve kart/detay ailesi; ardından performans, e2e/cihaz matrisi ve release/mağaza hazırlığı.

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
