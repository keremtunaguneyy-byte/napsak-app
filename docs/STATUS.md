# N’apsak — Durum ve sıradaki iş

Kontrol tarihi: 18 Eylül 2026. Bu bir yayına hazır olma raporu değildir.

## Devam eden çalışma — Fikir Mimarisi + Batch A

- `codex/idea-architecture-batch-a` dalı, fetch sonrası doğrulanan `origin/main` commit'i `8f15ad34552a7b92c14853fb3ea394814797c7e0` üzerinden ayrı bir worktree'de açıldı.
- Fikir modeli; family, yapılandırılmış süre, setting, planning mode, ana/ikincil ilgi, context tag ve kontrollü requirement alanlarını atomik ve legacy-uyumlu biçimde destekliyor. `contextTags: family` ayrı bir kanıtsız suitability alanı eklemeden aile bağlamını taşır.
- Mevcut 52 Fikir değiştirilmeden yüklenmeye devam eder. Batch A kısa süre, solo, ev, çift/date, harcamasız, kötü hava ve düşük sürtünme önceliğiyle 34 tam yapılandırılmış Fikir ekler; toplam 86 Fikir olur. Kalan araştırma havuzu Batch B/C için editoryal incelemeye bırakılır.
- Yeni 34 kaydın family dağılımı: 8 pair-date, 7 home-bad-weather, 4 creative-art, 4 solo-reset, 2 active-movement, 2 food-cooking, 2 outdoor-neighborhood ve kalan beş family'de birer kayıt. Kategori/ana ilgi dağılımı 19 Sanat, 5 Doğa, 5 Lezzet, 4 Etkinlik ve 1 Kahve'dir.
- Yeni kayıtlarda maksimum süre dağılımı 4×30 dakika veya altı, 21×31–60, 7×61–120 ve 2×121+ dakikadır. 25 kayıt no-spend, 20 bad-weather, 16 limited-time ve 15 low-energy bağlamını taşır; 22 kayıt spontaneous'dır.
- `actionUrl`/`actionLabel` çifti opsiyonel oldu. Yeni 34 Fikir dış platforma bağımlı değildir; mevcut 52 yararlı URL korunur. URL'siz Fikirlerde arayüz dış eylem butonu göstermez.
- Yeni kayıtlar mevcut 52 kaydın başlıklarından bağımsız olarak kullanıcı eylemi üzerinden editoryal karşılaştırıldı. Yürüyüş, fotoğraf, müzik, pişirme karşılaştırması ve platform keşfi yakınlıkları özellikle incelendi; güvenilmez bir otomatik semantik-benzerlik kapısı eklenmedi. Deduplikasyon yine insan editoryal değerlendirmesi içerdiği için sonraki batch'lerde aynı kontrol tekrarlanmalıdır.
- Katalog/schema/cache sürümleri sırasıyla `2026-09-18.4`, v3 ve v3 olur. Yeni metadata şimdilik editoryal-only'dir; öneri ağırlıkları, hard filtreler, sıralama, 1+4 keşif kotası, çeşitlilik, rotasyon ve gerekçe davranışı değişmez.
- Güncel doğrulamada diff kontrolü, typecheck, 95 ana/release testi, 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality, Event Catalog Health ve release baseline kontrolleri geçti. Son 5.000 çağrılık performans p95'i 6,341 ms ile 25 ms bütçesinin altında kaldı. URL'siz Fikir kartının gerçek cihaz/manual doğrulaması yapılmadı.

## Devam eden çalışma — Ankara Experience Batch #4

