# Gezek — Durum ve sıradaki iş

## 2026-10-09 — PR #69 Redmi corrections

Continuing existing Draft PR #69 on `codex/gezek-detail-plan-place` from verified clean local/remote head `3232de3179bb634ac2a22b6478d23b3dfd2f455e`. Removed visible Plan stable-ID chips; replaced Detail heart Save assets with user-approved navy/cobalt bookmarks (Figma component sync pending); deduplicated existing detail routes while preserving surviving scroll/focus; added 180 ms native snackbar exit with an unchanged eight-second undo cutoff and reduced-motion removal. No new branch/PR or merge.

Current correction validation and remaining Redmi acceptance are in `DETAIL_FLOW_PR1_IMPLEMENTATION_REPORT.md`. Native Redmi checks remain pending; browser evidence is not device or signed-release acceptance. Event/Idea, Onboarding, Saved redesign and Ankara 101 remain outside this task.

## Detail Flow PR 1 — 8 Ekim 2026

`codex/gezek-detail-plan-place`, fetch ile doğrulanan `origin/main` `c1426357ccd4df3ad7408aede9d8b2b77e0e344d` üzerinden açıldı. Onaylı Shared Detail Host + Plan/Place; exact ID/ordered stops, Home/Saved snapshot, nested Back/Close, conditional external actions, Hero resolver, exclusive save/dismiss ve 8 saniyelik undo uygulanır. Event/Idea ve diğer görsel migrasyonlar kapsam dışıdır. Güncel sözleşme `DETAIL_FLOW_PR1_CONTRACT.md`, komut/browser sonuçları ve bekleyen Redmi/TalkBack kabulü `DETAIL_FLOW_PR1_IMPLEMENTATION_REPORT.md` içindedir. Draft kalır; merge yapılmaz. Eski approval-pending Detail notları bu kullanıcı onayıyla geçersizdir.


## PR #68 Redmi smoke sonucu ve ertelenen işler — 8 Ekim 2026

- Kullanıcı no-regression smoke testini tamamladı: kartlar/eşlemeler doğru. Gezek→Mekân en yavaş geçiş; diğer geçişler daha hızlı ama hissedilir gecikme sürüyor. Merged Home baseline'a göre anlamlı subjektif iyileşme yok. Redundant render kaldırıldı; **native Redmi pause çözülmedi**.
- Değişmeyen `d06c4e3` head, başarılı CI, temiz worktree, mergeable state ve boş review/thread kayıtları doğrulandı. Kullanıcı bu sınırlı sonuç belgelenerek normal protected workflow ile ready/merge onayladı. Son dokümantasyon commit'inin CI sonucu ve merge/main SHA'sı GitHub/son raporda doğrulanır; ardından Detail Flow implementasyonundan önce durulur.
- Event kart gövdesi bugün `event.sourceUrl` açıyor. Dedicated Detail Flow PR'da internal Event Detail açmalı; kaynak/bilet bağlantısı explicit detail action olmalı. Bu PR'da routing değişmez.
- Home “Öneri gizlendi / Geri al” timeout'u yok. Planlanan 8 saniyelik auto-dismiss yeni dismissal ile resetlenmeli; undo/unmount/navigation ile temizlenmeli. Bu PR'da timer uygulanmaz.
- Idea native Alert kullanır; Experience, Place, Event ve Idea detail görselleri legacy olarak dedicated Detail Flow PR'ına ertelenir. Onboarding/edit, Saved ve Ankara 101 kapsam dışıdır. Ayrıntı `HOME_NATIVE_PERFORMANCE_REPORT.md` içindedir.

## Home kabulü ve native performance follow-up — 8 Ekim 2026

- Kullanıcı Redmi'de PR #67 Home görsel/etkileşim kabulünü tamamladı: status bar, background, dört filtre/eşleme, kartlar, save/dismiss/undo, detail/scroll dönüşü, Maps, alt nav, orientation ve persistence geçti. Bu kullanıcı tarafından bildirilen kabul; yeni agent/device veya signed-release ölçümü değildir.
- GitHub #67 head `f09c845974386480acd3ec7e4d243bbbd20f50fc`, reviews/threads boş ve iki CI başarılı. PR zaten kullanıcı tarafından 05:57:07 UTC'de merge edilmiş bulundu; agent yeniden merge etmedi. Güncel main `4f3a7206f444ce706328794f4cd2c022a8f0ef96` doğrulandı.
- Yeni `codex/gezek-home-native-performance` yalnız kalan filtre gecikmesinin tanısı içindir. Değişmeyen layout width setter'ı redundant Home render üretiyordu; width değişmedikçe setter artık çağrılmaz. Opt-in commit/frame-opportunity, SVG cache/element/mount tanısı hazırlanır. Native first paint ve Expo Go/preview farkı henüz ölçülmedi; USB cihaz zorunlu değildir.
- Experience, Place, Event, Idea, onboarding/edit, Saved ve Ankara 101 legacy UI olarak ayrı tasarım/implementasyon işlerine ertelendi. Algoritma/katalog/eşleme/persistence/Firebase/release config ve Home tasarımı değişmez. Ayrıntı `HOME_NATIVE_PERFORMANCE_REPORT.md` içindedir. Önceki #67 Draft/bekleyen kabul kayıtları aşağıda tarihsel olarak korunur.

## Command-center production Home — 8 Ekim 2026

- Kullanıcının onayladığı 2026-10-07 command-center paketi ve canlı Page 07 Home yeni görsel otoritedir; 6 Ekim kategori fallback sözleşmesinin yerine geçer.
- 384 sabit ID eşlemesi, 125 artwork ailesi / 375 responsive varyant, 46 contextual icon yerel production temelindedir. 12 proof ailesi ve final acoustic `810:102` canlı Figma'dan export edilmiştir.
- Hero/Square/Compact resolver, bağımsız kaydet/gizle quick action'ları, kart gövdesi eylemi, filtreye göre üçlü keşif ve tek `BrandLogo` uygulanmıştır. Algoritma, katalog, Firebase/persistence ve release yapılandırması korunur.
- Yerel otomatik ve RN Web kanıtı `COMMAND_CENTER_IMPLEMENTATION_REPORT.md` içindedir. Redmi, Android system-area/Back, TalkBack ve signed-release kabulü beklenir. Event freshness kontrolü origin/main ve bu dalda aynı çıktı/exit 1 ile başarısızdır; kullanıcı bu belgelenmiş baseline istisnasıyla commit/push onayladı. Bu işte içerik güncellenmez. PR #67 Draft ve unmerged kalır.


