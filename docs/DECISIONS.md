# Gezek — Yeni karar kayıtları

## 2026-10-15 — PR #78 Redmi acceptance and authorized merge

The user tested exact implementation head `6b03a1366f31bfd2271eaac6bd5ba0c8b8afef99` on Redmi. Accepted: first visits to all four filters; ten warm cycles preserving recommendation IDs/order; removal of the previous approximately three-second Mekân delay; the remaining below-approximately-one-second transition as acceptable for beta; active-filter no-op; refresh limited to the active filter; Preference Cancel preservation and Save controlled invalidation; scoped Dismiss/Undo; correct location behavior; and Detail → Android Back retaining the active filter/batch. These are user-reported device observations, not instrumented native timing/FPS measurements. The confirmed defect and major delay are accepted as fixed; this acceptance does not reopen performance work.

Real Android OS large-text, TalkBack and signed-release acceptance remain separately deferred. This instruction supersedes prior PR #78 “keep Draft / do not merge / Redmi pending” notes: reconcile documentation, push normally, await App Quality and Security Rules on the new exact head, then mark ready and merge with a normal merge commit only if still mergeable without a review blocker. Merge completion must be verified from live Git/GitHub. See [HOME_FILTER_SNAPSHOT_REPORT.md](HOME_FILTER_SNAPSHOT_REPORT.md). PR #57 is closed as superseded without merge and must stay untouched; unrelated untracked `src/firebase/BA_4bit.sv/` remains protected. No application, algorithm/scoring, catalog, Firebase/persistence, design, release configuration or Ankara 101 implementation change is authorized here.

## 2026-10-15 — Saved merged; independent Home filter snapshots

PR #77 merged normally after acceptance-only commit `6e4e9015371ba1b1741b28e1c3020cbee843ef2b` passed exact-head App Quality and Security Rules. Merge/fetched local main: `5ed153e46fe7bc53a4d9100efef2f62ec1183111`. Earlier #77 Draft/no-merge notes below are historical; the three deferred native checks, signed-release gate and Ankara 101 visual closure remain open.

Separate branch `codex/gezek-home-filter-snapshot-stability` gives each Home filter an in-memory batch/run/history snapshot. Navigation restores exact batches; active-tab presses are no-ops; explicit refresh rotates only its surface. Preference Save invalidates all, Cancel/save status/location presentation do not rotate, dismiss/restore and catalog/real Event retry invalidate only affected surfaces. This explicitly extends the accepted visible-location snapshot contract to Place. Algorithms, schemas, visuals and Detail Host remain unchanged. Twenty warm four-filter cycles: 80 computations before, zero after in all four controlled browser viewport/text configurations. [HOME_FILTER_SNAPSHOT_REPORT.md](HOME_FILTER_SNAPSHOT_REPORT.md) contains the root cause, matrix, full verification/evidence, inventory and native retest checklist. New PR stays Draft and unmerged; Redmi timing and native acceptance remain pending. #57 and unrelated Verilog work remain untouched.

## 2026-10-15 — Saved Redmi acceptance and authorized merge

The user tested exact PR #77 implementation head `d1b611c38eb665f35711ce546264a5661fa5529f` on Redmi and accepted mixed Saved, saving Ankara 101/editorial content, independent row/Unsave actions, final-item Empty, recommendation/editorial Android Back to Saved, restart persistence, normal device layout and fixed-navigation clearance. Three native checks remain explicitly deferred: expired Event row (none exists in the active catalog), actual Android OS large text, and TalkBack separation of row body versus “Kaydı kaldır”. Signed-release acceptance remains separate and unverified. Simple/artwork-free Ankara 101 Saved rows are recorded for later Ankara 101 visual closure; no arbitrary artwork change is authorized here.