- `codex/ankara-experience-batch-4` dalı, fetch sonrası doğrulanan `origin/main` commit'i `74b2de3f430147bf33babf2d165ce11fa5dcdbac` üzerinden ayrı bir worktree'de açıldı.
- Mevcut Place kayıtlarına bağlı 10 lifecycle-safe evergreen Experience eklendi: Eymir’i Bisikletle Dolaş; AOÇ’nin Kuruluş Hikâyesini Arazide İzle; Nallıhan’da Göç Yolunu Gözle; Sakarya Muharebesi’ni Araziden Oku; Boğaziçi’nde Ulus Öğle Ritüeli; Aspava’nın İkram Ritüelini Yaşa; PTT Pul Müzesi’nde Bir Dönemi Pullardan Oku; Çengelhan’da Bir Teknolojinin İzini Sür; Arslanhane’den Alaaddin’e Selçuklu Ankara’sı; BELPA’da İlk Açık Buz Seansına Gir.
- BELPA, 2026 tarihli resmî ABB duyurularının halka açık 40 dakikalık seansları doğrulaması nedeniyle verify kapısını geçti. Experience güncel seans kontrolü ister; paten kiralama, eğitim, yaş sınırı veya rezervasyon vaat etmez.
- Üç verify-gated aday ertelendi: İş Bankası + Ziraat eşleştirmesinde Ziraat'ın güncel Türkçe ve İngilizce resmî sayfaları açık/kapalı durumu konusunda çelişiyor; MTA için güncel halka açık giriş ve saat semantiği yeterli değil; Feza Gürsey için bulunan operasyonel kanıt eski ve sıradan bireysel ziyaret ile programlı etkinlik ayrımını güvenle kurmuyor.
- Ham `yilmaz-guney-sahnesi` Place kaydı kaldırıldı. Repository genelinde bağlı Experience, Guide, Idea, cache veya migration bağımlılığı bulunmadı; kalan test referansları yalnız hard-exclusion regresyonunu doğruluyor ve eski kaydedilmiş ID mevcut fail-closed çözümlemeyle sonuç üretmiyor. Kod tabanlı ID/ad/alias hard-exclusion guard'ı korundu ve runtime katalog doğrulaması artık canonical ID dahil bütün yeniden içe aktarma biçimlerini reddediyor; compatibility tombstone tutulmadı.
- Place sayısı 154'ten 153'e, Experience sayısı 40'tan 50'ye çıktı; embedded katalog sürümü `2026-09-18.3` oldu. Schema/cache sürümü v2 olarak kaldı.
- Experience ana kategori dağılımı 23 Sanat, 12 Doğa, 8 Lezzet, 4 Kahve ve 3 Etkinliktir. Maksimum süreye göre dağılım 6×30–60, 21×61–120, 17×121–240 ve 6×241+ dakikadır. Ankara–Nallıhan ve Ankara–Polatlı ulaşımı ilgili Experience sürelerine dahil edilmedi.
- Sabit recommendation-quality matrisinde toplam uygun aday 511'den 528'e çıktı; sıfır/kısmi/tam beşli sayıları 0/1/14 ve ilk grup sonucu 71 olarak kaldı. Ortalama kategori çeşitliliği 2,533'te kaldı, uygulanabilir ilçe çeşitliliği 2,400'den 2,333'e indi; tekrarlanan ID 58'den 57'ye ve tekrarlanan slot 74'ten 71'e indi. Yaşam döngüsü sızıntısı, deterministik tekrar ve objektif invariant hatası 0 kaldı.
- Öneri ağırlıkları, hard filtreler, sıralama, çeşitlilik, rotasyon, kayıtlı durum davranışı, içerik yüzeyi ayrımı, UI, Firebase ve Event verisi değiştirilmedi. Bu veri/politika-sertleştirme çalışması production veya yayın onayı değildir.

## Devam eden çalışma — Ankara Content Batch #3