## Devam eden çalışma — Redmi Home integration stabilization / PR #67 (6 Ekim 2026)

- Aynı `codex/gezek-ui-foundation` dalında `b494ee7` head'i ve fetch sonrası `origin/main` `46c4115` doğrulandı. Mevcut Draft PR #67 sürdürülür; yeni PR, merge veya force-push yok.
- Home'daki **Planı incele** doğrudan Maps açıyordu. Artık seçilen Experience ID'siyle mevcut `PlaceDetails` plan görünümünü açar; harita ayrı açık eylemdir. Plan detail Figma `165:370` / Final Review `288:1575` mevcuttur; görsel implementasyonu details PR'ına kalır, burada restyle yapılmaz.
- 52 embedded Experience / 71 noktanın Place ID/ad/koordinat bağları ve URL sırası eşleşti. Map helper veya katalog değiştirilmedi. Redmi'deki alakasız hedef gözlemi henüz yeniden üretilmedi; seçilen plan ve Maps hedefiyle cihaz denetimi gerekir.
- **Düzenle** mevcut tercih akışına gider. Gerçek App browser harness'ında beş alanın dolu kaldığı, tamamlamanın aynı değerlerle Home'a döndüğü doğrulandı; yeni Onboarding/edit flow ayrı ekran bağımlılığıdır.
- Yerel RN Web / Chrome 4× CPU tanısında 40 filtre değişiminin SVG render sayısı 970 → 250 oldu; 20 save değişiminde 500 → 0, 20 ilgisiz parent değişiminde Home render 20 → 0. Native frame/FPS veya Redmi akıcılığı kanıtı değildir. Varsayılan kapalı development profiling ve ayrıntılı sonuçlar `HOME_STABILIZATION_REPORT.md` içindedir.
- `npm ci`, diff kontrolü, typecheck, 180 test, accessibility source check ve Android Expo export geçti. 5.000 çağrılık öneri benchmark p95 7,385 ms / checksum 23.624; motor ve çıktıları korunur. Firebase/persistence/release sözleşmeleri ve Saved/Settings/Ankara 101 görselleri değişmedi. Sonraki adım Redmi'de inspect/explicit Maps/Back/undo/tercih persistence ve native scroll ölçümüdür; PR Draft kalır.

## Devam eden çalışma — Production Home / PR #67 uzlaştırması (6 Ekim 2026)

- Canlı Git ve fetch sonrası `origin/main` `46c41156255da7656a7cc0023fd721539dcaf45b`, mevcut PR #67 head'i `dc501332a21678d50f60088874ae6247f664efe0` olarak doğrulandı; ilk worktree temizdi. Tam geçmiş taşıyan bundle head'i `75b2aeb93794a60a2b6505cb361f27bb7fb1d847` mevcut `codex/gezek-ui-foundation` dalına yalnız fast-forward ile alındı. Ayrı PR veya history rewrite yapılmadı.
- Canlı Figma Final Review `288:3`, Home `7:2 / 7:129 / 7:245`, Components `3:2` ve Onboarding `31:2` incelendi; daha yeni onaylı Home kaynağı bulunmadı. Güncel otorite ve uygulama sözleşmesi `PRODUCTION_HOME_DESIGN_CONTRACT.md` içindedir.
- Native Home canlı tercih özeti, kategori renkleri/simgeleri, bir ana ve dört dikey alternatif, ana eylem yanında kaydetme, yenileme, keşif ve alt gezinme ile uzlaştırıldı. Eski Fikir çizimi güncel K0 artwork ile değiştirildi. Fotoğraf lisansları doğrulanamadığı için iki fotoğraf kaldırıldı; kullanıcı 6 Ekim'de mevcut kategori artwork'ünü geçici no-photo fallback olarak açıkça onayladı.
- Öneri motoru, katalog, konum, kaydetme/gizleme/geri alma, rotasyon, Ayarlar, Kaydedilenler, Ankara 101, internal/external eylemler ve persistence sınırları korunur. Gerçek sonuç yoksa sahte kart/etkinlik eklenmez. Offline embedded/local kullanım korunur; yeni connectivity sinyali üretilmez.
- TypeScript, regression testleri, Home'u da kapsayan accessibility source check ve Android Expo export yerel olarak doğrulanır. Gerçek native bileşenlerin geçici React Native Web önizlemeleri 412 × 915 ile uzun metin, uzun scroll, dört filtre, loading ve fotoğrafsız fallback'i inceler; callback bağlantıları ve küçük ekran ayrıca kontrol edilir. Bu kanıt Android cihaz, TalkBack veya production kabulü değildir.
- Nihai logo/uygulama ikonu hâlâ açıktır; geçici wordmark tek `GezekBrandMark` bileşenindedir. Redmi 14 / Expo Go görsel ve etkileşim kabulü bekleniyor. PR #67 `Implement Gezek production Home` başlığıyla Draft kalmalı ve merge edilmemelidir.

## Tarihsel Gezek UI foundation — 1 Ekim 2026

- `codex/gezek-ui-foundation`, `origin/main` `46c41156255da7656a7cc0023fd721539dcaf45b` üzerinden açılmıştı. Foundation commit'i `dc501332` renk/font tokenları ve eski beş SVG component'ini getirdi; Home implementasyonu veya cihaz kabulü değildi.
- Home için 1 Ekim PNG/SVG otoritesi, eski Fikir artwork'ü ve ayrı production Home PR planı 6 Ekim canlı Figma uzlaştırmasıyla geçersiz kılındı. Source Sans 3/Cormorant Garamond kullanan diğer ekranlar ve Ankara 101 bu işte topluca değiştirilmedi.

## Güncel marka kararı — 28 Eylül 2026