The current user instruction supersedes earlier “keep Draft / no merge” notes for #77 only: update acceptance documentation, await new exact-head CI, then mark ready and merge normally with a merge commit if still clean/mergeable. Home filter snapshot work must start afterward in a separate branch/PR; that new PR must remain Draft and unmerged. Live Git/GitHub establishes merge completion; this documentation update does not itself assert a merge. See `SAVED_IMPLEMENTATION_REPORT.md` for the acceptance audit. #57 and untracked Verilog work remain protected.


## 2026-10-15 — Production Saved / Kaydedilenler

Approved Figma section `1026:5886` is implemented on `codex/gezek-production-saved` from fetched main `056ad19`. Seven mixed Saved entry shapes, count removal, compact artwork rows, explicit expired Events, independent Unsave/focus and exact Detail/editorial origin return are scoped here. No Firebase/persistence schema or Ankara 101 visual change. See [SAVED_IMPLEMENTATION_REPORT.md](SAVED_IMPLEMENTATION_REPORT.md) for audit, complete authority ledger, verification, inventory and pending Redmi/TalkBack acceptance. Normal commit/push and one Draft PR authorized; no merge or #57/Verilog work.


## 2026-10-15 — Approved location snapshot and mandatory batch preflight

User explicitly accepts that an existing Home distance represents the last explicitly acquired fix and may remain after a missed Expo Go Quick Settings lifecycle signal. Reliable lifecycle checks, explicit update, or a new batch action can invalidate it. No periodic polling, repeating timer or continuous tracking is approved. Every newly computed location-scored Home/related batch must resolve its location through read-only service and foreground-permission checks; missing cache proceeds locationless immediately, invalid/denied/error/timeout discards it and proceeds locationless. Only an explicit successful location request restores a discarded fix. Existing ranking/eligibility/catalog formulas and relationships are unchanged. Same branch and Draft #76, normal commit/push; no merge. Implementation and pending native evidence: `EXPERIENCE_DISTANCE_REPORT.md`.

## 2026-10-13 — Production first-run onboarding

User approved the live production Figma flow and minimum one Interest for first run. Zero selections keep Continue visibly/accessibly disabled; no invented validation error, unlimited multiple selections, Back preserves drafts. This supersedes the permissive legacy onboarding UI while the domain retains empty-array compatibility, completed legacy users bypass onboarding, and PR #74 editor validation remains unchanged. Local v5 snapshot is committed once before completion publication; successful callback stays latched, failure permits Retry, and legitimate deletion resets the guard while invalidating old callbacks. No Firebase/schema/recommendation change. Implementation on `codex/gezek-production-onboarding`, evidence and pending native checks: `ONBOARDING_IMPLEMENTATION_REPORT.md`. Draft PR only, no merge or #57 modifications.

## 2026-10-13 — Recommendation Correctness Phase 1

Durum: kullanıcı açıkça onayladı; `codex/gezek-recommendation-correctness-phase-1` üzerinde uygulanıyor. Önceki tam containment davranışının yerine süre ayırılabilir maksimum zamandır: Experience maximum 60/120/240/360 dakika kapısını geçmeli, alt display sınırı uygunluk için kullanılmamalıdır. İlk duraktan başlayan editoryal tahmin duraklar arası geçişleri içerir; gidiş/dönüş ulaşımı ve tamamlanma garantisi içermez.

Aynı interest tier'ında süre uygunluğu sınırlı 0–16 puanlık midpoint-closeness sinyalidir; primary ilgi önce kalır. Kısa uygun fallback korunur. Ücretsiz bütün türlerde structured `priceLevel: 0` hard kapısıdır; paid fallback ve prose'dan ücretsiz çıkarımı yok. Diğer fiyat bantları soft kalır; gerekçeler yalnız structured fiyattan türetilir. Experience validation sonlu, negatif olmayan, sıralı süre aralıkları ister.

