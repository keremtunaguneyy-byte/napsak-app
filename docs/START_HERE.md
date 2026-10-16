# Gezek — önce burayı oku

## 2026-10-17 — Production Ankara 101 implementation

All twelve approved Guide readers and the cover/index are implemented on `codex/gezek-production-ankara101` using exact live Figma nodes, unchanged approved local AI editorial masters, stable-ID routing and scoped licensed fonts. Exact-size local SVG instances preserve the small motifs’ stroke weights. Current catalog, Home/recommendations, Saved design, Insider access, collection identity and Firebase/persistence/release contracts are preserved. [ANKARA101_IMPLEMENTATION_REPORT.md](ANKARA101_IMPLEMENTATION_REPORT.md) records authority reconciliation, final verification, canonical per-guide evidence, fonts/licenses, changed-file inventory and the physical acceptance checklist. One Draft PR only; no merge. Redmi, real TalkBack, OS large text/reduced motion and signed-release acceptance remain pending. Earlier Ankara 101 visual-open notes are historical; visual approval does not imply device acceptance. Unrelated Verilog work remains protected.

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


## 2026-10-15 — Final location preflight / Draft #76

Verified local/remote/PR head `e1dd5d9` and fetched main `746aad3`. New user-reported Redmi evidence shows Expo Go Quick Settings may emit neither active nor focus. The visible batch is an accepted last-acquired-location snapshot. Every new Home and Place-related recommendation computation now uses one read-only validity resolver; absent cache skips native reads, invalid/error/2 s one-shot timeout clears cache and computes locationless. No polling or automatic GPS. Current local/browser/export evidence and pending exact-head Redmi retest: [EXPERIENCE_DISTANCE_REPORT.md](EXPERIENCE_DISTANCE_REPORT.md). Same branch/Draft #76 only; normal commit/push, no merge, #57 or Verilog work.

## 2026-10-14 — Redmi location validity correction / Draft #76

Continues `fd766d8` on `codex/gezek-plan-distance`; user reports Redmi checks 1–6 passed and check 7 found stale coordinates after disabling Android services. Foreground active/Android focus now revalidate services and existing permission without prompting/GPS; serialized debounced generations reject obsolete checks and late fixes. Invalidation clears Place/Experience presentation and future-batch coordinates while preserving the visible batch, seed/state/scroll; scoring formulas/catalog remain unchanged. Current 281 tests, 18 focused tests, 56 existing + 61 lifecycle browser checks and Android export pass. [EXPERIENCE_DISTANCE_REPORT.md](EXPERIENCE_DISTANCE_REPORT.md) records exact source/API audit, evidence and pending new-head Redmi retest; [changed-file inventory](EXPERIENCE_DISTANCE_CHANGED_FILES.txt). Normal same-branch commit/push/update Draft #76 only; no merge, #57 or Verilog changes.

## 2026-10-14 — Experience start distance

Verified merged #75 / fetched main `746aad3`; branch `codex/gezek-plan-distance`. All 52 Experience starts and ordered Place links pass the complete coordinate audit, with exact first-stop equality. `Başlangıca … km` is presentation-only; location arrival preserves the current Gezek batch and the existing proximity formula remains active on subsequent independently triggered batches. Shared cards and request-lifecycle guards are included. Complete audit, current location/scoring findings, command/browser/export evidence and pending physical Redmi/TalkBack acceptance: [EXPERIENCE_DISTANCE_REPORT.md](EXPERIENCE_DISTANCE_REPORT.md). Normal commit/push and one Draft PR authorized; no merge, production changes or #57 work.

## 2026-10-13 — Production first-run onboarding

Verified baseline: PR #74 merge `782723c9b2d6aff17363a3c8f2532efcde107f55`. Implementation remains on `codex/gezek-production-onboarding`. Approved minimum-one Interest is scoped to first run; legacy empty arrays, domain and Preference Editor remain compatible. Read `ONBOARDING_IMPLEMENTATION_REPORT.md` for the final contract, preserved audit, exact local/browser/export evidence and pending Redmi acceptance. No merge or production operation is authorized.

## 2026-10-10 — Detail Flow PR 2

Live fetched main is `30b96c059f242ec91d886e9480afb2491c31ab4a`; PR #69 is merged per the current user baseline. Historical “unmerged / PR 2 unauthorized / Figma bookmark sync pending” notes below are superseded by the current user authorization and live Figma bookmark reconciliation. Event/Idea internal detail and minimum Saved routing are implemented on `codex/gezek-detail-event-idea`. Validation, scope, known identical Event-health failure and pending native acceptance: `DETAIL_FLOW_PR2_IMPLEMENTATION_REPORT.md`. Normal commit/push and one Draft PR are authorized; no merge or Onboarding.


## Güncel Detail Flow — 8 Ekim 2026