Kamuya açık ürün adı **Gezek**; N’apsak önceki çalışma adıdır. Uygulama adı ve görünen metinler güncellendi. Kullanıcının son tasarım kararıyla Home içerik seçicisinde teknik `experience` filtresi **Gezek** olarak görünür; marka/header kullanımıyla aynı kelime olsa da burada kürate edilmiş Gezek planlarını temsil eder. Teknik kimlikler ve geçmiş kayıtlar korunur. Kapsam ve sonraki bundle/store kararı `BRAND_RENAME.md` içindedir.

## Devam eden çalışma — Deletion boundary evidence hardening (24 Eylül 2026)

- `codex/deletion-boundary-evidence` dalı, fetch sonrası doğrulanan `origin/main` `9a76530802957ca732b006716eed9c0667e3116c` üzerinden ayrı ve temiz worktree'de açıldı.
- Gerçek backend akışının kullandığı `UserDataBoundary`, remote work, normal yerel preference persistence ve silme cleanup'ını tek test edilebilir orkestrasyon sınırında topluyor. Silme sırası, anonim Auth, owner-bound queue v2, tek deleted-UID tombstone, remote allowlist ve preference migration precedence değiştirilmedi.
- Deterministik testler tombstone yazma, Firestore silme, queue temizleme, preference temizleme ve Auth silme başarı/hata sınırlarını; Auth timeout'un iptal kanıtı olmadığını; aynı-UID restart, retry, A→B kimlik değişimi, tek tombstone replacement ve geç çözülen eski remote work sırasını kapsıyor.
- Somut bir runtime hatası yeniden üretildi: App'in doğrudan başlattığı gecikmiş v5 preference yazımı, local cleanup bittikten sonra tamamlanıp silinen tercihi yeniden oluşturabiliyordu. Normal persistence artık deletion cleanup ile serialize edilir; eski-generation yazı cleanup sonrasında çalışamaz. Bu düzeltme remote veya ürün semantiğini değiştirmez.
- İkinci Astra riski mevcut sözleşmenin gerçek sınırı olarak doğrulandı: silme preference cleanup'ta açıkça başarısız olur ve cihaz-kapsamlı v5 kayıt kalırsa, kontrollü A→B kimlik değişiminde kalan tercih B için normal ilk migration'a girebilir. Eski A queue'su B olarak replay edilemez. Mevcut anonim-cihaz modelinde bu güvenli fakat dikkat edilmesi gereken davranıştır; başarıyla tamamlanmış silmede gözlenmez.
- Pending konum callback'i geç çözülürse App belleğindeki koordinatı yeniden doldurabilir; koordinat preference şemasına, queue'ya veya Firestore allowlist'ine girmez. Repository testi location-benzeri fazla alanın owned queue payload'ına taşınmadığını doğrular. Component-lifecycle ve signed-device kanıtı connected-beta aşamasına kalır.
- Diff kontrolü, typecheck, 13 deletion-boundary testi, 10 persistence testi, 16 connected-service/sync testi, toplam 173 ana test ve 6 Firestore Rules emulator testi geçti. Release baseline beklenen sekiz açık engeli korudu.
- Bu kanıt repository düzeyindedir. Gerçek Firebase/Auth sonucu, OS/native persistence, process kill sınırı ve signed connected-beta cihaz davranışı ayrıca doğrulanmalıdır.

## Devam eden çalışma — Legacy preference storage cleanup (24 Eylül 2026)

- `codex/legacy-preference-cleanup` dalı, fetch sonrası doğrulanan `origin/main` `4631cda4422b16ff455bd20d0c8e74b38f53e33d` üzerinden ayrı ve temiz worktree'de açıldı.
- `@napsak/preferences/v5` canonical anahtar olarak korunur. v5 yoksa mevcut v4 → v3 → v2 → v1 precedence'iyle seçilen okunabilir kayıt sanitize edilip önce v5'e yazılır; legacy kopyalar ancak başarılı yazımdan sonra best-effort temizlenir.
- Canonical yazma hatası migrated in-memory tercihi kullanılabilir bırakır ve bütün legacy kopyaları retry için korur. Legacy silme hatası geçerli v5'i veya dönen tercihleri boşaltmaz; kalan anahtar sonraki yüklemede tekrar denenir. Malformed v5/legacy no-fallback davranışı ve tercih alanı semantiği değiştirilmedi.
- Odaklı otomatik testler canonical precedence, v4/older migration, birden fazla legacy kopya, write-before-delete sırası, yazma ve silme hataları, tekrar/idempotency, malformed kayıtlar, mevcut alan sanitization'ı ve v1–v5 temizliğini kapsar. Kanıt repository düzeyindedir; cihaz/production doğrulaması veya hukuki retention uyumu iddiası değildir.

## Devam eden çalışma — Owner-bound pending sync queue hardening (24 Eylül 2026)

- `codex/owner-bound-pending-sync` dalı, fetch sonrası doğrulanan `origin/main` `1421749b250b1ff5727e53392fb7a99c9c43280e` üzerinden ayrı ve temiz worktree'de açıldı.
- Sahipsiz, tam yerel preference snapshot'ı taşıyan `@napsak/user-sync/v1/pending` yerine gerçek Firebase UID sahibini ve yalnız remote allowlist alanlarını taşıyan `@napsak/user-sync/v2/pending` getirildi. Queue yalnız aynı UID için replay edilir; legacy, bozuk veya UID'si eşleşmeyen kayıt upload edilmeden atılır.
- Yerel preference v1–v5 verisi legacy queue reddinden etkilenmez; remote belge yoksa yeni v2 snapshot ancak güncel UID çözüldükten sonra mevcut yerel durumdan üretilir. Ayrı epoch eklenmedi; Firebase UID incarnation sınırı olarak kullanılır.
- Deleted-UID tombstone'u ve silme sırası korunur. Remote payload `saved`, `dismissed`, `interests`, `schemaVersion`, `deviceMigrationVersion` ve yazım anındaki server `updatedAt` alanlarıyla sınırlı kalır; yerel-only bağlam alanları queue'ya alınmaz.
- Odaklı otomatik testler owner eşleşmesi/uyuşmazlığı, legacy ve malformed fail-closed davranışı, silme ve yeni anonim UID, restart, offline reconnect, compare-before-remove ve remote allowlist minimizasyonunu kapsar. Diff kontrolü, typecheck, 111 ana/release testi, 38 build/connected-services/quality testi ve 6 Firestore Rules emulator testi geçti; release baseline beklenen sekiz açık engeli korudu. Bu repository kanıtıdır; bağlı Firebase veya cihaz/production doğrulaması değildir.