Grup davranışı, mood 48, konum/yolculuk, rotasyon tasarımı, Event katalog/expiry, Idea 1+4, UI/Onboarding, Firebase, persistence, stable IDs ve release config ertelenir veya korunur. Geçmiş 22/52 erişilemez plan bulgusu süre kapısı değişikliğinin gerekçesidir; fiyat/grup metadata'sı değiştirilmez. Commit, normal push ve bir Draft PR açıkça yetkilidir; merge/force-push yok. Güncel kanıt ve kalan native kontroller `RECOMMENDATION_CORRECTNESS_PHASE1_REPORT.md` içindedir.

## 2026-10-10 — Detail Flow PR 2

Live fetched main is `30b96c059f242ec91d886e9480afb2491c31ab4a`; PR #69 is merged per the current user baseline. Historical “unmerged / PR 2 unauthorized / Figma bookmark sync pending” notes below are superseded by the current user authorization and live Figma bookmark reconciliation. Event/Idea internal detail and minimum Saved routing are implemented on `codex/gezek-detail-event-idea`. Validation, scope, known identical Event-health failure and pending native acceptance: `DETAIL_FLOW_PR2_IMPLEMENTATION_REPORT.md`. Normal commit/push and one Draft PR are authorized; no merge or Onboarding.


## 2026-10-09 — approved PR #69 device corrections

The user explicitly approved a component-level override of Detail Plan/Place Save: outline bookmark by default, filled cobalt bookmark when saved, with existing navy/cobalt tokens and 44×44 selected/busy/disabled semantics. This supersedes the prior Figma heart assets only; Figma synchronization remains a later task. Stable Experience IDs remain routing/artwork keys and are forbidden as visible metadata. Existing `kind + id` detail routes pop/truncate to their surviving frame instead of creating cycles; distinct related Plans remain valid. Snackbar expiry has a 180 ms native fade/down presentation after the unchanged eight-second undo cutoff, with instant reduced-motion removal and no persistence restoration.

Authorization is to continue existing Draft PR #69 and push normally on `codex/gezek-detail-plan-place`; no merge or PR 2 work is approved. See `DETAIL_FLOW_PR1_CONTRACT.md` and the correction report for evidence and device boundaries.

## 2026-10-08 — Detail Flow PR 1 ve exclusive save/dismiss

Durum: kullanıcı ekli PR 1 handoff’unu bağlayıcı olarak onayladı; `codex/gezek-detail-plan-place` dalında uygulandı. Plan/Place ve shared host için Figma `927:1769` otoritedir. Exact ID/history/origin snapshot; Back stack pop, Close origin exit; mevcut Hero resolver ve gerçek katalog alanları korunur. Dismiss saved’i atomik kaldırır; dismissed kayıt save edilemez; Restore/Undo unsaved döner. Eski overlapping yerel kayıtlar mevcut v5 şemasında dismiss-wins normalizasyonu alır. Sekiz saniyelik undo navigation/unmount’ta temizlenir. Firebase ve algoritma değişmez; Event/Idea, diğer migrasyonlar ve cihaz kabulü ayrıdır. Sözleşme ve kanıt `DETAIL_FLOW_PR1_CONTRACT.md` / `DETAIL_FLOW_PR1_IMPLEMENTATION_REPORT.md` içindedir.


## 2026-10-08 — Onaylı command-center Home / production artwork

Durum: kullanıcı design-to-code audit'ini onayladı; mevcut `codex/gezek-ui-foundation` / Draft #67 içinde yerel uygulama. 2026-10-07 paket + canlı Page 07 Home önceki görsel otoritenin yerine geçer. Başlık tahmini yerine sabit ID / artwork_key / icon_key eşlemeleri ve responsive artwork resolver kullanılır. 12 proof ailesinin exact Figma export'u zorunludur; acoustic `810:102` korunur. Kart gövdesi ve quick action'lar ayrıdır; keşif seçili filtreyi dışlar. Geçici lowercase marka tek `BrandLogo` bileşenindedir. Nihai logo/app icon, Redmi ve release-device kabulü açık kalır. Algoritma, katalog ve servis sözleşmeleri değişmez. Ayrıntılı kanıt ve yayın engeli `COMMAND_CENTER_IMPLEMENTATION_REPORT.md` içindedir.

