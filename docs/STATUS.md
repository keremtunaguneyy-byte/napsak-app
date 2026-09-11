# N’apsak — Durum ve sıradaki iş

Kontrol tarihi: 10 Eylül 2026. Bu bir yayına hazır olma raporu değildir.

## Son güncelleme — #34–#37 main'de; cihaz kabul hazırlığı tanımlandı

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
- #33 telefon/TalkBack testini geçti ve squash merge ile main'e alındı: `34ce6fb`. Ekran okuyucu rolleri/etiketleri, durum semantiği, görsel açıklamaları, 44 px dokunma hedefleri ve sürekli kaynak kontrolü main'dedir.
- #34 otomatik kontrolleri geçti ve squash merge ile main'e alındı: `839a17945b97372a599ffba3df34351f125c08b6`. PR doğrulamasında 77/77 test, 2.560 genel ve 640 Experience stres senaryosu geçti; 5.000 çağrılık öneri benchmarkında p95 yaklaşık 4,1–4,3 ms ölçüldü ve geçici CI bütçesi 25 ms olarak korundu. Bunlar #34'ün tarihsel birleşme kanıtıdır; güncel release cihaz performansı değildir.
- #35 otomatik kontrolleri geçti ve squash merge ile main'e alındı: `801dac528144ebf345d99daebd4d6e25871e6992`. Bilinen dokuz yayın engeli fail-closed strict production kapısına bağlandı; engellerin hiçbiri bu birleşmeyle kapanmış sayılmadı.
- #36 proje hafızasını #35 sonrası duruma eşitledi ve main'e alındı: `99fa52e157d1c87b81fca3caa08e6004345bb425`. Uygulama davranışı ve dokuz açık yayın engeli değişmedi.
- #37 cihaz kabul sözleşmesini ve kanıt biçimini tanımladı ve main'e alındı: `72122d613bbca64601ed3a646ff3ff025015fe1c`. Bu çalışma imzalı release build ile gerçek cihaz kabulü değildir; `release_device_matrix_unverified` açık kalır ve hiçbir yayın engeli kapanmadı.

## Planlama tahmini — ölçülmüş tamamlanma oranı değildir

Mevcut kod, taslak PR'lar ve açık yayın işleri birlikte değerlendirilince kaba aralıklar: işlevsel MVP kod kapsamı %60–75, tasarım/marka %25–35, yayına hazırlık %20–30; genel ürün hazırlığı yaklaşık %45–55. Bunlar süre/maliyet vaadi veya test başarı oranı değildir. Öneri ve kalıcılık temelleri uygulanmış olsa da nihai ana sayfa, cihaz onayı, güncel içerik ve operasyon geride olduğu için genel oran daha düşüktür. Sabit kabul listesi oluşturulunca bu öznel aralıkların yerine tamamlanan kabul maddeleri sayılmalıdır.

## Güncel kontrol noktası

- GitHub main: `72122d613bbca64601ed3a646ff3ff025015fe1c`; #19–#37 dâhil.
- Açık PR veya PR'a bağlı aktif uygulama/yayın adayı dalı yoktur. Repository'de kalan eski `agent/*` dalları merge edilmiş PR'ların kaynak dallarıdır; aktif çalışma olarak yorumlanmaz.
- Tasarım/marka ayrı sohbet ve şartname üzerinden ilerliyor; repository'de güncel onaylı tasarım devri bulunmadığı için uygulama koduna aktarılmadı.

## Gerçekte nerede kaldık?