- `codex/ankara-content-batch-3` dalı, fetch sonrası doğrulanan `origin/main` commit'i `0aa2ba8e302106ef44aff7af93589fd5bbec4986` üzerinden ayrı bir worktree'de açıldı.
- Ankara Palas Müzesi, Gökyay Vakfı Satranç Müzesi, Old School Roastery Bahçelievler, Hanem Fırın Eryaman, Bolu Akın Lokantası Etlik Eski Garajlar, Urumçi Uygur Restaurant Ön Cebeci, Cin Ali Müzesi ve Ka Cinnah sekiz yeni `active` Place olarak eklendi. Adres, temel saat/fiyat, şube kimliği ve koordinat kanıtı resmî/operatör ve harita kaynaklarıyla ayrı provenance girdilerinde tutuldu; doğrulanmayan opsiyonel zenginleştirmeler eklenmedi.
- Sekiz lifecycle-safe evergreen Experience eklendi: Hanem — Konya Sofrası; Bolu Akın — Eski Garajlar’da Tencere Yemeği; Urumçi — Ön Cebeci’de Uygur Sofrası; Old School — İki Demleme Karşılaştır; Cin Ali — Aynı Çizgide İki Kuşak; Gökyay — Satranç Taşlarının Dünyasını Oku; Ankara Palas + II. TBMM — Cumhuriyetin İki Sahnesi; Ka — Bir Fotoğraf Sergisini Yavaş Oku.
- Old School planı resmî tadım/atölye ürünü değil, güncel menüde iki uygun demleme varsa ziyaretçinin ayrı siparişlerle yapacağı editoryal eylemdir. Ka planı belirli veya kalıcı bir sergi vaat etmez ve kitaplık üyeliği içermez. Ankara Palas + II. TBMM eşleştirmesi iki faal kurumun salı–pazar 09:00–17:00 ortak ziyaret penceresine bağlıdır.
- Cin Ali canlı ziyaret sayfasındaki 250 TL ile indekslenmiş 300 TL tam bilet farkı kesin tarife yerine orta fiyat bandı ve kontrol notuyla korundu. Ka için batch brief'teki 11:00 açılış ile canlı resmî sitedeki 10:00 açılış farkı provenance ve ziyaret notunda açıkça tutuldu.
- Müze Evliyagil, Golden Chef/No24 Experience'ları ve diğer HOLD/VERIFY adayları eklenmedi. Mevcut Golden Chef ve No24 Place kayıtlarına dokunulmadı.
- Place sayısı 146'dan 154'e, Experience sayısı 32'den 40'a çıktı; embedded katalog sürümü `2026-09-18.2` oldu. Schema/cache sürümü v2 olarak kaldı.
- Sabit recommendation-quality matrisinde toplam uygun aday 481'den 511'e, ilk grup sonucu 69'dan 71'e ve tam beşli senaryo 13'ten 14'e çıktı; sıfır sonuç 0 kaldı, kısmi sonuç 2'den 1'e indi. Ortalama kategori çeşitliliği 2,600'den 2,533'e, uygulanabilir ilçe çeşitliliği 2,533'ten 2,400'e indi. Yaşam döngüsü sızıntısı, deterministik tekrar ve objektif invariant hatası 0 kaldı.
- Öneri ağırlıkları, hard filtreler, sıralama, çeşitlilik, rotasyon, kayıtlı durum davranışı, içerik yüzeyi ayrımı, UI, Firebase ve Event verisi değiştirilmedi. Bu veri-only çalışma production veya yayın onayı değildir.

## Devam eden çalışma — Ankara Content Batch #2

