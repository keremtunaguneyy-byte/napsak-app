# Gezek — önce burayı oku

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