## Devam eden çalışma — Event Freshness Refresh #2 (21 Eylül 2026)

- `codex/event-freshness-refresh-2` dalı, doğrulanmış `origin/main` `c0fb15252a05c86d406e766accbd127d40aa5546` üzerinden açıldı. Onaylı 21 Eylül denetimi kullanıldı; dış kaynak araştırması yapılmadı.
- 21 Eylül Ankara Open seansı `startsAt` sınırında sona erdiği, 23 Eylül ONE MORE seansı biletleri tükendiği için aktif katalogdan çıkarıldı. Tarihsel ID'ler yeniden kullanılmadı; 22 Eylül Ankara Open ve 24 Eylül ONE MORE ayrı ID'lerle eklendi. Eski 5.000 ₺ ONE MORE fiyatı artık aktif arzda yok.
- Sami Yusuf, Trivia Night, Candles and Echoes ve Ankara Cocktail Festival onaylı fiyat/katılım bilgileriyle güncellendi. TCA, Happy Pig’s, Ajda Pekkan, Bubble Show, TastyDays ve AMADEUS için yalnız `verifiedAt` 2026-09-21 oldu. TastyDays belirli şef veya atölye vaadi taşımıyor.
- Golden Chef 29 Eylül üç saatlik Event olarak eklendi; yaş alt sınırı bilinmediği için Event'te belirtilmedi ve eski Place provenance metnindeki kanıtsız `14+` kaldırıldı. Ayrı Experience eklenmedi.
- Masumiyet film gösterimi ve yönetmen söyleşisi, proje sahibinin sağladığı Bubilet kaynak bağlantısıyla 23 Eylül tarihli ayrı Event olarak eklendi. Açık hava/hava koşulu ve numarasız genel giriş bilgisi betimleyici notta tutuldu. Event kataloğu 12'den 14 kayda çıktı.
- Place 178, Experience 52, Idea 140 ve Guide 12 sayıları korundu. Öneri sıralaması veya Event yaşam döngüsü değiştirilmedi.
- Yerel doğrulama: diff kontrolü, typecheck, 111 ana/release + 14 kalite testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality, 5.000 çağrılık performans, Event Catalog Health ve release baseline kontrolleri geçti. Sabit kalite matrisinde uygun aday 693'ten 698'e çıktı; 70 ilk grup sonucu, 0/2/13 sıfır/kısmi/tam beşli dağılımı ve 0 objektif invariant/sızıntı hatası değişmedi. Performans p95 7,795 ms ile 25 ms bütçesinin altında kaldı. Release baseline beklenen sekiz açık engeli korur; cihaz veya production doğrulaması yapılmadı.

Kontrol tarihi: 21 Eylül 2026. Bu bir yayına hazır olma raporu değildir.

## Devam eden çalışma — Ankara 101 editoryal derinlik düzenlemesi

- `codex/ankara101-editorial-depth` dalı, fetch sonrası doğrulanan `origin/main` commit'i `8447e95d85ed6de1790ab55862699646f5f324d9` üzerinden ayrı bir worktree'de açıldı.
- Ankara 101'in iki ana kartlı mimarisi korunarak Ankara Klasikleri kartına katalogdan türetilen bölüm/okuma süresi, Bir Ankaralı Gibi kartına mevcut rota kimliği/süresi ve altına dört sabit editoryal bölüm önizlemesi eklendi. Yeni Guide veya rota içeriği eklenmedi.
- Guide ID'siyle Ankara Klasikleri içindeki bölüme gitme akışı; seçmeler, içindekiler ve Kaydedilenler tarafından ortak kullanılır. Kaydedilen Guide kartı artık iç bölümü açma, resmî kaynağı açma ve kayıttan çıkarma eylemlerini ayrı sunar.
- Uzun makalenin sabit üst çubuğuna içindekiler erişimi eklendi; bölüm geçişinden sonra ekran okuyucu odağı bölüm başlığına taşınır. Koleksiyon kaydı ile tekil bölüm kaydı etiket ve eylem hiyerarşisinde ayrıştırıldı.
- Boş `insiderRoutes` listesi güvenli bir kullanılamıyor durumuna düşer; rota kaydetme/harita eylemleri olmayan kayda erişmez. Öneri sistemi, Ankara 101 içeriği, katalog semantiği ve analitik sözleşmesi değiştirilmedi.

## Devam eden çalışma — Experience ana-ilgi sırası doğruluğu

- `codex/experience-primary-tier-order` dalı, fetch sonrası doğrulanan `origin/main` commit'i `15f93c6a2d790fe39ba3d44ed7b9f6bae8a8bd8a` üzerinden açıldı.
- Public Experience çağrısının geniş aday havuzunu ham skorla yeniden sıralayıp `interestTier` önceliğini kaybetmesi düzeltildi. Açık Experience filtresi artık doğrudan Experience motorunun istenen limit için ürettiği sıralı sonucu kullanır; beş ana-ilgi adayı varken ikincil-only aday ilk beşe giremez, yetersiz ana arzda ikincil eşleşme fallback'i korunur.
- Sakin + Lezzet audit fixture'ı düzeltme öncesi direct yolda 5 ana eşleşmeye karşı public yolda 1 ana + 4 ikincil-only sonuç üretiyordu; düzeltme sonrası iki yol aynı 5 ana eşleşmeyi aynı sırada döndürür.
- Odaklı regresyonlar direct/public parity, ana arz yeterliyken ilk beş, ana arz yetersizken ikincil fallback, deterministik tekrar, çeşitlilik, rotasyon ve Place/Idea/Event izolasyonunu kapsar. Katalog, ağırlıklar, uygunluk, yaşam döngüsü, çeşitlilik cezaları ve rotasyon algoritması değiştirilmedi.
- Sabit kalite matrisinde uygun aday 693, ilk grup sonucu 70, sıfır/kısmi/tam beşli 0/2/13 ve Experience ana/ikincil sayıları 17/3 olarak kaldı. Kategori/ilçe çeşitliliği 2,667/2,333'ten 2,800/2,600'e; tekrar eden slot 66'dan 67'ye; konuma bağlı değişen slot 19'dan 17'ye ve üyelik farkı 16'dan 18'e değişti. Deterministik tekrar, yaşam döngüsü sızıntısı ve objektif invariant hatası 0 kaldı.
- Güncel doğrulamada diff kontrolü, typecheck, 107 ana/release + 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality, Event Catalog Health ve sekiz açık engeli koruyan release baseline geçti. 5.000 çağrılık performans p95'i 7,808 ms ile 25 ms bütçesinin altında kaldı; 300 çağrılık kalite örneği p95 4,870 ms ölçtü. UI değişmediği için cihaz/manual doğrulama yapılmadı; bu sonuçlar production veya imzalı release cihaz kanıtı değildir.