- `codex/ankara-content-batch-2` dalı, fetch sonrası doğrulanan `origin/main` commit'i `3f5237c24e25cf806d58ebc54823ec2e4309f357` üzerinden ayrı bir worktree'de açıldı.
- Faaliyeti sona eren Kartaltepe Macera Parkı (`macera-parki`) katalogdan kaldırıldı; repository genelinde kalan bağlı Experience, Guide, Idea, test, fixture veya migration referansı bulunmuyor. Eski kaydedilmiş kimlikler mevcut fail-closed çözümleme davranışıyla sonuç üretmiyor.
- Da Vinci Board Game Cafe Neorama, Keçiören Deniz Dünyası, Tragos Boulder & Outdoor, No24 Studio Ümitköy ve Golden Chef Mutfak Akademisi Çayyolu doğrulanmış beş yeni `active` Place olarak eklendi. Resmî kaynak, proje sahibinin birinci elden sağladığı operasyonel bilgi ve harita pini kaynağı yapılandırılmış provenance alanında birbirinden ayrıldı; doğrulanmayan zenginleştirmeler eklenmedi.
- Yalnız gerçeğe uygun yaşam döngüsü kurulabilen Da Vinci, Deniz Dünyası ve Tragos için üç evergreen, tek duraklı Experience eklendi. Tragos satın alma sonrası planlanan tanıtım dersi olarak `reservation: required`; satın alma garantili seans gibi sunulmuyor. No24 ve Golden Chef için doğrulanmış tarihe/seansa bağlı kayıt olmadan Experience üretilmedi.
- Place sayısı 142'den 146'ya, Experience sayısı 29'dan 32'ye çıktı; embedded katalog sürümü `2026-09-18.1` oldu. Eklemeli/opsiyonel provenance alanı nedeniyle schema/cache sürümü v2 olarak kaldı.
- Sabit recommendation-quality matrisinde toplam uygun aday 467'den 481'e çıktı; sıfır sonuç 0, kısmi sonuç 2 ve tam beşli senaryo 13 olarak kaldı. Kategori çeşitliliği değişmedi; ortalama uygulanabilir ilçe çeşitliliği 2,600'den 2,533'e indi. Objektif invariant, yaşam döngüsü sızıntısı ve deterministik tekrar hatası 0 kaldı.
- Güncel doğrulamada diff kontrolü, typecheck, 91 ana test, 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality ve release kontrolleri geçti. 5.000 çağrılık performans p95'i 5,430 ms ile 25 ms bütçesinin altında kaldı; veri-only değişiklik için cihaz testi yapılmadı.
- Öneri ağırlıkları, hard filtreler, sıralama, çeşitlilik, rotasyon, kayıtlı durum davranışı, içerik yüzeyi ayrımı, UI, Firebase ve Event verisi değiştirilmedi. Sekiz bilinen yayın engeli açık kalır; bu çalışma production veya yayın onayı değildir.

## Devam eden çalışma — Event Freshness Refresh #1

- `codex/event-freshness-refresh-1` dalı, doğrulanmış GitHub/local/origin `main` commit'i `144993d19c19c87b5f89e98cfa89860337897c5c` üzerinden açıldı.
- 10–20 Eylül tarihli 12 eski Event kaydı kaldırıldı; farklı gerçek etkinlik kimlikleri için eski ID yeniden kullanılmadan 21 Eylül–16 Ekim tarihli 12 yeni Ankara Event kaydı eklendi. Embedded katalog sürümü `2026-09-16.3` oldu; schema/cache sürümü v2 olarak kaldı.
- 16 Eylül 2026 yerel kontrolünde yaklaşan Event sayısı 4'ten 12'ye, süresi geçmiş kayıt sayısı 8'den 0'a, eski doğrulama sayısı 12'den 0'a çıktı. Bütün yeni kayıtlar 16 Eylül'de canlı Bubilet etkinlik/seans sayfalarından doğrulandı; ileri tarih ufku kontrol anında yaklaşık 30 gündür.
- Son Event başlangıcı `16 Ekim 2026 20:30 TRT` olduğundan, yeni bir yenileme yapılmazsa mevcut başlangıç-zamanı yaşam döngüsüne göre Event yüzeyi tam o anda sıfıra iner.
- Kategori karışımı 5 Sanat, 4 Etkinlik ve 3 Lezzet; fiyat seviyesi karışımı 1×₺, 6×₺₺ ve 5×₺₺₺'tür. Katalog; spor, tiyatro/komedi, konser, mutfak atölyesi, bilgi yarışması, aile gösterisi ve festival içerir.
- Sabit recommendation-quality matrisinde yaklaşan Event havuzu 14 Eylül kontrolünde 4'ten 12'ye, 21 Eylül kontrolünde 0'dan 11'e çıktı. Toplam uygun aday 448'den 467'ye, ilk grup sonucu 63'ten 69'a, tam beşli senaryo 11'den 13'e çıktı; sıfır sonuç 1'den 0'a indi. Objektif invariant hatası ve yaşam döngüsü sızıntısı 0 kaldı.
- Güncel doğrulamada diff kontrolü, typecheck, 89 ana test, 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, Event Catalog Health ve recommendation-quality objektif invariantları geçti. 5.000 çağrılık performans p95'i 5,164 ms ile 25 ms bütçesinin altında kaldı; UI değişmediği için cihaz testi gerekmedi.
- Öneri ağırlıkları, filtreler, uygunluk/yaşam döngüsü semantiği, çeşitlilik, rotasyon, UI, Firebase, Experience ve Place verisi değiştirilmedi. `EVENT_OPERATIONS_RUNBOOK.md` sözleşmesi değişmedi.

