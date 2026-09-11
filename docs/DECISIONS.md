# N’apsak — Yeni karar kayıtları

Önceki tarihli kararların aslı PRODUCT_SPEC.md §15'te korunur. Karar durumu öneri / onaylı / uygulanmış olarak; kanıt seviyesi ise repository veya kodda mevcut / otomatik veya manuel test edilmiş / gerçek production ortamında doğrulanmış olarak ayrı kaydedilir. Bir kararın uygulanmış olması test edildiğini, test edilmiş olması da production ortamında doğrulandığını otomatik olarak göstermez.

## 2026-09-10 — #37 sonrası release yönetişimi durum eşitlemesi

Bu kayıt yeni ürün veya mimari kararı değildir; main'deki mevcut kanıt seviyelerini ayırır.

- #35 release gate/readiness/rollback yönetişimini kodda uyguladı ve otomatik kontrollerle test etti. Production onayı değildir ve dokuz açık yayın engelinden hiçbirini kapatmadı.
- #36 yalnız proje hafızası/dokümantasyon senkronudur; uygulama davranışı veya ürün kararı eklemedi.
- #37 cihaz kabul sözleşmesini ve kanıt biçimini repository'de tanımladı. İmzalı release build ile gerçek cihaz kabulü yapılmadı; `release_device_matrix_unverified` açık kaldı.

## 2026-09-08 — Performans iddiası ölçüm katmanına göre yapılır

Durum: #34 ile main'e alındı: `839a17945b97372a599ffba3df34351f125c08b6`.

Saf öneri motoru 5.000 çağrılık p95 benchmarkıyla ve geçici 25 ms CI bütçesiyle korunur. Uygulama açılışı ve öneri hesaplama örnekleri yalnız kaba süre kovalarına dönüştürülür; ham süre, kullanıcı bağlamı, içerik veya cihaz kimliği analitik olaya girmez. Expo development açılışı release performansı sayılmaz. Gerçek release cihaz p50/p95'i ayrıca ölçülmeden uygulama açılışının hızlı olduğu ilan edilmez.

Yayın hazırlığı iki ayrı denetimdir: normal CI bilinen engel listesinin sessizce değişmediğini kontrol eder; strict production kapısı tek bir engel varken bile başarısız olur. `release-readiness.json` onay değil, görünür teknik borç envanteridir. Paket/bundle kimlikleri, EAS projesi ve dış hizmet kanıtları gerçek değerler olmadan uydurulmaz. Rollback; içerik, kural, binary ve veri olayları için ayrı prosedür izler.

## 2026-09-08 — Erişilebilirlik davranışı sürekli kalite kapısıdır

Durum: #33 ile main'e alındı; kullanıcı TalkBack telefon testini doğruladı.

Etkileşimli öğelerin rolü, görsellerin anlamlı etiket/dekoratif ayrımı, başlık semantiği ve temel 44 px dokunma hedefleri kaynak denetimiyle her PR'da korunur. Seçili, pasif, meşgul, genişletilmiş ve ilerleme durumları yalnız renk veya simgeyle aktarılmaz. Otomatik kaynak kontrolü gerçek TalkBack/VoiceOver testinin yerine geçmez.

## 2026-09-08 — Firestore restore yalnız ayrı recovery projesine

Durum: #32 ile main'e alındı; gerçek bulut provası bekliyor.

Production managed export açık proje ve bucket onayı ister. Restore, aynı kimlikteki belgelerin üstüne yazabildiği için production hedefi kabul edilmez; yalnız kaynak projeden farklı, boş ve atılabilir bir recovery projesine yapılır. Restore tamamlanmış sayılmadan operation success, katalog parity ve kullanıcı verisi kapsam kontrolü gerekir. Bu çalışma gerçek bucket, billing, IAM veya canlı restore kanıtı değildir.

## 2026-09-07 — Günlük etkinlik katalog sağlığı

Durum: #31 ile main'e alındı ve günlük workflow doğrulandı.

Etkinlik kataloğu her gün otomatik olarak en az 5 yaklaşan kayıt, en az 7 günlük ileri tarih ufku ve en fazla 7 günlük kaynak doğrulama yaşı için kontrol edilir. Otomasyon kaynaktan kendi başına etkinlik üretmez veya bir kaydı insan kontrolü olmadan yeniden doğrulanmış saymaz. Uygulamanın geçmiş etkinlikleri çalışma anında elemesi ayrı güvenlik katmanı olarak korunur. Kabul ölçütleri ve müdahale adımları `EVENT_OPERATIONS_RUNBOOK.md` içindedir.