## Devam eden çalışma — Katalog yaşam döngüsü doğruluğu

- `codex/catalog-lifecycle-correctness` dalı, fetch sonrası doğrulanan `origin/main` commit'i `02a76d52df7c5e6ac4687fe968c104c23e62fe4b` üzerinden ayrı worktree'de açıldı.
- Mevcut runtime yaş, mevsim, hafta günü, program veya envanter/müsaitlik uygulamadığı için güvenli temsil edilemeyen altı Experience aktif arzdan çıkarıldı: `xp-cer-genclik-short`, `xp-cer-cso`, `xp-ka-fotograf-sergisini-yavas-oku`, `xp-nallihan-goc-yolunu-gozle`, `xp-belpa-ilk-acik-buz-seansi` ve `xp-deniz-dunyasi-akvaryum`. İlgili Place kayıtları korunur; yeni Event veya sahte koşul eklenmez.
- `xp-odtu-double-museum` ve `xp-tragos-tanitim-dersi` objektif regresyon bulunmadığı için değiştirilmedi. Öneri algoritması, `conditional` fail-closed davranışı, `event_linked` için Event `startsAt` sınırı ve kaydetme/gizleme çözümleme davranışı korunur.
- Place/Experience/Idea/Event/Guide sayıları 178/52/140/12/12 olur. Embedded katalog sürümü `2026-09-20.1`, `fetchedAt` değeri `2026-09-20T04:42:47.000Z` olur; schema/cache sürümü v3 kalır.
- Lifecycle validator artık bütün yasadışı karma `expiresAt`/`activation`/`eventId` durumlarını reddeder ve event-linked bağın aynı şehirdeki Event'e gitmesini doğrular. Gerçek katalog fixture'larıyla Event başlangıç sınırı, yanlış şehir/eksik bağ, kayıtlı/gizli çözümleme ve düzeltilen kayıt regresyonları test edilir.
- Güncel doğrulamada diff kontrolü, typecheck, 104 ana/release + 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality, performans, Event Catalog Health ve release baseline kontrolleri geçti. Kalite matrisinde uygun aday 704'ten 693'e, ilk grup sonucu 71'den 70'e ve tam beşli senaryo 14'ten 13'e iner; kısa süre fixture'ı CerModern–Gençlik ile doldurulmak yerine dört doğru sonuç döndürür. Sıfır sonuç, lifecycle sızıntısı, deterministik tekrar ve objektif invariant hatası 0 kalır. 5.000 çağrılık performans p95'i 7,678 ms ile 25 ms bütçesinin altındadır; release baseline beklenen sekiz açık engeli korur ve yayın onayı değildir. Veri/validator/test/dokümantasyon kapsamı için cihaz/manual test yapılmadı.

## Devam eden çalışma — Final Ankara Experience Batch

- `codex/final-ankara-experience-batch` dalı, fetch sonrası doğrulanan `origin/main` commit'i `6490edc36cee44b282d7f022d4404f9930276b8e` üzerinden ayrı bir worktree'de açıldı.
- Mevcut Place kayıtları ve provenance ile desteklenen sekiz evergreen Experience eklendi: Altınköy’de Köy Yaşamını Üç İzden Oku; Millet Kütüphanesi’nde Derin Çalışma Bloğu; Çubuk-1’de Barajı Mühendislik Gözüyle Oku; Peçenek’te İskitler Döner Ritüeli; Kıtır’da Tunalı’nın Buluşma Hafızasına Otur; Keçiören Çocuk Sanat Müzesi’nde Çocuğun Rehber Olsun; Aqua Vega’da Üç Yaşam Alanını Karşılaştır; Dost’ta Bir Konunun Raf Haritasını Çıkar.
- Mamak Füzyon Experience'ı ertelendi. Mevcut `conditional` activation yalnız `unsupported` değerini taşır ve merkezi uygunlukta fail-closed'dur; rezervasyon zorunluluğu, 6–13 yaş odağı ve hafta içi/program bağımlı atölyeyi kullanılabilir biçimde aktive edemez. Kaydı evergreen yapmak unrestricted walk-in izlenimi yaratacağı için lifecycle mimarisi değiştirilmeden eklenmedi.
- Golden Chef, Goethe, MTA, İş Bankası, Quick China, No24, L’avare, Büyülü Fener, Institut français, Galeri Siyah Beyaz, Mülkiyeliler ve Tuz Gölü Experience'ları eklenmedi. Place, Idea ve Event kayıtları değiştirilmedi; mevcut 50 Experience'ın lifecycle sınıfları korunur.
- Place/Experience/Idea/Event/Guide sayıları sırasıyla 178/58/140/12/12 oldu. Embedded katalog sürümü `2026-09-19.6`, `fetchedAt` değeri `2026-09-19T20:16:37.000Z` oldu; schema/cache sürümü v3 kaldı.
- Sabit recommendation-quality matrisinde uygun aday toplamı 690'dan 704'e çıktı; ilk grup sonucu 71, sıfır/kısmi/tam beşli 0/1/14, kategori/ilçe çeşitliliği 2,600/2,333 ve tekrarlanan ID 54 olarak kaldı. Tekrarlanan slot 68'den 67'ye indi; konuma bağlı değişen slot 20'den 23'e, üyelik farkı 16'dan 18'e çıktı. Yaşam döngüsü sızıntısı, deterministik tekrar ve objektif invariant hatası 0 kaldı.
- Güncel doğrulamada diff kontrolü, typecheck, 99 ana/release + 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality, performans, Event Catalog Health ve release baseline kontrolleri geçti. 5.000 çağrılık performans p95'i 9,644 ms ile 25 ms bütçesinin altında kaldı. Release baseline beklenen sekiz açık engeli korudu; bu yayın onayı değildir. Veri-only değişiklik için cihaz/manual test yapılmadı.
- Öneri ağırlıkları, hard filtreler, uygunluk, sıralama, çeşitlilik, rotasyon, kaydetme/gizleme davranışı, UI, Firebase ve lifecycle engine değiştirilmedi. Bu katalog-only çalışma production veya cihaz doğrulaması değildir.

