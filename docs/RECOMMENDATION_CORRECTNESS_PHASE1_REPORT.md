# Recommendation Correctness Phase 1 — implementation report

13 October 2026. Repository evidence; no native or signed-release acceptance is claimed.

## Repository and authorization

Repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`, `keremtunaguneyy-byte/napsak-app`.
Initial branch: `codex/gezek-event-catalog-refresh-2026-10-12`; HEAD `07de1410f787c22de42608d6864fbf1643a36865`.
Fetched `origin/main`: `a37d1fc2cfe23ec06164c8165877345d804339c1`. Initial tracked tree was clean and identical to main. Open relevant PR #57 (`Preserve Experience primary-interest precedence`) is left untouched.

Implementation branch: `codex/gezek-recommendation-correctness-phase-1`, created directly from that fetched main. The user authorized normal commit/push and one Draft PR; no merge or force-push. Commit/PR identities and live CI completion belong to Git/PR metadata and the delivery report, not a guessed self-referential SHA in this file.

Unrelated untracked files `src/firebase/BA_4bit.sv/rtl/BA_4bit.sv` and `src/firebase/BA_4bit.sv/rtl/tbBA_4bit.sv` are preserved, never staged. Before/after SHA256 verification is performed before commit. No existing work was reset, cleaned, stashed or moved.

## Behavior and exact implementation

Duration preference is maximum available time. `durationEligible` compares only Experience `maxDurationMinutes` with 60 / 120 / 240 / 360; absent/Fark etmez has no duration gate. Estimates begin at the first stop, include transitions between stops and exclude travel to the first stop and homeward travel. They are editorial estimates, not completion guarantees. The reason now explicitly says estimate and excludes outward/homeward travel.

Within the existing Experience primary-interest tiers, a bounded soft score favors appropriate use of the time window:

```
target = (displayMinimum + selectedMaximum) / 2
estimate = (minDurationMinutes + maxDurationMinutes) / 2
fit = 16 * max(0, 1 - abs(estimate - target) / target)
```

Targets are 45 / 90 / 210 / 300 minutes. Score range is [0,16]; absent/Fark etmez scores 0. Exact target scores 16, half-target 8, twice-target 0. Primary `interestTier` precedes adjusted score. All existing mood, group, price-band, distance, confidence, freshness, seed and diversity weights remain unchanged; short plans remain valid fallback. This is a bounded preference, not a guarantee that fit overrides every other soft preference or seeded variation. No long-plan duration-fit reason is fabricated for short fallback.

Ücretsiz is a hard `priceLevel === 0` gate before scoring on Experience, Place, Idea and Event; the internal all feed inherits those gates. No paid fallback is available, including previous-batch and Idea quota fallback. Prose does not determine free status. Other budget bands keep their soft scoring. Budget reasons now state `ücretsiz`, exact selected paid-band match, or the neighboring record's own structured price band; paid content cannot receive an Ücretsiz affordability claim. Event budget explanations remain absent as before.

Experience runtime validation rejects non-finite, negative or inverted ranges. No documented global upper limit or integer-only Experience bound existed, so no invented cap or valid fractional-range rejection is added. Embedded catalog records are unchanged.

## Accessible duration supply

Budget unrestricted, no selected interests/dismissals; all 52 catalog Experiences pass current lifecycle/dependency checks.

| Preference | Before | After | Maximum |
|---|---:|---:|---:|
| 30–60 dk | 5 | 5 | 60 |
| 1–2 saat | 15 | 26 | 120 |
| 3–4 saat | 6 | 46 | 240 |
| Yarım gün | 5 | 52 | 360 |
| Fark etmez | 52 | 52 | unrestricted |

Before:22/52 plans were inaccessible through every explicit duration preference. After:0/52. This is accessible supply, not a claim that every plan ranks in the first five.

### Primary-interest supply: before→after

This table counts primary tags only, so secondary matches cannot conceal missing primary supply. No primary interest loses supply. Short/Lezzet still has no primary plan in the unchanged catalog; the short Lezzet result can only be a secondary match. All five primary interests have supply at 120 minutes and above after Phase1.

| Preference | Kahve | Sanat | Doğa | Lezzet | Etkinlik |
|---|---|---|---|---|---|
| 30–60 dk | 1→1 | 2→2 | 1→1 | 0→0 | 1→1 |
| 1–2 saat | 1→4 | 7→10 | 2→3 | 4→8 | 1→1 |
| 3–4 saat | 0→4 | 6→22 | 0→9 | 0→9 | 0→2 |
| Yarım gün | 0→4 | 1→24 | 3→12 | 1→10 | 0→2 |
| Fark etmez | 4→4 | 24→24 | 12→12 | 10→10 | 2→2 |

### Free-budget supply by recommendation surface

Fixed context: no interests/mood/group/duration/coordinates, no dismissals, now `2026-10-13T12:00:00+03:00`, seed 0. Supply is measured with an unlimited-size request; first-group counts use limit 5. Before paid counts demonstrate that Ücretsiz previously had no eligibility gate. After every returned item has structured price 0.

| Surface | Before eligible total (paid) | After eligible total (paid) | First group before→after |
|---|---|---|---|
| experience | 52 (35) | 17 (0) | 5→5 |
| place | 175 (107) | 68 (0) | 5→5 |
| event | 9 (9) | 0 (0) | 5→0 |
| idea | 140 (38) | 102 (0) | 5→5 |
| all | 376 (189) | 187 (0) | 5→5 |

Current Event catalog has nine paid entries and no free Event. A zero-result Ücretsiz Event surface is intentional. Free Experience primary supply is narrower than total accessible duration supply: Kahve/Lezzet/Etkinlik have no free primary Experience in the unchanged catalog; no paid or unrelated replacement is fabricated.

## Verification and performance

All checks used current implementation files. A fresh before-performance/quality measurement used the main archive verified to have the same tracked tree as initial HEAD. No historical audit result was substituted for current validation.

| Command | Result |
|---|---|
| `git diff --check` | Passed; repeated before commit |
| `npm ci` | Passed; exact lockfile, dependencies unchanged |
| `npm run typecheck` | Passed |
| `npm test` | Passed: 111 domain/release +109 other tests =220, no failures |
| `npm run test:catalog` | Passed: 1 city, 178 Place, 52 Experience, 9 Event, 140 Idea, 12 Guide |
| `npm run check:events` | Passed: 9 upcoming, 0 expired, 0 stale; approximately 28.73-day horizon at run time |
| `npm run check:accessibility` | Passed: 8 files, 16 minimum-target styles |
| `npm run test:stress` | Passed:2,560 Place +640 Experience contexts, no mismatch/duplicates;2,512 Place and 480 Experience large-pool rotation checks, overlap 0 |
| `npm run check:performance` | Passed:5,000 measured calls, p95 7.285 ms <25 ms |
| `npm run check:recommendations` | Passed:15 fixtures, objective failures 0 |
| `CI=1 EXPO_NO_TELEMETRY=1 npx expo export --platform android --output-dir /private/tmp/gezek-phase1-evidence/android-export` | Passed:Android Hermes bundle and local assets exported |
| `npm run check` | Not run:package.json has no `check` script |

Before→after performance: mean 2.711→2.370 ms, p50 1.097→1.049 ms, p95 7.520→7.285 ms, p99 7.916→7.535 ms. Benchmark checksum 23,624→22,308 reflects intentional supply changes, especially paid Event exclusion. These are host observations; neither an optimization claim nor device latency evidence.

Deterministic replay passes for identical catalog/context/time/seed/previousBatch. Output membership/order can intentionally change with new duration eligibility/fit and free eligibility; the PR does not promise identical old seeds across changed candidate pools. The PRNG, dismissal placement, saved independence and rotation/diversity selection rules are unchanged.

The first regression run found one stale aggregate location expectation (17/18). Its actual approved output is 14/16; the test was updated after inspecting the unchanged fixtures. Final npm test passes. No unrelated failure was suppressed.

npm ci reported 64 dependency vulnerabilities (24 moderate, 38 high, 2 critical); no dependency fix was attempted. Rules emulator, release-device, live Firebase, source-price re-verification and production deployment were not run: none is part of this scoped recommendation change. GitHub CI is separately checked for the exact pushed commit in the delivery report.

### Quality matrix delta

| Metric | Before | After |
|---|---:|---:|
| totalEligibleCandidateCount | 688 | 610 |
| totalResultCount | 70 | 72 |
| zeroResultCount | 0 | 0 |
| partialResultCount | 2 | 1 |
| fullFiveCount | 13 | 14 |
| primaryInterestMatchCount | 17 | 21 |
| secondaryOnlyInterestMatchCount | 3 | 1 |
| exactBudgetFitCount | 34 | 40 |
| groupFitCount | 65 | 67 |
| locationChangedSlotCount | 17 | 14 |
| locationSymmetricDifferenceCount | 18 | 16 |
| objectiveInvariantFailureCount | 0 | 0 |
| deterministicReplayFailures | 0 | 0 |

The candidate-total decline is expected from the free gate. Short/free Sanat+Doğa supplies 2 results instead of 4; no paid fillers. Sparse Kahve+3–4 hours supplies 7 and returns 4 primary +1 secondary instead of one secondary-only result. Same explicit Idea discovery fixture keeps its 1+4 quota.

## Regression coverage

- All52 embedded Experiences ×5 preferences through direct and public entry points.
- Independent minute-enumeration oracle across 600 generated boundary/preference cases, including29/30/60/61/119/120/121/179/180/181/239/240/241/360/361.
- All six approved crossing-range examples, exact maximum acceptance and one-minute-over rejection.
- Fit formula/weight boundary values; better fitted equivalent candidates across 32 seeds; primary before high-scoring secondary; shorter fallback and Fark etmez independence.
- Every surface:paid-only empty and free-only partial results with prior-batch fallback; mixed feed cannot refill from paid records.
- All 32 interest subsets ×5 durations ×5 surfaces, two batches and deterministic replay under Ücretsiz:1,600 recommendation calls plus800 exact replays, no paid leakage.
- Structured budget explanation truth for every price preference and every scoring path.
- Non-finite, negative and reversed duration rejection at individual and whole-snapshot validation boundaries; valid catalog unchanged.
- Dismissal, Place dependencies, unsupported conditional, exact Event-start lifecycle and saved independence; existing related-plan/lifecycle/persistence tests retained.

## Exact changed files

- `src/recommendations.ts`
- `src/recommendationQuality.ts`
- `src/data/catalogValidation.ts`
- `tests/domain.test.cjs`
- `tests/recommendation-quality.test.ts`
- `tests/recommendation-stress.cjs`
- `docs/PRODUCT_SPEC.md`
- `docs/ALGORITHM_SPEC.md`
- `docs/RECOMMENDATION_QUALITY_SPEC.md`
- `docs/DECISIONS.md`
- `docs/STATUS.md`
- `docs/RECOMMENDATION_CORRECTNESS_PHASE1_REPORT.md`

## Deferred behavior, risks and device checks

Group scoring, mood 48, location/radius/travel behavior, rotation redesign, Event catalog and start-time expiry, Idea1+4 selection, UI/Onboarding, Firebase contracts/rules/data, persistence schema, IDs/stop relationships and release config are unchanged. No valid catalog record was rewritten; no schema migration is needed.

Known deferred issues: small-pool rotation can repeat more than necessary; explicit group incompatibility remains soft; the hidden internal all feed retains its previous raw-score/tier behavior; location is still straight-line soft scoring; time estimates do not verify live opening/reservation/weather conditions. Event optional-context reasons can still be empty as before. The unchanged Event empty-state heading says “Yaklaşan etkinlik bulunamadı” even when Ücretsiz excludes upcoming paid inventory; budget-specific UI copy is deferred, not silently changed.

No remaining local verification blocker. Native manual checks remain pending:with Ücretsiz inspect all four tabs (Event intentionally empty), change to a paid band and recover Event results, test short/free partial cards without placeholders, verify 45–90 at 1–2 hours and 150–240 at 3–4 hours, check long fallback/primary relevance, read updated reasons in Detail with large text/TalkBack, and test refresh/save/dismiss/undo plus restart. Android export is not device acceptance or a signed release.

Recommended next step:review the Draft PR and its exact-commit CI; run these device checks before considering merge. Do not close production/release blockers from these local results.

## Appendix — all 52 Experiences, before/after duration matrix

Five-bit order:30–60 dk /1–2 saat /3–4 saat /Yarım gün /Fark etmez.1 = eligible. Eligibility here isolates duration with unrestricted budget and current valid dependencies. Primary column shows which primary-interest supply each restored plan affects; secondary tags are unchanged.

| ID | Title | Minutes | Primary | Before | After |
|---|---|---|---|---|---|
| xp-hacibayram-augustus | Hacı Bayram’da Roma Ankara’sını oku | 30–60 | Sanat | 10001 | 11111 |
| xp-botanik-atakule-short | Botanik Parkı’ndan Atakule’ye kısa manzara turu | 45–60 | Doğa | 10001 | 11111 |
| xp-tunali-kugulu-short | Tunalı kahvesi + Kuğulu kısa turu | 45–60 | Kahve | 10001 | 11111 |
| xp-meclis-duo-short | Birinci Meclis’ten İkinci Meclis’e 500 metrelik tarih | 45–60 | Sanat | 10001 | 11111 |
| xp-erimtan-kale | Erimtan’dan Kale surlarına çık | 90–120 | Sanat | 01001 | 01111 |
| xp-kugulu-segmenler | Kuğulu’dan Seğmenler’e yeşil mola | 75–105 | Doğa | 01001 | 01111 |
| xp-ulucanlar-hamamonu | Ulucanlar’dan Hamamönü’ne yakın tarih rotası | 90–120 | Sanat | 01001 | 01111 |
| xp-goksu-loop | Göksu’da tempo + göl turu | 75–120 | Doğa | 01001 | 01111 |
| xp-etnografya-resim | Etnografya’dan Resim ve Heykel’e iki müze | 180–210 | Sanat | 00101 | 00111 |
| xp-roma-meclis | Roma Hamamı’ndan Birinci Meclis’e zaman çizgisi | 180–240 | Sanat | 00101 | 00111 |
| xp-kelime-erimtan-kale | Kelimeden arkeolojiye, Kale’den han molasına | 180–240 | Sanat | 00101 | 00111 |
| xp-odtu-double-museum | ODTÜ’de bilimden arkeolojiye | 180–210 | Sanat | 00101 | 00111 |
| xp-anitkabir-maltepe | Anıtkabir’den Maltepe’ye Cumhuriyet rotası | 180–240 | Sanat | 00101 | 00111 |
| xp-mogan-halfday | Mogan kıyısında yarım günlük reset | 240–300 | Doğa | 00011 | 00011 |
| xp-eymir-halfday | Eymir’de yürüyüş + göl kıyısı molası | 240–330 | Doğa | 00011 | 00011 |
| xp-gordion-halfday | Gordion’da Frigya’ya yarım gün | 300–360 | Sanat | 00011 | 00011 |
| xp-beypazari-halfday | Beypazarı çarşısında tarih + yerel tat | 300–360 | Lezzet | 00011 | 00011 |
| xp-kizilcahamam-halfday | Kızılcahamam’da jeoloji + orman havası | 300–360 | Doğa | 00011 | 00011 |
| xp-no29-kahve-tatli | No29’da Kahve, Tatlı ve Biraz Nefes | 60–120 | Kahve | 01001 | 01111 |
| xp-federal-bilkent-demleme | Bilkent’te Demlemeye Odaklan | 45–90 | Kahve | 00001 | 01111 |
| xp-duveroglu-lahmacun | Düveroğlu’nda Lahmacun Molası | 60–90 | Lezzet | 01001 | 01111 |
| xp-trilye-balik | Trilye’de Balığa Zaman Ayır | 120–180 | Lezzet | 00001 | 00111 |
| xp-anadolu-kronolojik | Anadolu’yu Kronolojik Oku | 120–180 | Sanat | 00001 | 00111 |
| xp-hava-kuvvetleri-iki-saat | Uçakların Arasında İki Saat | 120–180 | Sanat | 00001 | 00111 |
| xp-mavi-gol-sehirden-uzak | Mavi Göl’de Şehri Geride Bırak | 150–240 | Doğa | 00001 | 00111 |
| xp-altinpark-uzun-ogleden-sonra | Altınpark’ta Uzun Bir Öğleden Sonra | 150–240 | Doğa | 00001 | 00111 |
| xp-dikmen-vadisi-kot-yuruyusu | Dikmen Vadisi’nde Kot Değiştirerek Yürü | 90–150 | Doğa | 00001 | 00111 |
| xp-da-vinci-yeni-oyun | Da Vinci’de Yeni Bir Oyun Öğren | 120–180 | Etkinlik | 00001 | 00111 |
| xp-tragos-tanitim-dersi | Tragos’ta İlk Bouldering Dersini Al | 60–60 | Etkinlik | 11001 | 11111 |
| xp-hanem-konya-sofrasi | Hanem — Konya Sofrası | 45–90 | Lezzet | 00001 | 01111 |
| xp-bolu-akin-eski-garajlar-tencere | Bolu Akın — Eski Garajlar’da Tencere Yemeği | 45–90 | Lezzet | 00001 | 01111 |
| xp-urumci-on-cebeci-uygur-sofrasi | Urumçi — Ön Cebeci’de Uygur Sofrası | 60–100 | Lezzet | 01001 | 01111 |
| xp-old-school-iki-demleme | Old School — İki Demleme Karşılaştır | 45–100 | Kahve | 00001 | 01111 |
| xp-cin-ali-iki-kusak | Cin Ali — Aynı Çizgide İki Kuşak | 60–120 | Sanat | 01001 | 01111 |
| xp-gokyay-satranc-taslari | Gökyay — Satranç Taşlarının Dünyasını Oku | 60–120 | Sanat | 01001 | 01111 |
| xp-ankara-palas-ikinci-tbmm | Ankara Palas + II. TBMM — Cumhuriyetin İki Sahnesi | 120–180 | Sanat | 00001 | 00111 |
| xp-eymir-bisikletle-dolas | Eymir’i Bisikletle Dolaş | 120–180 | Doğa | 00001 | 00111 |
| xp-aoc-kurulus-hikayesi | AOÇ’nin Kuruluş Hikâyesini Arazide İzle | 120–180 | Sanat | 00001 | 00111 |
| xp-sakarya-muharebesini-araziden-oku | Sakarya Muharebesi’ni Araziden Oku | 180–300 | Sanat | 00001 | 00011 |
| xp-bogazici-ulus-ogle-ritueli | Boğaziçi’nde Ulus Öğle Ritüeli | 45–90 | Lezzet | 00001 | 01111 |
| xp-aspava-ikram-ritueli | Aspava’nın İkram Ritüelini Yaşa | 60–90 | Lezzet | 01001 | 01111 |
| xp-ptt-pullardan-donem-oku | PTT Pul Müzesi’nde Bir Dönemi Pullardan Oku | 60–90 | Sanat | 01001 | 01111 |
| xp-cengelhan-teknolojinin-izini-sur | Çengelhan’da Bir Teknolojinin İzini Sür | 90–150 | Sanat | 00001 | 00111 |
| xp-arslanhane-alaaddin-selcuklu | Arslanhane’den Alaaddin’e Selçuklu Ankara’sı | 75–120 | Sanat | 01001 | 01111 |
| xp-altinkoy-koy-yasamini-uc-izden-oku | Altınköy’de Köy Yaşamını Üç İzden Oku | 180–240 | Sanat | 00101 | 00111 |
| xp-millet-kutuphanesi-derin-calisma | Millet Kütüphanesi’nde Derin Çalışma Bloğu | 120–240 | Sanat | 00001 | 00111 |
| xp-cubuk-1-baraji-muhendislik-gozu | Çubuk-1’de Barajı Mühendislik Gözüyle Oku | 120–240 | Doğa | 00001 | 00111 |
| xp-pecenek-iskitler-doner-ritueli | Peçenek’te İskitler Döner Ritüeli | 45–90 | Lezzet | 00001 | 01111 |
| xp-kitir-tunali-bulusma-hafizasi | Kıtır’da Tunalı’nın Buluşma Hafızasına Otur | 60–120 | Lezzet | 01001 | 01111 |
| xp-kecioren-cocuk-sanat-muzesi-rehber | Keçiören Çocuk Sanat Müzesi’nde Çocuğun Rehber Olsun | 60–90 | Sanat | 01001 | 01111 |
| xp-aqua-vega-uc-yasam-alani | Aqua Vega’da Üç Yaşam Alanını Karşılaştır | 90–150 | Doğa | 00001 | 00111 |
| xp-dost-konu-raf-haritasi | Dost’ta Bir Konunun Raf Haritasını Çıkar | 45–90 | Sanat | 00001 | 01111 |
