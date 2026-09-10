# N’apsak — önce burayı oku

Güncelleme: 10 Eylül 2026. Bu klasör sohbetlerden ve model sağlayıcısından bağımsız proje hafızasıdır. Tüm sohbet transkriptinin eksiksiz arşivi değildir.

## Okuma sırası

1. PRODUCT_SPEC.md: ürünün amacı, kapsamı, kalıcı kararlar ve gerekçeleri.
2. STATUS.md: hangi sürümde ne var, ne doğrulandı, sıradaki iş.
3. İşine göre DESIGN_SPEC.md, ALGORITHM_SPEC.md, FIREBASE_RUNBOOK.md, OBSERVABILITY_RUNBOOK.md, ANALYTICS_SPEC.md, EVENT_OPERATIONS_RUNBOOK.md, PERFORMANCE_RUNBOOK.md, DEVICE_ACCEPTANCE_RUNBOOK.md veya RELEASE_RUNBOOK.md.
4. DECISIONS.md: son kararlar, öneriler ve açık konular.

Yeni bir asistan önce bu dosyaları gerçekten açmalı; erişemediği kaynakları ve incelediği branch/commit'i belirtmeli. Kullanıcıya bütün ürünü yeniden anlattırmamalı. Belgeyle kod çelişiyorsa bunu açıklamalı; sessizce ürün kararı değiştirmemeli.

## Dosyaların görevleri

| Dosya | Yetkili olduğu bilgi |
|---|---|
| PRODUCT_SPEC.md | Ne yapıyoruz ve neden? |
| DESIGN_SPEC.md | Görünüm, bilgi hiyerarşisi, etkileşim, referanslar, Ankara 101 karakteri |
| ALGORITHM_SPEC.md | Uygunluk, sıralama, çeşitlilik, içerik sözleşmesi |
| FIREBASE_RUNBOOK.md | Backend işletimi, veri yayını, migration, güvenlik ve yedek prosedürleri |
| OBSERVABILITY_RUNBOOK.md | Hata gözlemi, veri minimizasyonu, Sentry ortamı ve canlı doğrulama |
| ANALYTICS_SPEC.md | İzinli ürün olayları, yasak kişisel alanlar ve sağlayıcı/izin kapısı |
| EVENT_OPERATIONS_RUNBOOK.md | Etkinlik envanteri, kaynak tazeliği, günlük kontrol ve yenileme prosedürü |
| PERFORMANCE_RUNBOOK.md | Öneri benchmarkı, kaba cihaz süreleri, bütçeler ve regresyon prosedürü |
| DEVICE_ACCEPTANCE_RUNBOOK.md | Kritik kullanıcı yolculukları, cihaz matrisi, release kabul ayrımı ve kanıt biçimi |
| RELEASE_RUNBOOK.md | Yayın engelleri, production kapısı, staged dağıtım ve geri dönüş prosedürü |
| STATUS.md | Sürüme bağlı gerçekleşen işler, kanıt ve sonraki çalışma |
| DECISIONS.md | Tarihli karar, gerekçe, durum ve etkilenen dosyalar |

## Bir kararın kayıt yolu

Kullanıcı onayı → ilgili şartname güncellemesi → DECISIONS kaydı → uygulama ve ilgili doğrulama → STATUS güncellemesi → incelenebilir PR. Karar durumu (öneri, onaylı, uygulanmış) ile kanıt seviyesi (repository/kodda mevcut, otomatik veya manuel test edilmiş, gerçek production ortamında doğrulanmış) ayrı kaydedilir; biri diğerini otomatik olarak gerektirmez. Önceki kararlar PRODUCT_SPEC §15'te korunur; yeni kayıtlar DECISIONS'ta tutulur.

Tasarım sohbeti tasarım çıktısı ve karar özeti üretir. Kodlama hattı repo değişikliklerini birleştirir. Farklı sohbetlerin birbirinin son mesajını otomatik gördüğü varsayılmaz. Tasarım sohbetinin repo erişimi yoksa güncel dosyalar ona eklenir; ürettiği güncelleme tek uygulama hattından repoya alınır.

## Taşınabilirlik ve yedek

Başka yapay zekâya bu klasörü ve ilgili kodu ver; yalnız eski sohbet bağlantısı veya geçici dosya yolu yeterli değildir. Görsel değerlendirme için DESIGN_SPEC'teki gerçek referans dosyalarını da ekle. Tasarımın her ayrıntısı metinden yeniden üretilemez.

GitHub sürüm geçmişi kararların eski hâline dönmeyi sağlar. Aynı depodaki ikinci klasör bağımsız yedek değildir. Önemli kilometre taşında tam git yedeği ve tasarım kaynakları ayrı bir konuma alınmalı; Firebase kullanıcı/katalog verisi ayrıca yedeklenmelidir. Bu belge düzenli yedekleme servisi kurulduğu anlamına gelmez. Repo erişimi olan ortamda örnek dış yedek: `git bundle create /guvenli-konum/napsak.bundle --all`; ardından `git bundle verify /guvenli-konum/napsak.bundle`. Secret ve kişisel kullanıcı verilerini tasarım devir paketine ekleme.

## Güncel görev

Güncel GitHub main kontrol noktası `72122d613bbca64601ed3a646ff3ff025015fe1c` ve #37'dir. #35 release gate/readiness/rollback yönetişimini kodda uygulayıp test etti; production onayı vermedi ve hiçbir yayın engelini kapatmadı. #36 yalnız proje hafızası/dokümantasyon senkronudur; yeni ürün davranışı veya ürün kararı değildir. #37 cihaz kabul sözleşmesini ve kanıt biçimini repository'de tanımladı; imzalı release cihaz kabulü yapılmadı ve `release_device_matrix_unverified` açık kaldı. Gerçek bulut restore provası ile production Sentry, source map ve dashboard kanıtı ayrı açık yayın kapılarıdır. Canlı analitik sağlayıcısı ayrıca açık bir karardır; dokuz yayın engelinden biri değildir. Kabul kriterleri STATUS.md, PERFORMANCE_RUNBOOK.md, DEVICE_ACCEPTANCE_RUNBOOK.md, RELEASE_RUNBOOK.md, FIREBASE_RUNBOOK.md, EVENT_OPERATIONS_RUNBOOK.md, OBSERVABILITY_RUNBOOK.md ve ANALYTICS_SPEC.md içindedir.