| Alan | Durum | Sıradaki kanıt/iş |
|---|---|---|
| Ürün motoru | Experience, Mekân, Etkinlik, Fikir; beşli sonuç, gerekçe, çeşitlilik kodu var | İlgili testlerin güncel sonucu |
| Kullanıcı | Onboarding, tercihler, kayıt/gizleme/geri alma, bağlam yenileme ve yerel kalıcılık main'de | Tasarım uyarlaması ve uçtan uca test |
| Ankara 101 | Gelişmiş editoryal görünüm #19 ile main'de; birleşik telefon testi geçti | Tasarım sistemiyle görsel uyarlama |
| Backend | Firebase Auth/Firestore, repository, cache, validation, sync, env kapısı, Rules CI ve veri silme main'de | Gerçek dev/prod proje ve deploy kanıtı |
| Hata gözlemi | #27 main'de; env-gated Sentry, veri minimizasyonu, render hata sınırı ve telefon testi var | Gerçek production Sentry, source map ve dashboard kanıtı |
| Ürün analitiği | #28 main'de; kişisel veri içermeyen izinli olay sözleşmesi ve uygulama bağlantıları var, veri gönderimi kapalı | Sağlayıcı, veri bölgesi/saklama, açıklama/izin ve canlı şema kanıtı |
| Kaydedilenler | #29 main'de; türler arası tek akış, son kaydedilen önce sırası ve telefon kanıtı var | Tasarım sistemiyle görsel uyarlama |
| N’apsak harita rotası | #30 main'de; kart, Kaydedilenler ve detay akışı telefonda doğrulandı | Tasarım sistemiyle görsel uyarlama |
| Ana sayfa/marka | Tasarım sohbetinde çalışılıyor; yeni görünüm uygulanmış değil | Onaylı ekran + tasarım şartnamesi |
| Bağlam eskimesi | #23 main'de; altı saat/yeni gün kuralı, zaman damgası ve v5 migration telefon testli | Tasarım sistemiyle görsel uyarlama |
| Etkinlik | #22 içeriği ve #31 günlük envanter/tazelik kontrolü main'de | Düzenli başarısızlık takibi ve kaynak yenilemesi |
| Yedek/kurtarma | #32 güvenli komut planı ve dry-run aracı main'de | Gerçek bucket/IAM, production export ve ayrı recovery restore kanıtı |
| Mekân → plan | #21 main'de; kullanıcı temel telefon akışını doğruladı | Tasarım sistemiyle görsel uyarlama |
| Erişilebilirlik | #33 semantik, hedef boyutu, CI ve TalkBack telefon kanıtıyla main'de | Büyük yazı ve kontrast ölçümü |
| Performans | #34 main'de; 5.000 çağrılık öneri p95 bütçesi ve kaba runtime süreleri var | Release APK soğuk açılış, bellek ve jank cihaz ölçümü |
| E2E/cihaz kabulü | #37 ile framework bağımsız kritik akış, cihaz matrisi, performans prosedürü ve kanıt biçimi DEVICE_ACCEPTANCE_RUNBOOK.md'de tanımlı; imzalı release cihaz kabulü yapılmadı | İmzalı release build ile gerçek düşük/orta Android ve hedef iOS kanıtı |
| Yayın/rollback | #35 main'de; otomatik engel envanteri, strict production kapısı ve geri dönüş runbook'u kodda uygulanmış ve test edilmiş; production onayı değildir | Aşağıdaki dokuz açık engelin gerçek değer ve dış kanıtlarla kapatılması |

#26'nın env'siz telefon testinde yerel silme ve yeniden kalıcılık kanıtlandı. Gerçek Firestore/Auth silme kanıtı development Firebase projesi bağlandıktan sonra ayrıca alınmalıdır.

## Açık dokuz yayın engeli

Bu liste `RELEASE_RUNBOOK.md`, `release-readiness.json` ve `scripts/checkReleaseReadiness.ts` ile karşılaştırılmıştır. #35 bu engelleri görünür ve denetlenebilir yaptı; hiçbirini kapatmadı.

| Engel adı | Güncel durum |
|---|---|
| `android_package_unverified` | Açık |
| `eas_project_id_unverified` | Açık |
| `ios_bundle_identifier_unverified` | Açık |
| `privacy_policy_url_unverified` | Açık |
| `production_firebase_unverified` | Açık |
| `production_sentry_unverified` | Açık |
| `release_device_matrix_unverified` | Açık |
| `restore_drill_unverified` | Açık |
| `support_url_unverified` | Açık |

