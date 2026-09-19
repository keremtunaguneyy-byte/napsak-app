# N’apsak — Öneri ve İçerik Sözleşmesi

16 Eylül 2026. Kod dayanağı: src/contentPolicy.ts, src/recommendations.ts, src/recommendationQuality.ts, src/domain.ts, src/resultFilters.ts, src/data/* ve tests/domain.test.cjs. Ürün ilkeleri PRODUCT_SPEC §4–8. Bu belge yeni algoritma uygulamaz.

## Katmanlar

| Katman | Uygunluk ve sıralama |
|---|---|
| Experience | Önce merkezi içerik politikası uygulanır: bütün bağlı Place kayıtları uygun olmalı; `conditional` fail-closed, `event_linked` ise bağlı Event yaklaşan ve geçerli olmalıdır. Sonra gizlenen, süreye sığmayan ve açık ilgiyle eşleşmeyen adaylar elenir. Ana/ikincil ilgi ayrımı, mod, bütçe, grup, başlangıç mesafesi, editoryal kalite, güven, güncellik ve seed sinyalleri kullanılır. |
| Mekân | Yalnız `active` ve hard-exclusion politikasına takılmayan kayıtlar sıralamaya girer. Sonra gizlenen ve açık ilgiyle eşleşmeyen adaylar elenir. Mod, bütçe, grup ve mesafe sıralama sinyalidir; mesafe kesin yarıçap filtresi değildir. |
| Fikir | Açık Fikir sekmesinde standart beşli için bir ilgili + dört seçili ilgilerden bağımsız keşif hedeflenir. Yetersiz havuzda kontrollü fallback vardır. Karma akış ile açık Fikir sekmesi aynı davranış değildir. Batch A ve B'nin `ideaFamily`, yapılandırılmış süre, setting, planning mode, ana/ikincil ilgi, context tag ve requirement alanları bu aşamada editoryal metadatadır; sıralama hâlâ legacy kategori/mod/ilgi/bütçe/grup sinyallerini kullanır. |
| Etkinlik | Geçersiz/geçmiş başlangıç zamanı ve gizlenenler elenir. Açık Etkinlik sekmesinde ilgi sıralama sinyalidir; karma akışta ayrıca ilgi uygunluğu uygulanır. |

Experience ana ilgi eşleşmesi ikincil eşleşmeye göre önceliklidir. Kategori/ilçe yığılması azaltılır; önceki gruptan kaçınma ve deterministik seed vardır. Küçük havuzda tekrar mümkün olduğundan “daima beş tamamen yeni sonuç” vaat edilmez. Gerekçe gerçek eşleşmeyi anlatmalıdır.

## Merkezi içerik uygunluğu

`src/contentPolicy.ts` öneri, public çözümleme ve kalite ölçümü için tek politika sınırıdır. Uygunluk skordan önce uygulanır; kayıtlı olma durumu sıralamayı etkilemez. `deprecated` ve `verification_required` Place önerilmez, fakat hard-exclusion dışında kalan deprecated kayıtlar eski kaydetmeleri çözümlemek için ham katalogda kalır. Yılmaz Güney Sahnesi ham embedded katalogdan kaldırılmıştır ve kimlik/ad/alias normalizasyonuyla kodda hard-excluded kalır; eski kaydedilmiş kimlik çözülmez. Canonical ID veya bilinen alias ile remote katalogdan yeniden içe aktarma runtime doğrulamasında reddedilir; ona bağlanan Experience da kabul edilmez.

Event başlangıcı zaman tabanlı uygunluğun sınırıdır. Uygulama en yakın gelecek Event sınırında ve foreground'a döndüğünde saati yeniler; `event_linked` kayıtlar eksik/geçersiz/başlamış Event için fail-closed davranır. `conditional` semantiği ayrıca onaylanana kadar hiçbir conditional kayıt önerilemez; bu PR conditional veya event-linked katalog kaydı eklemez.

## Çağrı ve sunum sınırı

App.tsx mevcut sonuç çağrısı `recommendAll(... limit: 5)` kullanır. `recommendExperiences` ve `recommendPlaces` ayrı export edilir. Fikir yardımcı fonksiyonu dosya içindedir; etkinlik sıralaması recommendAll içindedir. Eski sohbetlerde geçen bağımsız `recommendEvents()` çağrısı mevcut public API değildir.

Yeni ana sayfanın bir ana plan + dört alternatif sunumu aynı Experience beşlisini kullanmalıdır. Sana göre önizlemeleri için ayrı katman çağrıları gerekir; maket bunu otomatik olarak uygulamış sayılmaz. İlgili çağrı değişikliğinde sıralama, filtre ve keşif davranışı korunmalıdır.

## Veri güvenilirliği

Stable ID ve cityId korunur. Experience.points[].placeId mekân-plan ilişkisidir. Başlık eşleştirmesi kullanılmaz. Koordinatı olmayan etkinliğe mesafe, saat verisi olmayan mekâna Şimdi açık etiketi üretilmez. Kaynak, doğrulama tarihi ve yaşam döngüsü gerçek veri olmalıdır. Yerel/kayıtlı/remote katalog ayrımı ve runtime validation FIREBASE_RUNBOOK ile birlikte değerlendirilir.

Fikir metadatası filtre veya skor davranışını henüz değiştirmez. Yeni alanlar gelecekteki uygunluk/editorial seçim için saklanır; ranking bunları tüketmeye başladığında ağırlık, hard-filter, açıklama ve fallback etkisi ayrı ürün kararı ve regresyon testi gerektirir. Batch A ve B bu nedenle mevcut 1+4 keşif kotasını, skor ağırlıklarını, çeşitlilik cezasını ve rotasyonu değiştirmez.

## Değişiklikte kabul kriterleri

#21, `recommendExperiencesForPlace(place, options)` ekledi. Önce seçili Place'in merkezi politikaya göre uygunluğunu doğrular, cityId ve points[].placeId ile adayları daraltır, sonra aynı Experience uygunluk ve sıralama yolunu kullanır. Ana feed'in ilk beşinden sonradan seçim yapılmaz. Ayrıntı: docs/PLACE_RELATED_PLANS.md.

İlgi/süre/gizleme/son kullanma sınırları; aynı seed ile tekrar üretilebilirlik; küçük havuz fallback'i; tür başına gerekçe; Fikir kotası; ana/ikincil ilgi önceliği ve eski kayıtların korunması ilgili testlerde kontrol edilir. Test sonucu commit ve komutla STATUS'a kaydedilir. Tarihî stres sayıları yeni sürümün başarı kanıtı değildir.
