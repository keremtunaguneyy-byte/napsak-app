# Gezek — Öneri ve İçerik Sözleşmesi

13 Ekim 2026. Kod dayanağı: src/contentPolicy.ts, src/recommendations.ts, src/recommendationQuality.ts, src/domain.ts, src/resultFilters.ts, src/data/* ve tests/domain.test.cjs. Ürün ilkeleri PRODUCT_SPEC §4–8. Recommendation Correctness Phase 1'in onaylı süre ve Ücretsiz semantiği aşağıda tanımlanır.

## Katmanlar

| Katman | Uygunluk ve sıralama |
|---|---|
| Experience | Önce merkezi içerik politikası uygulanır: bütün bağlı Place kayıtları uygun olmalı; `conditional` fail-closed, `event_linked` ise bağlı Event yaklaşan ve geçerli olmalıdır. Sonra gizlenen, süreye sığmayan ve açık ilgiyle eşleşmeyen adaylar elenir. Ana/ikincil ilgi ayrımı, mod, bütçe, grup, başlangıç mesafesi, editoryal kalite, güven, güncellik ve seed sinyalleri kullanılır. |
| Mekân | Yalnız `active` ve hard-exclusion politikasına takılmayan kayıtlar sıralamaya girer. Sonra gizlenen, Ücretsiz için ücretli ve açık ilgiyle eşleşmeyen adaylar elenir. Mod, diğer bütçe bantları, grup ve mesafe sıralama sinyalidir; mesafe kesin yarıçap filtresi değildir. |
| Fikir | Açık Fikir sekmesinde standart beşli için bir ilgili + dört seçili ilgilerden bağımsız keşif hedeflenir. Yetersiz havuzda kontrollü fallback vardır. Karma akış ile açık Fikir sekmesi aynı davranış değildir. Batch A, B ve C'nin `ideaFamily`, yapılandırılmış süre, setting, planning mode, ana/ikincil ilgi, context tag ve requirement alanları bu aşamada editoryal metadatadır; sıralama hâlâ legacy kategori/mod/ilgi/bütçe/grup sinyallerini kullanır. |
| Etkinlik | Geçersiz/geçmiş başlangıç zamanı ve gizlenenler elenir. Açık Etkinlik sekmesinde ilgi sıralama sinyalidir; karma akışta ayrıca ilgi uygunluğu uygulanır. |

Experience ana ilgi eşleşmesi ikincil eşleşmeye göre önceliklidir. Bu katman sırası hem doğrudan `recommendExperiences` sonucunda hem uygulamanın kullandığı `recommendAll(filter: 'experience')` sonucunda korunur: istenen limit kadar uygun ana-ilgi adayı varsa ikincil-only aday ilk gruba giremez; ana arz yetersizse kalan slotlar ikincil eşleşmelerle doldurulabilir. Kategori/ilçe yığılması azaltılır; önceki gruptan kaçınma ve deterministik seed vardır. Küçük havuzda tekrar mümkün olduğundan “daima beş tamamen yeni sonuç” vaat edilmez. Gerekçe gerçek eşleşmeyi anlatmalıdır.

## Merkezi içerik uygunluğu

### Phase 1: süre, fit ve Ücretsiz

Experience uygunluğu `maxDurationMinutes <= selectedMaximum` ile hesaplanır; görünür bandın alt sınırı hard kapı değildir. Maksimumlar 60 / 120 / 240 / 360 dakikadır. Fark etmez/eksik tercih bütün geçerli süreleri kabul eder ve fit puanı 0'dır. Süre ilk duraktan son durağa, aradaki geçişler dahil editoryal tahmindir; gidiş/dönüş ulaşımı dahil veya tamamlanma garantisi değildir.

Fit formülü: `target = (displayMinimum + selectedMaximum) / 2`, `estimate = (minDurationMinutes + maxDurationMinutes) / 2`, `fit = 16 * max(0, 1 - abs(estimate - target) / target)`. Tercih hedefleri 45 / 90 / 210 / 300 dakikadır. Fit mevcut Experience skoruna eklenen sınırlı [0,16] sinyaldir; interestTier her zaman adjusted score'dan önce sıralanır. Mood 48, mevcut bütçe/grup/mesafe, seed varyasyonu ve kategori 16 / ilçe 7 çeşitlilik cezaları korunur. Fit daha yakın süreli eşdeğer planı destekler; diğer soft tercihleri mutlak olarak geçersiz kılmaz. Daha kısa planlar uygun fallback'tir.

Ücretsiz bütün recommendation türlerinde skordan önce `priceLevel === 0` kapısıdır; previous-batch veya Idea quota fallback'i ücretli aday açmaz. Diğer fiyat bantlarının puanları korunur. Ücretsiz gerekçesi yalnız structured sıfır fiyatta üretilir; exact ücretli eşleşme seçilen bandı, komşu eşleşme kaydın kendi bandını söyler. Event expiry, explicit Event interest davranışı ve Idea 1+4 seçim kodu korunur; kota yalnız budget-eligible arz içinde doldurulur.

Experience runtime validation sonlu, negatif olmayan `minDurationMinutes <= maxDurationMinutes` ister. Global üst sınır/integer-only gereksinimi mevcut dokümantasyonda olmadığından eklenmez. Katalogdaki 52 geçerli kaydın süreleri veya ilişkileri değiştirilmez.

`src/contentPolicy.ts` öneri, public çözümleme ve kalite ölçümü için tek politika sınırıdır. Uygunluk skordan önce uygulanır; kayıtlı olma durumu sıralamayı etkilemez. `deprecated` ve `verification_required` Place önerilmez, fakat hard-exclusion dışında kalan deprecated kayıtlar eski kaydetmeleri çözümlemek için ham katalogda kalır. Yılmaz Güney Sahnesi ham embedded katalogdan kaldırılmıştır ve kimlik/ad/alias normalizasyonuyla kodda hard-excluded kalır; eski kaydedilmiş kimlik çözülmez. Canonical ID veya bilinen alias ile remote katalogdan yeniden içe aktarma runtime doğrulamasında reddedilir; ona bağlanan Experience da kabul edilmez.

Event başlangıcı zaman tabanlı uygunluğun sınırıdır. Uygulama en yakın gelecek Event sınırında ve foreground'a döndüğünde saati yeniler; `event_linked` kayıtlar eksik/geçersiz/başlamış Event için fail-closed davranır. `conditional` semantiği ayrıca onaylanana kadar hiçbir conditional kayıt önerilemez; bu PR conditional veya event-linked katalog kaydı eklemez.

`reservation`, `weather` ve `availabilityNote` kullanıcıya açıklama sağlayan alanlardır; runtime uygunluk kontrolü değildir. Yaş, mevsim, haftanın günü, program ve envanter/müsaitlik de runtime tarafından uygulanmaz. Bu nedenle bu koşullardan birine bağlı Experience, uygun bir gelecek Event'e bağlanamıyorsa `evergreen` olarak yayımlanmaz. `event_linked` uygunluğu Event'in `startsAt` anında sona erer; `endsAt` bu yaşam döngüsü sınırını uzatmaz. Genelleştirilmiş bir zamanlama/koşul motoru, katalog ihtiyacı ayrıca haklı çıkarmadıkça beta sonrasına ertelenmiştir.

## Opsiyonel proximity policy sınırı — 21 Ekim 2026

`recommendAll`, `recommendExperiences` ve `recommendPlaces`, saf `proximityPolicy?: RecommendationProximityPolicy` girdisini kabul eder (`'default' | 'nearby'`). Eksik veya `default` değer A yoludur: Place `max(0, 14 - 1.75 * distanceKm)`, Experience `max(0, 14 - 1.25 * distanceKm)`. Geçerli koordinat ve konumsuz A çıktıları, değişiklik öncesi tam JSON referansıyla birebir korunur.

`nearby` (B2) yalnız mesafe katkısını `-2 * distanceKm` ile **değiştirir**; A bonusuyla toplanmaz, clamp/yarıçap kapısı/nearest-first sıralama eklenmez. Uzak adaylar uygundur. Experience ana-ilgi önceliği seçili havuzda skordan önce kalır; Place'e yeni hard interest tier eklenmez. Diğer skorlar, uygunluk, seed, önceki batch, fallback, çeşitlilik ve gerekçeler korunur. Event/Fikir skor yolları policy tüketmez; açık Event/Fikir sonuçları aynıdır. Karma akışta Experience/Place skorlarının değişmesi türlerin görünür dağılımını değiştirebilir.

Geçersiz/eksik origin veya aday koordinatı motor içinde konumsuz değerlendirilir; mesafe alanı `undefined`, mesafe katkısı 0'dır. Bu skor güvenlik sınırı GPS/izin/tazelik davranışı veya uygunluk kapısı değildir. Önceden uygulama preflight'ı origin'i koruyordu; doğrudan geçersiz engine girdileri artık NaN skoru üretemez. Geçerli hesaplamada mevcut great-circle formülü aynen kullanılır.

`recommendExperiencesForPlace` policy girdisini public tipinden çıkarır ve runtime'da A'yı zorlar; detail'e Home policy yayılmaz. Mevcut uygulama çağrıları değiştirilmemiştir; B2 production UI'dan erişilemez. UI, konum edinimi ve A/B2 Home snapshot sahipliği ayrı PR kapsamıdır. Ölçüm tanımları, 16-batch ödünleşimleri ve doğrulama: [PROXIMITY_ENGINE_B2_REPORT.md](PROXIMITY_ENGINE_B2_REPORT.md).

## Çağrı ve sunum sınırı

App.tsx mevcut sonuç çağrısı `recommendAll(... limit: 5)` kullanır. `recommendExperiences` ve `recommendPlaces` ayrı export edilir. Fikir yardımcı fonksiyonu dosya içindedir; etkinlik sıralaması recommendAll içindedir. Eski sohbetlerde geçen bağımsız `recommendEvents()` çağrısı mevcut public API değildir.

Yeni ana sayfanın bir ana plan + dört alternatif sunumu aynı Experience beşlisini kullanmalıdır. Sana göre önizlemeleri için ayrı katman çağrıları gerekir; maket bunu otomatik olarak uygulamış sayılmaz. İlgili çağrı değişikliğinde sıralama, filtre ve keşif davranışı korunmalıdır.

## Veri güvenilirliği

Stable ID ve cityId korunur. Experience.points[].placeId mekân-plan ilişkisidir. Başlık eşleştirmesi kullanılmaz. Koordinatı olmayan etkinliğe mesafe, saat verisi olmayan mekâna Şimdi açık etiketi üretilmez. Kaynak, doğrulama tarihi ve yaşam döngüsü gerçek veri olmalıdır. Yerel/kayıtlı/remote katalog ayrımı ve runtime validation FIREBASE_RUNBOOK ile birlikte değerlendirilir.

Fikir metadatası filtre veya skor davranışını henüz değiştirmez. Yeni alanlar gelecekteki uygunluk/editorial seçim için saklanır; ranking bunları tüketmeye başladığında ağırlık, hard-filter, açıklama ve fallback etkisi ayrı ürün kararı ve regresyon testi gerektirir. Batch A, B ve final planlı Batch C bu nedenle mevcut 1+4 keşif kotasını, skor ağırlıklarını, çeşitlilik cezasını ve rotasyonu değiştirmez.

## Değişiklikte kabul kriterleri

#21, `recommendExperiencesForPlace(place, options)` ekledi. Önce seçili Place'in merkezi politikaya göre uygunluğunu doğrular, cityId ve points[].placeId ile adayları daraltır, sonra aynı Experience uygunluk ve sıralama yolunu kullanır. Ana feed'in ilk beşinden sonradan seçim yapılmaz. Ayrıntı: docs/PLACE_RELATED_PLANS.md.

İlgi/süre/gizleme/son kullanma sınırları; aynı seed ile tekrar üretilebilirlik; küçük havuz fallback'i; tür başına gerekçe; Fikir kotası; ana/ikincil ilgi önceliği ve eski kayıtların korunması ilgili testlerde kontrol edilir. Test sonucu commit ve komutla STATUS'a kaydedilir. Tarihî stres sayıları yeni sürümün başarı kanıtı değildir.