Kullanıcı PR 1 handoff’unu bağlayıcı sözleşme olarak onayladı. `DETAIL_FLOW_PR1_CONTRACT.md` canlı Figma Plan/Place otoritesini ve uygulama sınırını; `DETAIL_FLOW_PR1_IMPLEMENTATION_REPORT.md` güncel kanıtı açıklar. Shared Detail Host + Plan/Place `codex/gezek-detail-plan-place` dalındadır; merge ve PR 2 yok. Aşağıdaki eski Home/Detail onay ve SHA kayıtları tarihseldir.


Güncelleme: 6 Ekim 2026. Bu klasör sohbetlerden ve model sağlayıcısından bağımsız proje hafızasıdır. Tüm sohbet transkriptinin eksiksiz arşivi değildir.

## Okuma sırası

1. PRODUCT_SPEC.md: ürünün amacı, kapsamı, kalıcı kararlar ve gerekçeleri.
2. STATUS.md: hangi sürümde ne var, ne doğrulandı, sıradaki iş.
3. İşine göre DESIGN_SPEC.md, ALGORITHM_SPEC.md, RECOMMENDATION_QUALITY_SPEC.md, FIREBASE_RUNBOOK.md, OBSERVABILITY_RUNBOOK.md, ANALYTICS_SPEC.md, EVENT_OPERATIONS_RUNBOOK.md, PERFORMANCE_RUNBOOK.md, DEVICE_ACCEPTANCE_RUNBOOK.md veya RELEASE_RUNBOOK.md.
4. DECISIONS.md: son kararlar, öneriler ve açık konular.

Yeni bir asistan önce bu dosyaları gerçekten açmalı; erişemediği kaynakları ve incelediği branch/commit'i belirtmeli. Kullanıcıya bütün ürünü yeniden anlattırmamalı. Belgeyle kod çelişiyorsa bunu açıklamalı; sessizce ürün kararı değiştirmemeli.

## Dosyaların görevleri

| Dosya | Yetkili olduğu bilgi |
|---|---|
| PRODUCT_SPEC.md | Ne yapıyoruz ve neden? |
| DESIGN_SPEC.md | Görünüm, bilgi hiyerarşisi, etkileşim, referanslar, Ankara 101 karakteri |
| PRODUCTION_HOME_DESIGN_CONTRACT.md | Güncel Figma Home otoritesi, native layout, onaylı geçici fotoğrafsız fallback ve kabul sınırları |
| HOME_STABILIZATION_REPORT.md | PR #67 Redmi Home entegrasyon düzeltmesi, plan/harita denetimi, render ölçümü ve kalan cihaz kontrolleri |
| ALGORITHM_SPEC.md | Uygunluk, sıralama, çeşitlilik, içerik sözleşmesi |
| RECOMMENDATION_QUALITY_SPEC.md | Deterministik kalite fixture'ları, ölçüm tanımları ve insan değerlendirme hazırlığı |
| FIREBASE_RUNBOOK.md | Backend işletimi, veri yayını, migration, güvenlik ve yedek prosedürleri |
| OBSERVABILITY_RUNBOOK.md | Hata gözlemi, veri minimizasyonu, Sentry ortamı ve canlı doğrulama |
| ANALYTICS_SPEC.md | İzinli ürün olayları, yasak kişisel alanlar ve sağlayıcı/izin kapısı |
| EVENT_OPERATIONS_RUNBOOK.md | Etkinlik envanteri, kaynak tazeliği, günlük kontrol ve yenileme prosedürü |
| PERFORMANCE_RUNBOOK.md | Öneri benchmarkı, kaba cihaz süreleri, bütçeler ve regresyon prosedürü |
| DEVICE_ACCEPTANCE_RUNBOOK.md | Kritik kullanıcı yolculukları, cihaz matrisi, release kabul ayrımı ve kanıt biçimi |
| RELEASE_RUNBOOK.md | Yayın engelleri, production kapısı, staged dağıtım ve geri dönüş prosedürü |
| STATUS.md | Sürüme bağlı gerçekleşen işler, kanıt ve sonraki çalışma |
| DECISIONS.md | Tarihli karar, gerekçe, durum ve etkilenen dosyalar |
| BRAND_RENAME.md | Gezek adlandırma sınırı ve korunan teknik kimlikler |

## Bir kararın kayıt yolu

Kullanıcı onayı → ilgili şartname güncellemesi → DECISIONS kaydı → uygulama ve ilgili doğrulama → STATUS güncellemesi → incelenebilir PR. Karar durumu (öneri, onaylı, uygulanmış) ile kanıt seviyesi (repository/kodda mevcut, otomatik veya manuel test edilmiş, gerçek production ortamında doğrulanmış) ayrı kaydedilir; biri diğerini otomatik olarak gerektirmez. Önceki kararlar PRODUCT_SPEC §15'te korunur; yeni kayıtlar DECISIONS'ta tutulur.

Tasarım sohbeti tasarım çıktısı ve karar özeti üretir. Kodlama hattı repo değişikliklerini birleştirir. Farklı sohbetlerin birbirinin son mesajını otomatik gördüğü varsayılmaz. Tasarım sohbetinin repo erişimi yoksa güncel dosyalar ona eklenir; ürettiği güncelleme tek uygulama hattından repoya alınır.