## Devam eden çalışma — Evergreen Content Batch #1

- `codex/evergreen-content-batch-1` dalı, #43 sonrası doğrulanmış `main` commit'i `8be4afb06209d4aa2959a387a8e47054319610b1` üzerinden açıldı.
- Onaylı dokuz evergreen Experience tek duraklı/destinasyon kapsamıyla eklendi; yapay ek durak, conditional veya event-linked kayıt eklenmedi.
- NO29 Dükkan Coffee, proje sahibi tarafından doğrulanan tek Çayyolu konumuyla `active` Place olarak eklendi. Fiyat seviyesi, en yüksek restoran katmanından ayrılarak güncel 0–3 katalog ölçeğinde `2`; kart metni yaklaşık menü fiyatı, sınırsız çalışma, sessizlik veya masa garantisi iddia etmiyor.
- Place sayısı 141'den 142'ye, Experience sayısı 20'den 29'a çıktı; embedded katalog sürümü `2026-09-16.2` oldu. Schema/cache sürümü v2 olarak kaldı.
- Öneri ağırlıkları, filtreler, çeşitlilik, rotasyon, UI, Firebase, conditional aktivasyon ve event-linked davranış değiştirilmedi.
- Güncel doğrulamada typecheck, 89 ana test, 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu ve recommendation-quality objektif invariantları geçti. 5.000 çağrılık performans p95'i 5,191 ms ile 25 ms bütçesinin altında kaldı; cihaz doğrulaması gerektiren bir UI davranışı değişmedi.

## Son güncelleme — içerik uygunluğu / yaşam döngüsü altyapısı #43 ile main'de

- #43, `8be4afb06209d4aa2959a387a8e47054319610b1` ile main'e alındı.
- Place için `active | deprecated | verification_required`, Experience için `evergreen | conditional | event_linked` sözleşmesi ve merkezi dependency-aware uygunluk politikası uygulandı. Conditional davranış fail-closed; #43 yeni Experience kaydı eklemedi.
- Kronotrop Tunalı ve eski Ankara Sanat Tiyatrosu deprecated, Coffee Lab Bilkent verification-required olarak işaretlendi. Yılmaz Güney Sahnesi kod politikasıyla hard-excluded; ham katalog tombstone'u remote envanter/migration güvenliği için korunuyor fakat public çözümleme ve bağlı planlardan çıkarılıyor.
- Katalog schema ve cache namespace v2'ye yükseltildi. Firestore'dan birleştirilen snapshot tam katalog doğrulamasından geçmeden kabul edilmiyor; migration dry-run remote status/hard-exclusion envanterini yalnız raporluyor.
- #43 doğrulamasında typecheck, ana testler, catalog doğrulaması, 2.560 Place + 640 Experience stres senaryosu, recommendation-quality ve 5.000 çağrılık performans bütçesi geçti. Bunlar birleşen PR'ın repository kanıtıdır; cihaz veya production kanıtı değildir.