Önceki tarihli kararların aslı PRODUCT_SPEC.md §15'te korunur. Karar durumu öneri / onaylı / uygulanmış olarak; kanıt seviyesi ise repository veya kodda mevcut / otomatik veya manuel test edilmiş / gerçek production ortamında doğrulanmış olarak ayrı kaydedilir. Bir kararın uygulanmış olması test edildiğini, test edilmiş olması da production ortamında doğrulandığını otomatik olarak göstermez.

## 2026-10-06 — Production Home otoritesi ve geçici fotoğrafsız fallback

Durum: Kullanıcı tarafından onaylandı; mevcut `codex/gezek-ui-foundation` / Draft PR #67 içinde uygulandı. Güncel ayrıntılı sözleşme `PRODUCTION_HOME_DESIGN_CONTRACT.md` içindedir.

Canlı Figma Final Review `288:3`, Home `7:2 / 7:129 / 7:245` ve Components `3:2`, önceki Home PNG/artwork devir otoritesinin yerine geçer. Bundle commit'i `75b2aeb` aynı PR dalına yalnız fast-forward ile alındı. Ayrı Home PR'ı açılmaz. Ürün, algoritma, katalog ve persistence sözleşmeleri korunur; logo ve Redmi 14 cihaz kabulü açıktır.

Kullanıcı ayrı bir Figma no-photo node olmadığını doğruladı ve lisansı doğrulanmış bundled fotoğraf yoksa mevcut artwork fallback'ini onayladı: Mekân → arch/mint, Etkinlik → ticket/coral, Fikir → K0/lavender, Gezek/Plan → güvenilir dominant kategori görseli veya neutral Gezek pastel. Slot/radius korunur; contain/center ve özgün oran kullanılır, crop/stretch yapılmaz; görseller dekoratiftir. Doğrulanmış bundled fotoğraf önceliklidir. Kayıt: “Closed-beta provisional no-photo fallback — product-approved on 2026-10-06; dedicated Figma component still pending.” Yeni illüstrasyon stili veya lisanssız/remote stock fotoğraf onaylanmadı.

## 2026-10-06 — Home içerik seçicisinde görünen ilk sekme Gezek'tir

Durum: Kullanıcı tarafından onaylandı; bundle ilk uygulaması mevcut `codex/gezek-ui-foundation` / PR #67 dalına alındı.

Home üst seçicisi eşit genişlikte `Gezek / Mekân / Etkinlik / Fikir` görünür. İlk sekme mevcut teknik `experience` filtresini ve kürate edilmiş Gezek planlarını temsil eder; veri modeli, öneri algoritması ve analitik türleri yeniden adlandırılmaz. Marka/header ile aynı adın kullanılması bilinçli ürün kararıdır. 28 Eylül tarihli “sonuç sekmesi Planlar görünür” kaydının yalnız bu kısmının yerine geçer. Nihai logo/uygulama ikonu ayrıca kararlaştırılacaktır.

## 2026-10-01 — Gezek UI foundation ve görsel kaynak otoritesi

Tarihsel kayıt: Home görsel otoritesi ve ayrı Home PR planı 6 Ekim canlı Figma uzlaştırmasıyla geçersiz kılındı. Aşağıdaki kayıt yeni uygulama talimatı değildir.

Durum: Kullanıcı tarafından onaylandı; `codex/gezek-ui-foundation` dalında foundation uygulanıyor, ekran veya cihaz görsel doğrulaması henüz yapılmadı.