## Devam eden çalışma — Fikir Expansion Batch C (final planlı kürasyon)

- `codex/idea-expansion-batch-c` dalı, fetch ve uzak ref doğrulamasından sonra güncel `origin/main` commit'i `15ffef273294cd322c708c42498d68f428617841` üzerinden ayrı bir worktree'de açıldı.
- Önceden onaylanan 62 STRONG + 36 GOOD SUPPORTING araştırma havuzu, mevcut 118 kayıt ve Batch A/B seçkileriyle normalize kullanıcı eylemi düzeyinde yeniden karşılaştırıldı. Kalite, bağımsız eylem ve platformdan bağımsızlık kapılarını geçen son 22 Fikir eklendi; katalog 140 Fikir, 88 tam yapılandırılmış ve değişmeden korunan 52 legacy kayda çıktı. Bu, Ankara v1 için son planlı Fikir genişletme batch'idir.
- Batch C; aileyle yapılabilir üretim ve öğrenme, arkadaş grubu/sosyal ritüel, sakin akşam, ortak yemek hazırlığı, ev-kötü hava ve düşük maliyet bağlamlarını güçlendirir. Family dağılımı 6 curiosity-learning, 4 social-ritual-hosting, 2 friend-group, 2 home-bad-weather, 2 creative-art, 2 food-cooking, 2 coffee-drink-ritual, 1 pair-date ve 1 micro-adventure'dır. Ana ilgi dağılımı 8 Sanat, 7 Lezzet, 3 Etkinlik, 3 Doğa ve 1 Kahve; fiyat dağılımı 15 ücretsiz, 6 düşük ve 1 orta maliyetlidir.
- Maksimum süre dağılımı 12×31–60, 8×61–120 ve 2×121+ dakikadır. 11 kayıt spontaneous, 8 light-planning ve 3 planned; 15 bad-weather, 14 no-spend, 12 evening, 9 family, 6 low-energy ve 6 limited-time bağlamı taşır.
- Araştırma havuzunun kalan 20 adayı kapatıldı: HOLD 0, REJECT 20. Bunların altısı Batch B'de zaten reddedilen fotoğraf hikâyesi, paralel sokak, gölge çizimi, iki yöntem sebze, telefonla aile tarifi ve mahalle rengi adaylarıdır. Kalan 14 aday; iki genel telefonsuz ritüel, sesli pasaj, yarım rota, aile sesi kaydı, ortak kartpostal, öneri turu, dondurucu öğünü, kurabiye/pirinç yöntem karşılaştırmaları, bankta okuma, süreli gidiş-dönüş, ikinci piknik ve alışverişsiz kahvaltıdır. Mevcut pasaj, sözlü tarih, kartpostal, pantry/artık, iki yöntem, açık hava okuması, rota ve piknik eylemleriyle çakıştıkları ya da tek başına yeterince somut olmadıkları için yeni stable ID üretilmedi.
- Ayrı legacy-cleanup adayları bu batch'te değiştirilmedi: fotoğraf scavenger, 10 dakikalık denge challenge, Earthcam ruleti, 60 dakikada yeni beceri, kafe puan kartı, merdiven intervali ve Letterboxd ruleti; ayrıca rastgele rota/adım keşfi, renk fotoğrafı/scavenger, ülke kahvaltısı/ülke-tabak-playlist, Letterboxd/yönetmenin ilk filmi ve demleme karşılaştırmaları için konsolidasyon incelemesi sonraya bırakıldı.
- Embedded katalog sürümü `2026-09-19.5`, `fetchedAt` değeri `2026-09-19T19:30:18.000Z` oldu; schema/cache sürümü v3 kaldı. Öneri ağırlıkları, hard filtreler, uygunluk, sıralama, 1+4 keşif kotası, çeşitlilik, rotasyon, açıklamalar, diğer içerik türleri, UI ve Firebase değiştirilmedi.
- Güncel doğrulamada diff kontrolü, typecheck, 98 ana/release + 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality, performans, Event Catalog Health ve release baseline kontrolleri geçti. Uygun aday toplamı 668'den 690'a çıktı; artış yalnız Fikir senaryosundaki 22 yeni kayıttır. Sıfır/kısmi/tam beşli 0/1/14, ilk grup sonucu 71, kategori/ilçe çeşitliliği 2,600/2,333 ve tekrar ölçüleri 54 ID/68 slot olarak değişmedi; sızıntı, deterministik tekrar ve objektif invariant hatası 0 kaldı. Recommendation-quality örneği p95 4,687 ms, 5.000 çağrılık performans p95'i 7,272 ms ile 25 ms bütçesinin altında kaldı. Release baseline beklenen sekiz açık engelle geçti; bu yayın onayı değildir. Veri-only değişiklik için cihaz/manual test yapılmadı.
- Sıradaki editoryal çalışma yeni genel Fikir eklemek değil, final Experience Mining / Coverage Audit'tir. Legacy Fikir cleanup ve metadata migrasyonu ayrı, açık onaylı bir iş olarak kalır.

## Tamamlanan çalışma — Fikir Expansion Batch B

