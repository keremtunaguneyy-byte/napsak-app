# Mekân → N’apsak planı

6 Eylül 2026. Onaylı mekân-plan bağlantısının ilk uygulaması. Taban: main cb21941. Ankara 101 görsel PR'ı #19 ve ortak hafıza PR'ı #20 bu dalın bağımlılığı değildir.

## Kullanıcı davranışı

Sonuçlardaki veya kaydedilenlerdeki mekânda **Mekânı incele** → mekân detayı → **Bu mekânı kullanan N’apsak planları** → **Planı incele**.

Mekân detayı isim/adres/not/bütçe, kaydetme, harita ve resmî bilgi sunar. Plan detayı süre/bütçe, gerekçe, sıralı duraklar, notlar, kaydetme, resmî bilgi, gizleme ve geri alma sunar. Geri önce mekâna, sonra alttaki sonuç/kayıt ekranına döner. Ana liste modal altında açık kalır. Ayrı detaylar önceki main'de yoktu; bu PR bunları ekler.

## Algoritma ve veri

- `recommendExperiencesForPlace` önce aynı cityId ve Experience.points[].placeId ile aday havuzunu daraltır, sonra mevcut Experience motorunu kullanır. Önce tüm şehirden ilk beşi seçip sonradan mekân filtresi uygulamaz.
- İlgi/süre/gizleme/geçerlilik kuralları ve sıralama gerekçeleri korunur. İlgili plan yoksa bölüm gösterilmez.
- Yeni tablo, Firestore kuralı veya preference migration gerekmez. Kaydetme/gizleme mevcut durum ve senkronizasyon yolundan geçer.
- Canlı plan sona erdiğinde açık detay yenilenir; uygulama öne geldiğinde zaman tekrar kontrol edilir.
- Katalog değiştiğinde ana sonuç useMemo bağımlılıkları da güncellenir; eski embedded sonuçların remote katalog geldikten sonra kalması engellenir.
- Yeni detayın görünümü mevcut koyu temayı kullanır. Nihai logo/renk ve ana sayfa yeniden tasarımı bu PR'ın konusu değildir.

## Kanıt

- `node node_modules/typescript/bin/tsc --noEmit`: geçti.
- `npm test`: 48/48 geçti; 5 yeni test ilişki/şehir kimliği, filtre-limit sırası, gizleme/expiry/süre/ilgi, sıralama ve katalog değişimini kontrol ediyor.
- `npm run test:stress`: 2.560 mekân + 640 Experience senaryosu; raporlanan boşluk/uyumsuzluk/duplicate kontrolleri sıfır.
- `CI=1 EXPO_OFFLINE=1 node node_modules/expo/bin/cli export --platform android --output-dir /workspace/scratch/6fb1674295d9/napsak-related-android --max-workers 2`: 641 modül, Android bundle üretildi.
- `git diff --check`: temiz.

Doğrulama mevcut yerel node_modules ile yapıldı; temiz npm ci kurulumu değildir. Android export APK veya cihaz testi değildir. Modal geri tuşu, ekran okuyucu odağı, büyük yazı ve kaydet/gizle/geri al etkileşimleri gerçek cihazda hâlâ kontrol edilmelidir. Bu nedenle ilk PR taslaktır.

## Cihaz kabul adımları

1. Doğa ilgisi, Fark etmez süre; Mekân sekmesinden veya kaydedilenlerden Kuğulu Park'ı incele.
2. Yalnız Kuğulu Park ID'sini içeren uygun planların göründüğünü doğrula.
3. Bir planı aç; durak sırası ve metinleri kontrol et; kaydet, geri dön, kaydedilenlerde bul.
4. Planı gizle; listeden kalksın; Geri al ile geri gelsin.
5. Android geri: plan → mekân → önceki ekran; kapanınca liste konumu korunmalı.
6. İlgili planı olmayan mekânda boş bölüm bulunmamalı; büyük yazıda eylemler kesilmemeli.

## Sonraki iş

Tasarım paralel devam eder. Bu PR ve Ankara 101 PR'ı birleşmeden önce App.tsx üzerindeki değişiklikler birlikte kontrol edilir. Güncel etkinlik verisi ve anlık bağlamın eskime kararı sıradadır. Ürün hafızası PR #20'deki STATUS ve ALGORITHM_SPEC bu uygulama kaydına bağlanmalıdır.