## Taşınabilirlik ve yedek

Başka yapay zekâya bu klasörü ve ilgili kodu ver; yalnız eski sohbet bağlantısı veya geçici dosya yolu yeterli değildir. Görsel değerlendirme için DESIGN_SPEC'teki gerçek referans dosyalarını da ekle. Tasarımın her ayrıntısı metinden yeniden üretilemez.

GitHub sürüm geçmişi kararların eski hâline dönmeyi sağlar. Aynı depodaki ikinci klasör bağımsız yedek değildir. Önemli kilometre taşında tam git yedeği ve tasarım kaynakları ayrı bir konuma alınmalı; Firebase kullanıcı/katalog verisi ayrıca yedeklenmelidir. Bu belge düzenli yedekleme servisi kurulduğu anlamına gelmez. Repo erişimi olan ortamda örnek dış yedek: `git bundle create /guvenli-konum/napsak.bundle --all`; ardından `git bundle verify /guvenli-konum/napsak.bundle`. Secret ve kişisel kullanıcı verilerini tasarım devir paketine ekleme.

## Güncel görev

Kamuya açık ürün adı **Gezek**'tir; N’apsak önceki çalışma adıdır. Adlandırma temeli ve korunacak teknik kimlikler `BRAND_RENAME.md` içinde kayıtlıdır. Güncel Home görsel otoritesi ve uygulama sözleşmesi `PRODUCTION_HOME_DESIGN_CONTRACT.md` içindedir; canlı Figma, 1 Ekim PNG/SVG Home devir otoritesinin yerine geçer. Bundle'daki ilk uygulama mevcut `codex/gezek-ui-foundation` dalına fast-forward ile alınarak PR #67'de uzlaştırıldı. 8 Ekim kullanıcı Redmi Home kabulünü tamamladı ve PR #67 merge edildi; güncel main `4f3a720` Git ile doğrulandı. Kalan filtre gecikmesi ayrı `codex/gezek-home-native-performance` / Draft follow-up kapsamındadır; native zamanlama henüz ölçülmedi. Nihai logo/uygulama ikonu kararı açıktır ve geçici wordmark tek bileşenden değiştirilecektir.

Tarihsel #37 kontrol noktası `72122d613bbca64601ed3a646ff3ff025015fe1c` commit'idir; canlı HEAD için Git ve güncel yayın durumu için STATUS.md yetkilidir. #35 release gate/readiness/rollback yönetişimini kodda uygulayıp test etti; production onayı vermedi. #36 yalnız proje hafızası/dokümantasyon senkronudur; yeni ürün davranışı veya ürün kararı değildir. #37 cihaz kabul sözleşmesini ve kanıt biçimini repository'de tanımladı; imzalı release cihaz kabulü yapılmadı ve `release_device_matrix_unverified` açık kaldı. Gerçek EAS proje bağlantısı daha sonra doğrulanarak ilgili engel kapatıldı; güncel toplam sekiz yayın engeli vardır. Gerçek bulut restore provası ile production Sentry, source map ve dashboard kanıtı ayrı açık yayın kapılarıdır. Canlı analitik sağlayıcısı ayrıca açık bir karardır ve yayın engeli listesinde yer almaz. Kabul kriterleri STATUS.md, PERFORMANCE_RUNBOOK.md, DEVICE_ACCEPTANCE_RUNBOOK.md, RELEASE_RUNBOOK.md, FIREBASE_RUNBOOK.md, EVENT_OPERATIONS_RUNBOOK.md, OBSERVABILITY_RUNBOOK.md ve ANALYTICS_SPEC.md içindedir.

## 2026-10-13 — Event artwork reconciliation

Reviewed stable-ID subtype mapping and deterministic generator contract: `EVENT_ARTWORK_CONTRACT.md`. Nine current Event reconciliation, all local checks/browser/Android evidence and pending Redmi acceptance: `EVENT_ARTWORK_IMPLEMENTATION_REPORT.md`. No Event facts, recommendation logic or layouts changed. Normal commit/push and one Draft PR authorized; no merge.

## 2026-10-13 — Preference Editor / Event empty-state implementation

Current approved scope and explicit date-filter deferral: `PREFERENCE_EVENT_CONTRACT.md`. Production preference overview, budget-only Event entry, global reason-aware panels, Event-only restore, real retry and context/focus contracts: `PREFERENCE_EVENT_IMPLEMENTATION_REPORT.md`. Pre-implementation audit is preserved under `docs/evidence/preference-event`. No onboarding implementation or date-chip row; Redmi checks 1–4 are user-accepted; the narrow Close SVG alignment correction is documented in that report. TalkBack acceptance is explicitly deferred and pending. Local/browser/Android export evidence remains separate from native and signed-release evidence. One Draft PR, unmerged.