`Gezek_UI_Handoff_2026-10-01` paketi Gezek UI implementation kaynağıdır. Final Home PNG'leri genel ve ayrıntılı Home görsel otoritesi; final artistik SVG paketi header/arch ve üç keşif kartı görsel otoritesi; yedi aşamalı onboarding paketi onboarding etkileşim/hareket otoritesidir. Repository davranışı, veri sözleşmeleri ve onaylı ürün metni prototiplerin önünde kalır. Warm canvas ve onaylı marka renkleri, Plus Jakarta Sans, 20 px inset, 8 px spacing tabanı, 22–24 px yüzey radius'u ve 44 px minimum hedef foundation olarak sabitlenir. Bu karar Home veya onboarding implementasyonu değildir; sonraki adım production Home PR'ıdır. 6 Eylül tarihli açık palet/logo kaydının foundation renk kısmı bu kararla geçersiz kılınır; uygulama ikonu ayrıca kararlaştırılacaktır.

## 2026-09-28 — Kamuya açık ürün adı Gezek

Durum: Kullanıcı tarafından onaylandı; adlandırma temeli bu dalda uygulandı. Önceki çalışma adı N’apsak'tı. Sonuç sekmesinin görünen adı Planlar'dır. Eski marka yazımına ve logo fikrine ilişkin tarihsel kararlar bu yeni kararla geçersiz kılınır; geçmiş kayıtlar korunur. Teknik kimliklerin korunma gerekçeleri ve ilerideki dağıtım kararı `BRAND_RENAME.md` içindedir. Sonraki aşama görsel tasarımın tamamlanmasıdır.

## 2026-09-24 — Yerel tercihler v5 anahtarında yakınsar

Durum: Kullanıcı tarafından onaylandı; `codex/legacy-preference-cleanup` dalında uygulanıyor, production veya cihazda doğrulanmadı.

`@napsak/preferences/v5` tek canonical yerel tercih anahtarıdır. v5 yoksa fallback sırası v4, v3, v2, v1 olarak korunur; ilk bulunan kayıt okunabilir JSON ise mevcut alan migration/sanitization davranışıyla güncel biçime çevrilir. Legacy kaynaklar ancak bu güncel değer v5'e başarıyla yazıldıktan sonra temizlenir. Canonical yazma başarısızsa güvenli in-memory sonuç kullanılabilir, bütün legacy kopyalar sonraki deneme için korunur.

Geçerli v5 varken legacy temizliği best-effort yapılır; tekil silme hatası geçerli tercihi boş duruma düşürmez ve kalan anahtar sonraki açılışta tekrar denenir. Malformed v5'in fallback'i engelleyip boş tercih döndürmesi ve malformed ilk legacy kaydın daha eski anahtarlara geçişi engellemesi mevcut precedence davranışı olarak korunur; bu okunamayan kayıtlar otomatik canonicalize edilmez veya silinmez. Kullanıcı verisi silme akışı preference v1–v5 anahtarlarının tamamını temizlemeye devam eder. v5 cihaz kapsamlıdır ve UID sahibi taşımaz; açıkça tamamlanamayan yerel cleanup sonrası kimlik değişirse kalan tercih normal migration ile yeni UID'ye yazılabilir. Queue sahipliği bu cihaz-kapsamlı migration'ı yasakladığı anlamına gelmez.

## 2026-09-24 — Pending kullanıcı senkronizasyonu UID sahibine bağlıdır

Durum: Kullanıcı tarafından onaylandı; `codex/owner-bound-pending-sync` dalında uygulanıyor, production'da doğrulanmadı.

Kalıcı pending user-sync kaydı v2 envelope içinde gerçek Firebase `ownerUid` ve yalnız Firestore allowlist'ine hazır minimize payload taşır. Kayıt sadece aynı authenticated UID için replay edilir; eksik, bozuk veya eşleşmeyen sahiplik fail-closed biçimde upload edilmeden atılır. Sahipsiz v1 queue hiçbir mevcut kullanıcıya bağlanmaz. Yerel preference kaydı korunur ve normal ilk senkronizasyon ancak güncel UID bilindikten sonra yeni sahipli v2 kayıt üretebilir.