- `codex/idea-expansion-batch-b` dalı, fetch sonrası doğrulanan `origin/main` commit'i `d64836bb72a86142e2ae07a66630a1364cdac994` üzerinden ayrı bir worktree'de açıldı.
- Daha önce onaylanan Fikir Mimarisi araştırma havuzu mevcut 86 kayıtla normalize kullanıcı eylemi düzeyinde yeniden karşılaştırıldı. Kalite eşiğini geçen 32 platformdan bağımsız Fikir eklendi; toplam 118 Fikir, 66 tam yapılandırılmış ve değişmeden korunan 52 legacy kayda çıktı.
- Yeni batch; 7 arkadaş grubu/sosyal ritüel, 6 açık hava/mahalle, 6 yemek, 5 kahve-içecek ritüeli, 6 yaratıcı-merak ve 2 ek hareket adayını kapsar. Metadata family dağılımı 5 coffee-drink-ritual, 6 food-cooking, 4 friend-group, 3 social-ritual-hosting, 4 creative-art, 4 curiosity-learning, 3 active-movement, 2 outdoor-neighborhood ve 1 micro-adventure'dır. Ana ilgi dağılımı 10 Lezzet, 9 Sanat, 5 Kahve, 5 Etkinlik ve 3 Doğa; fiyat dağılımı 24 ücretsiz ve 8 düşük maliyetlidir.
- Yeni kayıtlarda maksimum süre dağılımı 4×30 dakika veya altı, 11×31–60, 13×61–120 ve 4×121+ dakikadır. 22 kayıt spontaneous, 5 light-planning ve 5 planned; 17 kayıt no-spend, 11 bad-weather, 10 limited-time, 9 family, 8 evening ve 2 low-energy bağlamı taşır.
- Altı aday yakın tekrar veya zayıf bağımsız eylem nedeniyle eklenmedi: son fotoğraf hikâyesi mevcut çocukluk fotoğrafı anlatısına; paralel sokak yürüyüşü mevcut rota yürüyüşlerine; gölge çizimi mevcut gölge izine; aynı malzemeyi iki yöntemle pişirme ve telefonla aile tarifi mevcut pişirme kayıtlarına; mahallede renk toplama mevcut tek renk fotoğraf yürüyüşüne fazla yakındı.
- Embedded katalog sürümü `2026-09-19.4`, `fetchedAt` değeri `2026-09-19T19:08:20.000Z` oldu; schema/cache sürümü v3 kaldı. Öneri ağırlıkları, hard filtreler, uygunluk, sıralama, 1+4 keşif kotası, çeşitlilik, rotasyon, açıklamalar, diğer içerik türleri, UI ve Firebase değiştirilmedi.
- Güncel doğrulamada diff kontrolü, typecheck, 98 ana/release + 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality ve performans kontrolü geçti. Recommendation-quality matrisinde uygun aday toplamı 636'dan 668'e çıktı; artış yalnız Fikir senaryosundaki 32 yeni kayıttır. Sıfır/kısmi/tam beşli sayıları 0/1/14, ilk grup sonucu 71, kategori ve ilçe çeşitliliği 2,600/2,333 kaldı; tekrarlanan ID 55'ten 54'e ve tekrarlanan slot 69'dan 68'e indi. Yaşam döngüsü sızıntısı, deterministik tekrar ve objektif invariant hatası 0 kaldı. Son 5.000 çağrılık performans p95'i 7,229 ms ile 25 ms bütçesinin altında kaldı.

## Devam eden çalışma — Ankara Place Completeness Batch #3

- `codex/ankara-place-batch-3` dalı, fetch sonrası doğrulanan `origin/main` commit'i `a82c7e785b78e8c2f970cdccfafa20a0f8508a02` üzerinden ayrı bir worktree'de açıldı.
- Yayın kapısını geçen dört Food + West Ankara Place eklendi: Kebap 49 — Tunalı, Quick China — Çayyolu, Niki Restaurant & Bar ve Louise Cafe Brasserie & Loft. Kebap 49 yalnız Tunalı/Kavaklıdere ana kimliğini ve kent hafızası değerini; Quick China yalnız Çayyolu şubesini ve batı Ankara kapsamasını taşır. Niki ile Louise özel akşam değerini yaklaşık premium fiyat bandı ve değişken saat/rezervasyon teyidiyle sunar; kesin dinamik menü fiyatı, giriş garantisi veya kanıtlanmayan operasyon ayrıntısı vaat etmez.
- Hacı Arif Bey eklenmedi: canlı Google Maps ve güncel işletme indeksi Güniz Sokak kimliğini kalıcı kapalı gösterirken briefteki Ayrancı kimliğini doğrulayacak güvenilir güncel şube/adres/operasyon kanıtı bulunamadı. Ayıntap İnci, Mutlu Lokantası, Tarihî Mutfak Lokantası, Zeynel, Ceviz Pastanesi, F451 Brew, No4 Restaurant Bar Lounge, TEKNOMER, Mamak Müzik Müzesi, Türk Hava Kurumu Müzesi ve 2. Yüzyıl Parkı HOLD listesinde kaldı; yerlerine başka Place konmadı.
- Place sayısı kalite kuralı gereği hedeflenen 179 yerine 174'ten 178'e çıktı; Experience 50, Idea 86, Event 12 ve Guide 12 olarak kaldı. Embedded katalog sürümü `2026-09-19.3`, `fetchedAt` değeri `2026-09-19T15:12:00.000Z` oldu; schema/cache sürümü v3 olarak kaldı. Yeni Experience eklenmedi.
- Öneri ağırlıkları, hard filtreler, uygunluk, sıralama, çeşitlilik, rotasyon, Fikir davranışı, Event verisi, UI ve Firebase değiştirilmedi. Güncel doğrulamada diff kontrolü, typecheck, 98 ana/release testi, 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality, Event Catalog Health, performans ve release baseline kontrolleri geçti. Sabit kalite matrisinde uygun aday toplamı 624'ten 636'ya çıktı; sıfır/kısmi/tam beşli sayıları 0/1/14 ve ilk grup sonucu 71 olarak kaldı. Ortalama kategori çeşitliliği 2,600 ve uygulanabilir ilçe çeşitliliği 2,333 olarak değişmedi; tekrarlanan ID 56'dan 55'e, tekrarlanan slot 70'ten 69'a indi. Yaşam döngüsü sızıntısı, deterministik tekrar ve objektif invariant hatası 0 kaldı. Son 5.000 çağrılık performans p95'i 7,411 ms ile 25 ms bütçesinin altında kaldı.

## Devam eden çalışma — Ankara Place Completeness Batch #2

