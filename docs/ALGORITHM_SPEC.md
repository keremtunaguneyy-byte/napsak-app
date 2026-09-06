# N’apsak — Öneri ve İçerik Sözleşmesi

6 Eylül 2026. Kod dayanağı: src/recommendations.ts, src/domain.ts, src/resultFilters.ts, src/data/* ve tests/domain.test.cjs. Ürün ilkeleri PRODUCT_SPEC §4–8. Bu belge yeni algoritma uygulamaz.

## Katmanlar

| Katman | Uygunluk ve sıralama |
|---|---|
| Experience | Gizlenen, süresi dolan, süreye sığmayan ve açık ilgiyle eşleşmeyen adaylar elenir. Ana/ikincil ilgi ayrımı, mod, bütçe, grup, başlangıç mesafesi, editoryal kalite, güven, güncellik ve seed sinyalleri kullanılır. |
| Mekân | Gizlenen ve açık ilgiyle eşleşmeyen adaylar elenir. Mod, bütçe, grup ve mesafe sıralama sinyalidir; mesafe kesin yarıçap filtresi değildir. |
| Fikir | Açık Fikir sekmesinde standart beşli için bir ilgili + dört seçili ilgilerden bağımsız keşif hedeflenir. Yetersiz havuzda kontrollü fallback vardır. Karma akış ile açık Fikir sekmesi aynı davranış değildir. |
| Etkinlik | Geçersiz/geçmiş başlangıç zamanı ve gizlenenler elenir. Açık Etkinlik sekmesinde ilgi sıralama sinyalidir; karma akışta ayrıca ilgi uygunluğu uygulanır. |

Experience ana ilgi eşleşmesi ikincil eşleşmeye göre önceliklidir. Kategori/ilçe yığılması azaltılır; önceki gruptan kaçınma ve deterministik seed vardır. Küçük havuzda tekrar mümkün olduğundan “daima beş tamamen yeni sonuç” vaat edilmez. Gerekçe gerçek eşleşmeyi anlatmalıdır.

## Çağrı ve sunum sınırı

App.tsx mevcut sonuç çağrısı `recommendAll(... limit: 5)` kullanır. `recommendExperiences` ve `recommendPlaces` ayrı export edilir. Fikir yardımcı fonksiyonu dosya içindedir; etkinlik sıralaması recommendAll içindedir. Eski sohbetlerde geçen bağımsız `recommendEvents()` çağrısı mevcut public API değildir.

Yeni ana sayfanın bir ana plan + dört alternatif sunumu aynı Experience beşlisini kullanmalıdır. Sana göre önizlemeleri için ayrı katman çağrıları gerekir; maket bunu otomatik olarak uygulamış sayılmaz. İlgili çağrı değişikliğinde sıralama, filtre ve keşif davranışı korunmalıdır.

## Veri güvenilirliği

Stable ID ve cityId korunur. Experience.points[].placeId mekân-plan ilişkisidir. Başlık eşleştirmesi kullanılmaz. Koordinatı olmayan etkinliğe mesafe, saat verisi olmayan mekâna Şimdi açık etiketi üretilmez. Kaynak, doğrulama tarihi ve yaşam döngüsü gerçek veri olmalıdır. Yerel/kayıtlı/remote katalog ayrımı ve runtime validation FIREBASE_RUNBOOK ile birlikte değerlendirilir.

## Değişiklikte kabul kriterleri

İlgi/süre/gizleme/son kullanma sınırları; aynı seed ile tekrar üretilebilirlik; küçük havuz fallback'i; tür başına gerekçe; Fikir kotası; ana/ikincil ilgi önceliği ve eski kayıtların korunması ilgili testlerde kontrol edilir. Test sonucu commit ve komutla STATUS'a kaydedilir. Tarihî stres sayıları yeni sürümün başarı kanıtı değildir.