## 2026-09-07 — N’apsak planlarını Google Maps rotasına bağlama

Durum: #30'da uygulandı ve telefonda doğrulandı.

Birden çok duraklı N’apsak planı, katalogdaki koordinat sırasını koruyan Google Maps yürüyüş rotası açar. Tek duraklı plan harita araması açar. Bağlantı gösterim adlarından veya kullanıcı konumundan üretilmez; planın doğrulanmış koordinatları kullanılır. Ana sonuç, Kaydedilenler ve plan detayı aynı davranışı sunar.

## 2026-09-07 — Kaydedilenlerde son eklenen önce

Durum: #29 ile main'e alındı: `711ead3f3a5d72acfaa2a99363d2cd235b2d79c9`; kullanıcı telefon testini doğruladı.

Kaydedilen bütün içerik türleri tek zaman sırasındadır; son kaydedilen en üstte görünür. Bir içerik çıkarılıp yeniden kaydedilirse yeniden listenin başına gelir. Türlere göre ayrı render blokları ve ilk kaydedilenin önde kalması, listenin sırasını anlaşılmaz gösteriyordu. Saklanan kimlik dizisinin kronolojisi korunur; sunumda ters çevrilip katalog, Ankara 101 rehberi ve yerel rota tek akışta çözülür. Veri migration'ı gerekmez.

## 2026-09-06 — Sohbetten bağımsız ortak proje hafızası

Durum: #20 ile main'e alındı: `fa0a0a64825d05842fc5fa856c5ccb9dd0f69945`.

Ürün, tasarım, algoritma, operasyon ve durum bilgisi aynı repo docs klasöründe birbirine bağlı tutulacak. Kullanıcı başka sohbete veya yapay zekâya geçtiğinde projeyi baştan anlatmak istemiyor. İlgili dosyalar START_HERE'de tanımlı. Tüm tarihî konuşmaların eksiksiz arşivlendiği iddia edilmeyecek.

## 2026-09-06 — Tasarım devri

Durum: Tasarım çalışması ayrı hatta sürüyor; repository'de güncel onaylı devir doğrulanamadığı için güncel devir bekleniyor.

Beğenilen ana sayfa yapısı ve N? logo geometrisi korunuyor; nihai palet açık. Mor/turuncu beğenisi renk kararı değildir. Kullanıcının karşılaştırmalı çok sayıda renk varyasyonu isteği DESIGN_SPEC'e işlendi. Önceki asistanın “yalnız iki varyasyon” önerisi bağlayıcı kullanıcı kararı değildir.

## 2026-09-06 — Ankara 101 durum düzeltmesi

Durum: #19 ile main'e alındı: `18f5172`; birleşik telefon testi doğrulandı.

Ankara 101 seçim ekranı, Ankara Klasikleri ve Bir Ankaralı Gibi akışları main'dedir. Bu uygulama ve telefon kanıtı nihai görsel tasarım onayı anlamına gelmez. Dosyalar: PRODUCT_SPEC, DESIGN_SPEC, STATUS.

## 2026-09-07 — Mekân-plan bağlantısı main'e alındı

Durum: uygulanmış ve temel telefon akışı doğrulanmış.

#21 `dcde744` ile main'e birleşti. Kullanıcı Göksu Parkı detayını, ilişkili planı, süre/bütçe/durak bilgisini ve gizle/geri al akışını telefonda doğruladı. Gönderilen görünüm nihai tasarım onayı değildir. #19 Ankara 101 akışları da main'e alınmış ve birleşik telefon testinde doğrulanmıştır.

## Açık kararlar

- Ana sayfanın nihai paleti, logo çizimi ve tasarım tokenları.
- Etkinlik sağlayıcısının uzun vadede elle editoryal katalog mu yoksa onaylı bir API mı olacağı.
- Gerçek development/production servis durumu ve bağımsız yedekleme düzeni.

Yeni kayıt şablonu: tarih / karar / durum / gerekçe / önceki kararın yerine geçiyor mu / etkilenen dosyalar / kabul kriteri / uygulama ve test kanıtı.
