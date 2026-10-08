# Gezek performans ölçümü

Bu belge performans iddialarını ölçülebilir, tekrarlanabilir ve kişisel veri içermeyen kanıtlara bağlar.

## Ölçülen iki katman

### Saf öneri motoru

`npm run check:performance`, paket içindeki gerçek Ankara kataloğuyla 250 ısınma ve 5.000 ölçümlü çağrı çalıştırır. Mod, ilgi, bütçe, kişi sayısı, süre ve filtre profillerini deterministik olarak döndürür.

İlk #34 yerel ölçümü:

| Ölçüm | Süre |
|---|---:|
| Ortalama | 1,355 ms |
| p50 | 0,148 ms |
| p95 | 4,140 ms |
| p99 | 4,627 ms |
| Geçici p95 CI bütçesi | 25 ms |

CI makinesi ve geliştirici bilgisayarı aynı donanım değildir. Bütçe mutlak telefon açılış hedefi değil, aynı benchmarkta büyük algoritma gerilemesini yakalayan kapıdır. Katalog veya CI ortamı anlamlı ölçüde değişirse bütçe sessizce yükseltilmez; önce fark açıklanır.

### Uygulama çalışma zamanı

Uygulama iki kaba süreyi ölçer:

- `app_ready`: JS modülü başladığı andan tercihler hydrate edilip font hazır olana kadar.
- `recommendation_compute`: bir öneri grubunun saf hesaplama süresi.

Ham milisaniye gönderilmez. Süre yalnız şu kovalardan birine dönüştürülür:

- 10 ms altı
- 10–49 ms
- 50–199 ms
- 200–999 ms
- 1.000 ms ve üstü

Olayda kullanıcı, cihaz/session kimliği, konum, tercih, içerik adı/ID'si veya serbest metin yoktur. Analytics transport hâlâ varsayılan olarak bağlı değildir; dolayısıyla #34 tek başına cihazdan veri göndermez.

## Henüz kanıtlanmayanlar

6 Ekim Home stabilizasyonunda development-only yerel React render tanısı eklendi. `EXPO_PUBLIC_GEZEK_HOME_PROFILING=1 npx expo start --clear` ile açılır; JS debugger'da `globalThis.__GEZEK_HOME_PROFILE__` Home/SVG render sayıları, öneri hesaplama sayısı ve en fazla 200 süre örneği verir. Varsayılan kapalıdır; `__DEV__` kapalıyken etkinleşmez. Kullanıcı/içerik ID'si, tercih veya konum kaydetmez ve analytics/Sentry'ye veri göndermez. React commit süreleri native frame/FPS ölçümü değildir. Önce/sonra web tanısı ve Redmi doğrulama adımları `HOME_STABILIZATION_REPORT.md` içindedir.

- Release APK gerçek soğuk açılış p50/p95'i
- düşük seviye Android cihaz bellek kullanımı
- uzun liste kaydırma FPS/jank
- zayıf ağda Firestore refresh süresi ve fallback oranı
- uygulama boyutu ve indirme süresi bütçesi

Expo development açılışı release performansı olarak raporlanmaz. Yayın kapısı için imzalı release build, en az düşük/orta sınıf Android cihaz ve tekrarlı soğuk başlangıç ölçümü gerekir.

## Home filtre tanısı — 8 Ekim 2026

`HOME_NATIVE_PERFORMANCE_REPORT.md` yerel cold/warm kanıtını ve USB gerektirmeyen Redmi retest prosedürünü içerir. Opt-in snapshot artık press→React commit ve press→iki frame callback fırsatı, SVG cache hit/miss, parse+JSX construction süresi/element sayısı ve mount/unmount toplamları verir. Frame callback Android first paint kanıtı değildir. React commit süreleri native drawing/FPS değildir. Production-like preview üzerinde React production Profiler ve bu development-only flag kapalıdır; video/Perfetto ayrı kanıttır.

## Regresyon prosedürü

`check:performance` başarısız olursa:

1. Aynı commit'i aynı ortamda en az üç kez çalıştır.
2. Katalog sayısı ve benchmark checksum değerini önceki çalışmayla karşılaştır.
3. Profiler ile sıralama, kopyalama ve mesafe hesaplama maliyetini ayır.
4. Optimizasyondan sonra sonuç uygunluğu, çeşitlilik ve rotasyon testlerini yeniden çalıştır.
5. Bütçe ancak ürün ölçeği bilinçli değiştiyse ve yeni ölçüm kaydıyla güncellenir.
