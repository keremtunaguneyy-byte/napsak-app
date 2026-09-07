# N’apsak — önce burayı oku

Güncelleme: 6 Eylül 2026. Bu klasör sohbetlerden ve model sağlayıcısından bağımsız proje hafızasıdır. Tüm sohbet transkriptinin eksiksiz arşivi değildir.

## Okuma sırası

1. PRODUCT_SPEC.md: ürünün amacı, kapsamı, kalıcı kararlar ve gerekçeleri.
2. STATUS.md: hangi sürümde ne var, ne doğrulandı, sıradaki iş.
3. İşine göre DESIGN_SPEC.md, ALGORITHM_SPEC.md, FIREBASE_RUNBOOK.md, OBSERVABILITY_RUNBOOK.md veya ANALYTICS_SPEC.md.
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
| STATUS.md | Sürüme bağlı gerçekleşen işler, kanıt ve sonraki çalışma |
| DECISIONS.md | Tarihli karar, gerekçe, durum ve etkilenen dosyalar |

## Bir kararın kayıt yolu

Kullanıcı onayı → ilgili şartname güncellemesi → DECISIONS kaydı → uygulama ve ilgili doğrulama → STATUS güncellemesi → incelenebilir PR. Öneri, onay, uygulama ve doğrulama ayrı durumlardır. Önceki kararlar PRODUCT_SPEC §15'te korunur; yeni kayıtlar DECISIONS'ta tutulur.

Tasarım sohbeti tasarım çıktısı ve karar özeti üretir. Kodlama hattı repo değişikliklerini birleştirir. Farklı sohbetlerin birbirinin son mesajını otomatik gördüğü varsayılmaz. Tasarım sohbetinin repo erişimi yoksa güncel dosyalar ona eklenir; ürettiği güncelleme tek uygulama hattından repoya alınır.

## Taşınabilirlik ve yedek

Başka yapay zekâya bu klasörü ve ilgili kodu ver; yalnız eski sohbet bağlantısı veya geçici dosya yolu yeterli değildir. Görsel değerlendirme için DESIGN_SPEC'teki gerçek referans dosyalarını da ekle. Tasarımın her ayrıntısı metinden yeniden üretilemez.

GitHub sürüm geçmişi kararların eski hâline dönmeyi sağlar. Aynı depodaki ikinci klasör bağımsız yedek değildir. Önemli kilometre taşında tam git yedeği ve tasarım kaynakları ayrı bir konuma alınmalı; Firebase kullanıcı/katalog verisi ayrıca yedeklenmelidir. Bu belge düzenli yedekleme servisi kurulduğu anlamına gelmez. Repo erişimi olan ortamda örnek dış yedek: `git bundle create /guvenli-konum/napsak.bundle --all`; ardından `git bundle verify /guvenli-konum/napsak.bundle`. Secret ve kişisel kullanıcı verilerini tasarım devir paketine ekleme.

## Güncel görev

Tasarım sohbeti paralel ilerlerken kodlama hattı STATUS.md sırasını izler. #29 Kaydedilenler sırası telefon testli olarak main'dedir. #30 N’apsak planlarını sıralı Google Maps yürüyüş rotasına bağlar. Gerçek Sentry development projesi/source map kanıtı ve canlı analitik sağlayıcısı ayrı açık kapılardır. Kabul kriterleri STATUS.md, OBSERVABILITY_RUNBOOK.md ve ANALYTICS_SPEC.md içindedir.