## Sıradaki işler — bağımlılığa göre

### Dış hesap veya erişim gerektirenler

- Kalıcı Android package, iOS bundle identifier ve gerçek EAS proje bağlantısını oluşturmak.
- Ayrı production Firebase projesini gerçek değerlerle bağlamak; development ortamında gerçek Firestore/Auth silme kanıtını ayrıca almak.
- Development/production Sentry projelerini bağlamak; source map ve güvenli dashboard olayını kanıtlamak.
- HTTPS gizlilik politikası ve destek sayfalarını yayımlayıp doğrulamak.
- Gerçek bucket/IAM ile production export ve ayrı boş recovery projesinde restore provası yapmak.
- İmzalı release build üretip düşük/orta Android ve hedef iOS cihaz matrisini kaydetmek.
- Canlı analitik istenirse ANALYTICS_SPEC'teki sağlayıcı, veri bölgesi/saklama, izin ve silme/export kapılarını ayrıca kapatmak; transport bu karara kadar kapalı kalır.

### Tasarım devri gerektirenler

- Onaylı logo, renk paleti ve tasarım tokenlarını uygulamak.
- Ana sayfa, kart/detay ailesi, Kaydedilenler ve Ankara 101'i onaylı tasarım sistemiyle uyarlamak.
- Tasarım uygulamasından sonra büyük yazı, kontrast ve birleşik cihaz kabulünü yeniden doğrulamak.

### Hemen yapılabilecekler

- Mevcut App Quality, Security Rules ve Event Catalog Health kontrollerini korumak; etkinlik sağlığı başarısız olursa EVENT_OPERATIONS_RUNBOOK'a göre kaynakları insan doğrulamasıyla yenilemek.
- DEVICE_ACCEPTANCE_RUNBOOK.md'deki development hazırlığını yürütmek; doğrulanmamış cihaz/OS/framework seçimlerini açık bırakmak.
- İmzalı build ve dış erişim hazır olduğunda aynı sözleşmeyle gerçek cihaz kabul kanıtını toplamak; hazırlığı `release_device_matrix_unverified` engelinin kapanmasıyla karıştırmamak.

## Tamamlanan ürün işi: mekân detayından planlara geçiş

PRODUCT_SPEC §9.4'teki davranış #21 ile main'e alındı: `dcde744961d914a7a4c1f555939fe55aad11f8cf`. Seçili mekân ilişkisi `Experience.points[].placeId` üzerinden kuruluyor; gizlenen, süresi dolmuş ve uygun olmayan planlar eleniyor. Eşleşme yoksa bölüm gizleniyor. Kullanıcı temel telefon akışını doğruladı.

## Teknik temeller — tamamlandı denmeyen kontrol listesi

Kullanıcının eski listesi on başlık: (1) kullanıcı/eşzamanlılık, (2) veri/database, (3) ölçek/maliyet, (4) güvenlik, (5) kimlik, (6) hata/loglama, (7) test/e2e, (8) gizlilik/KVKK, (9) altyapı/deploy, (10) performans. Önceki özette (11) yedek/kurtarma ve (12) analitik/içerik operasyonu ayrıca ayrıştırıldı; on iki maddenin tamamı birebir eski kullanıcı alıntısı değildir.

Öncelik: mevcut backend'in dev/prod ve yetki durumunu kanıtla → test/cihaz regresyonu → hata izleme, yedek/restore ve veri silme akışları → ölçümlü performans/maliyet/yük kontrolü. Azure'a geçiş ayrı onaylı teknik karar gerektirir; mevcut Firebase yönü sırf eski notta Azure geçtiği için değiştirilmez. Sayısal kapasite ve maliyet ölçüm olmadan ilan edilmez.