Ayrı generation/epoch eklenmez; anonim hesap incarnation sınırı Firebase UID'dir. Mevcut kalıcı deleted-UID tombstone'u, Auth silme başarısızlığı ve aynı UID ile yeniden yazma riskini engellemeye devam ettiği için değiştirilmeden korunur. Anahtar adındaki `v1` bir legacy işareti değildir; tombstone güncel ve aktif güvenlik sınırıdır. Remote Firestore alanları genişletilmez; mood, budget, groupSize, duration, onboarding/context ve konum remote queue veya kullanıcı belgesine eklenmez.

## 2026-09-20 — Katalog yaşam döngüsü doğruluk sınırı

Durum: Kullanıcı tarafından onaylandı; `codex/catalog-lifecycle-correctness` dalında uygulanıyor, production'da doğrulanmadı.

Runtime yaş, mevsim, haftanın günü, canlı program veya envanter/müsaitlik koşullarını uygulamaz. `reservation`, `weather` ve `availabilityNote` betimleyici kalır; `conditional` bilinçli olarak fail-closed'dur ve `event_linked` uygunluğu Event `startsAt` anında sona erer. Genelleştirilmiş zamanlama motoru katalog ihtiyacı ayrıca haklı çıkarmadıkça beta sonrasına ertelenir.

Bu sınırla güvenli temsil edilemeyen altı Experience aktif arzdan çıkarılır: CerModern–Gençlik, CerModern–CSO, Ka fotoğraf sergisi, Nallıhan göç gözlemi, BELPA halka açık seans ve Deniz Dünyası'nın sonlu işletim dönemi. Place kayıtları korunur. ODTÜ çift müze ve Tragos tanıtım dersi objektif regresyon bulunmadığı için değiştirilmez. Öneri algoritması, mevcut `event_linked` anlamı ve kaydetme/gizleme davranışı değişmez.

## 2026-09-19 — Fikir Expansion Batch B

Durum: Kullanıcı tarafından onaylandı; `codex/idea-expansion-batch-b` dalında uygulanıyor, production'da doğrulanmadı.

Onaylı Fikir Mimarisi araştırma havuzu mevcut katalogla eylem düzeyinde yeniden deduplike edilir ve kalite eşiğini geçen 32 kayıt eklenir. Arkadaş grubu ve sosyal ritüel/hosting, yemek, kahve-içecek ritüeli, aktif hareket, merak-öğrenme, açık hava-mahalle ve ayrı çift/date değeri dengelenir; yakın tekrar veya yalnız zayıf bir varyasyon olan adaylar sayı hedefini doldurmak için eklenmez.

Batch B mevcut atomik metadata sözleşmesini kullanır ve dış platforma bağlı değildir. İlk 52 legacy kayıt, stable ID'ler ve mevcut dış bağlantılar korunur. Yeni metadata editoryal-only kalır; öneri ağırlıkları, hard filtreler, uygunluk, 1+4 Fikir keşif kotası, çeşitlilik, rotasyon, açıklamalar ve diğer içerik sınıfları değiştirilmez.

## 2026-09-18 — Fikir metadata mimarisi ve platformdan bağımsız eylem

Durum: Kullanıcı tarafından onaylandı; `codex/idea-architecture-batch-a` dalında uygulanıyor, production'da doğrulanmadı.

Yeni Fikirler; aile, süre aralığı, ortam, planlama modu, ana/ikincil ilgi, bağlam etiketleri ve kontrollü gereksinimleri atomik bir metadata bloğunda taşır. Aile uygunluğu ilk aşamada `contextTags: family` ile ifade edilir; ayrı bir alan eklenmez. Eski 52 kaydın stable ID'si, metni, legacy ilgi alanları ve yararlı dış bağlantıları korunur; kanıtsız toplu metadata migration'ı yapılmaz.