- `codex/ankara-place-batch-2` dalı, fetch sonrası doğrulanan `origin/main` commit'i `53186fad649773ce0fab715f7a628f37c9cf7194` üzerinden ayrı bir worktree'de açıldı.
- Onaylı sekiz functional-expansion Place eklendi: Goethe-Institut Ankara, Institut français Ankara, Mülkiyeliler Birliği Kafe-Restoran, AST Bilkent Sahne, Akün Sahnesi, Şinasi Sahnesi, Çubuk-1 Barajı Rekreasyon Alanı ve Atatürk Kültür Merkezi (Başkent) Millet Bahçesi.
- Goethe ve Institut français dil kursu kimliğine indirgenmedi; halka açık kültür/kütüphane değeri öne çıkarıldı ve programlı sergi, gösterim ile Micro-Folie oturumları tarih/seans koşuluna bağlandı. AST yalnız güncel Bilkent kimliğiyle modellendi; deprecated eski AST konumu canlandırılmadı. Akün ve Şinasi ayrı adres/pin ve sahne kimlikleri olarak tutuldu; hiçbir güncel oyun evergreen Place metnine gömülmedi.
- Mülkiyeliler Birliği kaydı, Konur Sokak'taki Kazan A.Ş. restoranını kurumun sosyal ve kent hafızası karakteriyle birlikte taşır; kanıtlanmayan üyelik kısıtı eklenmedi. Çubuk-1 bütün alanı tek yürüyüş rotası gibi sunmaz; hava/gün ışığı ve bölüm erişimi caveat'larını taşır. AKM Millet Bahçesi bütün etap ve tesisleri sürekli açık saymaz; büyük etkinliklerde geçici alan kısıtını açık bırakır.
- Mamak Müzik Müzesi, Türk Hava Kurumu Müzesi, TEKNOMER, 2. Yüzyıl Parkı, Ayıntap İnci, Mutlu Lokantası, Tarihî Mutfak Lokantası, Zeynel, Ceviz Pastanesi, F451 Brew ve No4 Restaurant Bar Lounge eklenmedi; HOLD/kimlik/operasyon kapıları korunur.
- Place sayısı 166'dan 174'e çıktı; Experience 50, Idea 86, Event 12 ve Guide 12 olarak kaldı. Embedded katalog sürümü `2026-09-19.2` oldu; schema/cache sürümü v3 olarak kaldı. Yeni Experience eklenmedi.
- Öneri ağırlıkları, hard filtreler, uygunluk, sıralama, çeşitlilik, rotasyon, Fikir davranışı, Event verisi, UI ve Firebase değiştirilmedi. Güncel doğrulamada diff kontrolü, typecheck, 97 ana/release testi, 14 quality testi, catalog parity, 2.560 genel + 640 Experience stres senaryosu, recommendation-quality, Event Catalog Health, performans ve release baseline kontrolleri geçti. Sabit kalite matrisinde uygun aday toplamı 598'den 624'e çıktı; sıfır/kısmi/tam beşli sayıları 0/1/14 ve ilk grup sonucu 71 olarak kaldı. Ortalama kategori çeşitliliği 2,667'den 2,600'e, uygulanabilir ilçe çeşitliliği 2,400'den 2,333'e indi; tekrarlanan ID 58'den 56'ya ve tekrarlanan slot 72'den 70'e indi. Yaşam döngüsü sızıntısı, deterministik tekrar ve objektif invariant hatası 0 kaldı. Son 5.000 çağrılık performans p95'i 7,199 ms ile 25 ms bütçesinin altında kaldı.

## Devam eden çalışma — Ankara Place Completeness Batch #1

- `codex/ankara-place-completeness-batch-1` dalı, fetch sonrası doğrulanan `origin/main` commit'i `77f712d780818e8aa8cc206a2d7fe5aa7a5b8761` üzerinden ayrı bir worktree'de açıldı.
- Onaylı 13 completeness-core Place eklendi: Cumhurbaşkanlığı Millet Kütüphanesi, Altınköy Açık Hava Müzesi, Aqua Vega Akvaryum Nata Vega, Dost Kitabevi Karanfil, Kıtır Tunalı ana şube, L’avare Sokak, Galeri Siyah Beyaz, Büyülü Fener Kızılay, Mamak Füzyon Bilim Merkezi, Keçiören Çocuk Sanat Müzesi, Güvenpark Kızılay, Ahlatlıbel Atatürk Parkı ve Peçenek Döner İskitler Merkez Şube.
- Her kayıt faal kimlik, doğru şube/adres veya pin, temel operasyon bilgisi, yaklaşık fiyat bandı, gerçekçi ziyaret süresi, rezervasyon/seans koşulu, tek bir editoryal neden, kritik kısıtlar ve 19 Eylül 2026 tarihli yapılandırılmış provenance taşır. Doğrulanmayan park, erişilebilirlik, kalabalık, laptop, teras/manzara ve dinamik menü/program ayrıntıları eklenmedi.
- Mamak kaydı, belediyenin canlı yüzeylerinde yayımlanan `Mamak Bilim Merkezi` kimliği ve `MamakFüzyon` marka kullanımını alias olarak birleştirir; General Zeki Doğan Mahallesi Mutlu Caddesi No:59 adresindeki randevulu çocuk bilim merkezi, Mamak Caddesi’ndeki ayrı teknoloji/girişimcilik projesiyle karıştırılmadı.
- Place sayısı 153'ten 166'ya çıktı; Experience 50, Idea 86, Event 12 ve Guide 12 olarak kaldı. Embedded katalog sürümü `2026-09-19.1` oldu; schema/cache sürümü v3 olarak kaldı.
- Güncel doğrulamada diff kontrolü, typecheck, 96 ana/release testi, 14 quality testi, catalog parity, genel + Experience stres senaryoları, recommendation-quality, Event Catalog Health, performans ve release baseline kontrolleri geçti. Sabit kalite matrisinde uygun aday toplamı 562'den 598'e çıktı; ilk grup sonucu 71, sıfır/kısmi/tam beşli sayıları 0/1/14 ve objektif invariant hatası 0 kaldı. Son 5.000 çağrılık performans p95'i 7,031 ms ile 25 ms bütçesinin altında kaldı.
- Yeni Experience eklenmedi. Öneri ağırlıkları, hard filtreler, sıralama, çeşitlilik, rotasyon, Fikir davranışı ve Event verisi değiştirilmedi. Yılmaz Güney Sahnesi hard-exclusion guard'ı ve Müze Evliyagil reddi korundu.

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