## Son güncelleme — EAS build yapılandırması oluşturuldu

- Kalıcı Android application ID ve iOS bundle identifier kullanıcı tarafından `com.getnapsak` olarak onaylandı ve Expo config'e işlendi.
- Repository, authenticated `eas project:info` ile `@napsaks-team/napsak-app` projesine bağlandı; project ID `af043dd8-412f-403e-81c3-6e0af8e024d6` eşleşti. `eas_project_id_unverified` kapatıldı.
- Android/iOS söz dizimi denetimi iki segmentli geçerli kimlikleri kabul eder; bu yalnız config söz dizimi kanıtıdır. İmzalı artifact ve mağaza kimliği kanıtları bulunmadığı için `android_package_unverified` ve `ios_bundle_identifier_unverified` açık kalır.
- `eas.json` oluşturuldu. EAS CLI alt sınırı `>= 24.3.0`, app version kaynağı `remote`; `development`, `preview` ve `production` build profilleri mevcut, production profili `autoIncrement: true` kullanıyor.
- `submit.production` yalnız boş bir yerel config placeholder'ıdır; store bağlantısı veya submission kanıtı değildir. `expo-dev-client` henüz kurulu değildir.
- EAS build çalıştırılmadı. Android keystore, Apple certificate veya provisioning profile oluşturulmadı; signing ve store submission yapılandırması/kanıtı yoktur. Toplam sekiz yayın engeli, Android ve iOS kimlik engelleri dâhil, açık kalır.

## Önceki güncelleme — #34–#37 main'de; cihaz kabul hazırlığı tanımlandı

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

- Çalışma başlangıcında doğrulanan GitHub main: `8be4afb06209d4aa2959a387a8e47054319610b1` (`Add content eligibility and lifecycle infrastructure`, #43). Aşağıdaki #19–#37 listesi tarihsel özet olup sonraki workflow/EAS/quality PR'larının eksiksiz dökümü değildir.
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
| Yayın/rollback | #35 main'de; otomatik engel envanteri, strict production kapısı ve geri dönüş runbook'u kodda uygulanmış ve test edilmiş; production onayı değildir | Aşağıdaki sekiz açık engelin gerçek değer ve dış kanıtlarla kapatılması |

#26'nın env'siz telefon testinde yerel silme ve yeniden kalıcılık kanıtlandı. Gerçek Firestore/Auth silme kanıtı development Firebase projesi bağlandıktan sonra ayrıca alınmalıdır.

## Açık sekiz yayın engeli

Bu liste `RELEASE_RUNBOOK.md`, `release-readiness.json` ve `scripts/checkReleaseReadiness.ts` ile karşılaştırılmıştır. #35 bu engelleri görünür ve denetlenebilir yaptı. 14 Eylül'deki authenticated EAS kanıtıyla yalnız `eas_project_id_unverified` kapatıldı.

| Engel adı | Güncel durum |
|---|---|
| `android_package_unverified` | Açık — config onaylı ve söz dizimi geçerli; imzalı artifact ve Google Play kimliği kanıtı bekleniyor |
| `ios_bundle_identifier_unverified` | Açık — config onaylı ve söz dizimi geçerli; Apple bundle/imzalı artifact ve App Store Connect kanıtı bekleniyor |
| `privacy_policy_url_unverified` | Açık |
| `production_firebase_unverified` | Açık |
| `production_sentry_unverified` | Açık |
| `release_device_matrix_unverified` | Açık |
| `restore_drill_unverified` | Açık |
| `support_url_unverified` | Açık |

## Sıradaki işler — bağımlılığa göre

### Dış hesap veya erişim gerektirenler

- İmzalı artifact'lerde Android application ID ve iOS bundle identifier eşleşmesini kanıtlamak; erişilebilir olduğunda Google Play ve App Store Connect kimlik kanıtlarını kaydetmek.
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