`actionUrl`/`actionLabel` çifti opsiyoneldir. Dış eylem taşımayan Fikir arayüzde bağlantı butonu göstermez ve açıklaması tek başına uygulanabilir olmalıdır. Şema/cache namespace v3'e yükseltilir; v2 remote snapshot yeni istemcide embedded v3'e güvenli fallback yapar, eski istemci de URL'siz v3 snapshot'ı kabul etmeyip kendi embedded kataloğuna düşer.

Batch A 34 tam yapılandırılmış Fikir ekler. Yeni metadata şimdilik editoryal-only kalır; öneri ağırlıkları, hard filtreler, 1+4 Fikir keşif kotası, çeşitlilik, rotasyon ve gerekçe üretimi değiştirilmez. Batch B/C ancak kalan araştırma havuzunun eylem-temelli deduplikasyonu ve editoryal incelemesinden sonra ayrı kapsam olarak ele alınır.

## 2026-09-16 — İçerik yaşam döngüsü ve dependency uygunluğu

Durum: Kullanıcı tarafından onaylandı; `codex/content-eligibility-infrastructure` dalında uygulanıyor, production'da doğrulanmadı.

Place yaşam döngüsü `active`, `deprecated`, `verification_required` durumlarıyla tutulur; genel bir `eligible` boolean'ı kullanılmaz. Öneri uygunluğu skordan önce merkezi kod politikasıyla hesaplanır. Deprecated ve verification-required Place önerilmez; hard-exclusion dışındaki deprecated kayıtlar tarihsel ve kayıtlı çözümleme için katalogda kalır. Yılmaz Güney Sahnesi normalize edilmiş ID/ad/alias eşleşmesiyle code-owned hard exclusion'dır; public yüzeylerde ve bağlı Experience'larda fail-closed uygulanır. Kronotrop Tunalı ve eski Ankara Sanat Tiyatrosu deprecated, Coffee Lab Bilkent verification-required olarak işaretlenir.

Experience yaşam döngüsü `evergreen`, `conditional`, `event_linked` sözleşmesine geçer. Conditional semantiği ayrıca onaylanana kadar fail-closed'dur; event-linked kayıt bağlı yaklaşan Event olmadan önerilemez. İlk altyapı PR'ı yeni Experience veya conditional/event-linked katalog kaydı eklemez, öneri ağırlıklarını/değerlerini, çeşitlilik, rotasyon, gerekçe veya kaydetmenin sıralamaya etkisizliği kararını değiştirmez. Schema ve cache namespace v2'ye yükselir; remote apply'dan önce read-only envanter preflight'ı gerekir.

## 2026-09-14 — EAS build yapılandırma varsayılanları

Kullanıcı, EAS CLI `>= 24.3.0`, `appVersionSource: remote`, `development`, `preview` ve `production` build profilleri, production `autoIncrement: true` ve boş `submit.production` placeholder'ıyla üretilen `eas.json` dosyasını değişiklik yapmadan onayladı. `development` profili korunur; `expo-dev-client` henüz kurulu değildir.

Bu yalnız repository build config kanıtıdır. EAS build çalıştırılmadı; Android keystore, Apple certificate veya provisioning profile oluşturulmadı; signing, Google Play, App Store Connect veya submission yapılandırması/kanıtı yoktur. `android_package_unverified` ve `ios_bundle_identifier_unverified` bu nedenle açık kalır; toplam açık yayın engeli sekizdir.

## 2026-09-14 — Kalıcı uygulama kimlikleri ve EAS proje bağlantısı

Kullanıcı Android application ID ve iOS bundle identifier için kalıcı değer olarak `com.getnapsak` değerini onayladı. Her iki platformun repository söz dizimi denetimi artık zorunlu nokta, boş olmayan etiketler, geçerli segment başlangıçları, platforma özgü karakterler, Android küçük harf kuralı ve placeholder reddini koruyarak en az iki segmente izin verir.

Söz dizimi geçerliliği dış kimlik kanıtından ayrıdır. Bu nedenle `android_package_unverified` ve `ios_bundle_identifier_unverified`, onaylı config değerlerine rağmen imzalı artifact ve ilgili mağaza kimliği kanıtları alınana kadar açık kalır.

Repository, authenticated `eas project:info` ile owner `napsaks-team`, slug `napsak-app`, fullName `@napsaks-team/napsak-app` ve gerçek project ID `af043dd8-412f-403e-81c3-6e0af8e024d6` eşleşmesine bağlandı. Bu dış hesap kanıtıyla yalnız `eas_project_id_unverified` kapatıldı. `eas build:configure`, imzalama, App Store Connect ve Google Play yapılandırması yapılmadı.

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

## 2026-09-19 — Fikir Expansion Batch C Ankara v1 genel havuzunu kapatır

Durum: `codex/idea-expansion-batch-c` dalında uygulandı; PR/CI bekliyor.

Önceden onaylanan Fikir Mimarisi havuzu, Batch A/B ve 52 legacy kayıtla normalize eylem düzeyinde son kez karşılaştırıldı. Kalite kapısını geçen 22 kayıt platformdan bağımsız, atomik yapılandırılmış metadata ile eklendi; 20 kalan aday yakın tekrar, genel telefon-detoks çerçevesi veya zayıf bağımsız eylem nedeniyle reddedildi. Bu Ankara v1 için son planlı genel Fikir genişletmesidir; sıradaki içerik işi final Experience Mining / Coverage Audit'tir. Yeni bir Fikir genişletmesi, legacy cleanup veya metadata migration ancak ayrı kapsam ve açık onayla yapılır. Bu karar öneri ağırlıklarını, filtreleri, 1+4 keşif kotasını, çeşitliliği, rotasyonu veya kayıtlı durum davranışını değiştirmez.

## Açık kararlar

- Foundation dışında kalan nihai logo/uygulama ikonu kararı.
- Etkinlik sağlayıcısının uzun vadede elle editoryal katalog mu yoksa onaylı bir API mı olacağı.
- Gerçek development/production servis durumu ve bağımsız yedekleme düzeni.

Yeni kayıt şablonu: tarih / karar / durum / gerekçe / önceki kararın yerine geçiyor mu / etkilenen dosyalar / kabul kriteri / uygulama ve test kanıtı.

## 2026-10-13 — Reviewed Event artwork inventory

Status: approved by the explicit Event artwork implementation request; implemented locally, Redmi acceptance pending. Refreshed Event IDs are reconciled into the existing structured JSON inventory. Approved subtype/icon/photo-family taxonomy and deterministic manifest generation supply responsive assets; runtime title inference is forbidden and unknown Event IDs retain neutral fallback. No new artwork, domain/Firebase schema or recommendation/layout change. The authoritative acoustic export remains unchanged. Contract and evidence: `EVENT_ARTWORK_CONTRACT.md`, `EVENT_ARTWORK_IMPLEMENTATION_REPORT.md`. Normal commit/push and one Draft PR authorized; no merge.

## 2026-10-13 — Production Preference Editor and global Event empty states

User approved the existing unfiltered Event behavior for this PR and corrected the earlier assumption of a production Event date context. No decorative Today/Tomorrow/Weekend chip row, functional date filters or date-related schema/input/state is introduced. Global no_current_catalog means no current Event in the usable active catalog. Date discovery is deferred to a separate approved-range/date_no_match design PR.

The approved Preference Editor opens from Home and directly in Event budget-only mode; drafts, Cancel/Apply, origin context and onboardingCompleted are preserved. Reason-aware Event panels, scoped Event restore and real catalog-only retry use existing eligibility/ranking and cache/embedded fallback. Contract: PREFERENCE_EVENT_CONTRACT.md. Implementation, preserved audit, local/browser/export evidence and pending Redmi/TalkBack acceptance: PREFERENCE_EVENT_IMPLEMENTATION_REPORT.md. Normal commit/push and one Draft PR authorized; no merge or #57 changes.
