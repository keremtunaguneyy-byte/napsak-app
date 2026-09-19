# N’apsak — Recommendation Quality Baseline

Baseline date: 16 September 2026. This document defines measurement and characterization only. It does not approve a ranking change.

## 1. Purpose and scope

This baseline makes the current Ankara recommendation behavior reproducible before any quality tuning. It measures the embedded production catalog offline through the same public recommendation entry point used by the app.

The following are explicitly unchanged:

- recommendation weights and score formulas;
- hard-interest filtering and eligibility-before-ranking;
- dismissed-before-scoring behavior;
- Experience duration semantics;
- Experience primary-versus-secondary ordering and `interestTier` behavior;
- group-size logic;
- Event start-time expiry behavior;
- diversity penalties and rotation behavior;
- saved-status ranking behavior;
- content data, stable IDs, `cityId`, and `Experience.points[].placeId` relationships;
- the Fikir tab's Idea 1+4 controlled-discovery behavior.

The harness exercises only the visible `experience`, `place`, `event`, and `idea` filters. It does not expose or promote the internal mixed/`all` feed. A five-item result is a maximum, not a quota: the measurement must not manufacture unrelated or otherwise ineligible content to fill five slots.

## 2. Baseline source and known documentation conflict

The eligibility infrastructure work starts from verified `main` commit `d32c9bfae8a02d0bd5819279a0c3767f7b7445fe`. The project-memory rules in `PRODUCT_SPEC.md` and `ALGORITHM_SPEC.md` remain the product contract.

One stale documentation statement was found and is not resolved by this measurement change: `ALGORITHM_SPEC.md` says the place-related-plan work from #21 is not yet on `main`, while current code, `PRODUCT_SPEC.md`, and `STATUS.md` show that it is present. The quality harness does not change that behavior.

## 3. Quality dimensions

| Dimension | What this phase measures | Enforcement in this phase |
|---|---|---|
| Correctness and invariants | dismissals, expiry/lifecycle, duration, uniqueness, limit, explanations, deterministic replay, location not changing eligibility | Objective failures block `check:recommendations` |
| Supply and coverage | eligible candidates, 0 results, 1–4 results, full 5 results, duration exclusions, current and stale Event supply | Report; leakage is blocking |
| Ranking quality | mood, interest, exact-budget, group, Experience primary/secondary matches, location-on/off output delta | Report only |
| Diversity | distinct categories and districts in the first batch | Report only |
| Repetition | adjacent overlap and repeated items/slots across three seeded refreshes | Report only |
| Explanation quality | explanation presence and total reason count | Presence blocks; wording quality is human-reviewed |
| Performance | latency distribution for a single `recommendAll` call across the fixture matrix | Report only here; the existing performance budget remains authoritative |
| Future human evaluation | contextual relevance, actionability, honesty, local plausibility, explanation usefulness, and set-level diversity | Not scored automatically in Phase 1 |

Subjective metrics deliberately have no pass/fail target in this phase. A baseline observation is not an approved optimization objective.

## 4. Measurement contract

All percentages use each scenario's first result batch. Rotation uses three consecutive seeded batches where batch 2 receives batch 1 as `previousBatch`, and batch 3 receives batch 2. The third batch therefore characterizes the current immediate-previous-batch memory; it does not assume longer history than production currently uses.

### 4.1 Supply and result counts

- `eligibleCandidateCount`: catalog items that survive the current filter's dismissed, interest, duration, lifecycle, and Event start-time eligibility rules before scoring, diversity adjustment, rotation, or final selection.
- `eligibleCandidatesByKind`: the same count split by content kind.
- `resultCount`: the number returned by the current recommender, capped at five.
- `zeroResultRate`: scenarios whose first batch has zero results divided by all scenarios.
- `partialResultRate`: scenarios whose first batch has one through four results divided by all scenarios.
- `fullFiveRate`: scenarios whose first batch has exactly five results divided by all scenarios.
- `durationExcludedCount`: otherwise eligible Experience candidates removed only because of the selected duration.

The candidate total is a sum across contexts, not a count of unique catalog records.

### 4.2 Context-fit characterization

- `moodMatchCount`: returned items whose mood tags include the selected mood. No-mood fixtures have no mood-fit denominator.
- `interestMatchCount`: returned items matching at least one selected interest through the current content-type semantics. Cold start has no interest-fit denominator.
- `exactBudgetFitCount`: returned items whose `priceLevel` exactly equals an explicit budget level. `Fark etmez` and missing budget have no exact-fit denominator. Budget remains a ranking signal, not a hard filter.
- `groupFitCount`: Experience, Event, and Idea use explicit `groupSizes`; Place uses the current positive place group-scoring signal. Group remains a ranking signal.
- `primaryInterestMatchCount`: returned Experiences matching at least one selected `primaryInterest`.
- `secondaryOnlyInterestMatchCount`: returned Experiences with no selected primary match but at least one selected secondary match.

These counts characterize the current top results. They do not prove that a result is useful to a person.

### 4.3 Location behavior

For every fixture with coordinates, the harness replays the first seed with coordinates omitted and reports:

- the ordered location-on and location-off IDs;
- overlapping IDs;
- IDs at the same rank;
- changed slots;
- symmetric ID difference;
- eligible-candidate-count delta.

The harness represents location input with explicit `scenario`, `none`, and `explicit coordinates` modes. Location-off uses `none`; it does not use `undefined` as an overloaded fallback value.

`changedSlotCount` is the number of result-list positions whose ID differs between the location-on and location-off runs. It includes both rank movement among shared IDs and replacement by a different ID; it is therefore not named or interpreted as a count of moved shared items. `symmetricDifferenceCount` separately reports membership replacement regardless of rank.

Coordinates may affect scores and order, but must not become a hidden eligibility filter. A non-zero candidate-count delta is an objective failure. The explicit no-location-permission fixture also verifies that recommendations remain available without coordinates.

### 4.4 Diversity and repetition

- `categoryDistribution`: first-batch count by category.
- `districtDistribution`: first-batch count by district for Places and Experiences; Event and Idea report `not-applicable` because their current types do not carry a district.
- `categoryDiversityMean` and `districtDiversityMean`: mean number of distinct applicable values per first batch, including zero for a zero-result batch.
- `adjacentOverlapCounts`: overlap between batches 1→2 and 2→3.
- `uniqueResultCount`: unique IDs across all three batches.
- `repeatedResultCount`: distinct IDs appearing more than once across the three batches.
- `repeatedSlotCount`: total occurrences beyond the first occurrence of each ID.

No universal repetition threshold is approved here. Scarce eligible pools are expected to repeat instead of being filled with weak results.

### 4.5 Explanations and deterministic replay

- `reasonCount`: total generated reason strings.
- `resultsWithReasons`: returned items with at least one reason.
- `deterministicReplay`: exact output equality for identical catalog, context, time, seed, and previous batch.

Missing explanations and non-deterministic replay are objective failures. Human reviewers still need to decide whether the reason is accurate, useful, natural, and proportional to the actual match.

### 4.6 Event freshness and lifecycle correctness

For the fixed scenario instant the harness reports upcoming, expired, invalid-start, and stale-verification Event counts using the repository's Event operations contract. Returned expired/invalid Events, Experience records with ineligible Place dependencies, unsupported conditional records, invalid event-linked records, and duration-ineligible Experiences are objective leakage failures.

The recommendation engine currently treats an Event as expired at its scheduled start, as documented in the code and existing tests. This phase records that behavior and does not reinterpret `endsAt`.

### 4.7 Latency

`check:recommendations` records mean, p50, p95, and p99 wall-clock latency over 300 individual `recommendAll` calls: 15 scenarios × 20 seeds. It also emits a result-count checksum. These figures are local-process observations and vary by host. They do not replace `check:performance`, its 5,000-call p95 budget, or signed-release device evidence.

## 5. Deterministic Ankara persona/scenario matrix

These fixtures are deterministic quality probes, not statistically representative users, cohorts, personas inferred from real user data, or evidence of product-market fit.

| Fixture | Surface | Fixed context | Measurement purpose |
|---|---|---|---|
| Solo student · Tunalı · Kahve + Sanat | N’apsak/Experience | Sakin, ₺, Tek, location on, any duration | Local dual-interest and price context |
| Couple · Ulus · Sanat | N’apsak/Experience | Meraklı, ₺, 2 kişi, 1–2 saat, location on | Culture supply in a central district context |
| 3–4 friends · Çukurambar · Lezzet + Etkinlik | Mekân | Sosyal, ₺₺, 3–4 kişi, location on | Social dual-interest Place ranking |
| 5+ group · Eryaman · Doğa + Etkinlik | Mekân | Enerjik, Ücretsiz, 5+, location on | Large-group and west-Ankara proximity context |
| No location permission | Mekân | Sakin, Doğa, Ücretsiz, Tek, no coordinates | Location-off availability and deterministic ranking |
| Cold start / no interests | N’apsak/Experience | No mood, interest, budget, group, duration, or coordinates | Editorial fallback without inferred preferences |
| Tight budget | Mekân | Meraklı, Sanat + Doğa, Ücretsiz, 2 kişi | Free-budget ranking signal without hard filtering |
| Expensive budget | Mekân | Sosyal, Lezzet, ₺₺₺, 2 kişi | Premium exact-price fit |
| Flexible budget | Mekân | Sosyal, Lezzet, Fark etmez, 2 kişi | Absence of an exact price target |
| Short duration | N’apsak/Experience | Sakin, Sanat + Doğa, 30–60 dk | Short-duration hard eligibility |
| Long duration | N’apsak/Experience | Enerjik, Doğa + Sanat, Yarım gün, 5+ | Long-duration supply without short-plan filling |
| Sparse-interest context | N’apsak/Experience | Meraklı, Kahve, 3–4 saat, Tek | Honest partial result from a narrow intersection |
| Active Event catalog | Etkinlik | 14 Sep 2026 12:00 TRT, Sosyal, Etkinlik, ₺₺₺, 3–4 kişi | Refreshed supply and a full five-result group |
| Later Event catalog checkpoint | Etkinlik | 21 Sep 2026 12:00 TRT | Remaining refreshed Event supply one week on |
| Controlled 1+4 discovery | Fikir | Meraklı, Kahve + Sanat, Fark etmez, 2 kişi | One selected-interest result plus four independent discoveries |

## 6. Event Freshness Refresh #1 baseline

Command: `npm run check:recommendations`. Catalog version: `2026-09-16.3`. Result limit: 5.

| Measure | Before (`2026-09-16.2`) | After (`2026-09-16.3`) |
|---|---:|---:|
| Scenarios | 15 | 15 |
| Eligible candidates, summed across contexts | 448 | 467 |
| First-batch results | 63 | 69 |
| Zero-result scenarios | 1 / 15 (6.67%) | 0 / 15 (0.00%) |
| 1–4-result scenarios | 3 / 15 (20.00%) | 2 / 15 (13.33%) |
| Full-five scenarios | 11 / 15 (73.33%) | 13 / 15 (86.67%) |
| Results with explanations | 63 / 63 | 69 / 69 |
| Reason strings | 255 | 274 |
| Mood matches | 55 | 62 |
| Interest matches | 54 | 60 |
| Exact budget fits | 35 | 37 |
| Group fits | 58 | 64 |
| Experience primary matches | 16 / 19 interest-bearing Experience results | 16 / 19 interest-bearing Experience results |
| Experience secondary-only matches | 3 / 19 interest-bearing Experience results | 3 / 19 interest-bearing Experience results |
| Mean distinct categories per first batch | 2.533 | 2.600 |
| Mean distinct applicable districts per first batch | 2.600 | 2.600 |
| Distinct repeated IDs across three-batch fixture runs | 45 | 51 |
| Repeated slots across three-batch fixture runs | 63 | 65 |
| Location-paired scenarios | 9 | 9 |
| Location-paired changed slots | 18 | 18 |
| Location-paired symmetric membership difference, summed | 16 | 16 |
| Deterministic replay failures | 0 | 0 |
| Stale/expired/invalid lifecycle leakage | 0 | 0 |
| Objective invariant failures | 0 | 0 |

Supply-specific observations:

- The Ulus couple fixture has three eligible 1–2-hour Sanat Experiences and returns all three.
- The sparse Kahve + 3–4-hour fixture has one eligible secondary-interest Experience and returns one.
- At the fixed 14 September 12:00 TRT supply checkpoint, all 12 refreshed Events have future start times. The Event surface returns a full five-item group instead of the previous four. Because the refreshed records were verified on 16 September, this historical checkpoint is used for supply/ranking comparison rather than operational verification-age health.
- At the fixed 21 September 12:00 TRT checkpoint, the first Event has started and 11 remain upcoming. The Event surface returns five instead of the previous zero.
- The Fikir fixture returns one selected-interest idea plus four independent discoveries and produces 14 unique items across three batches.
- The short and half-day fixtures each have exactly five eligible Experiences. Their three refreshes necessarily repeat the entire supply.
- Cold start has 29 eligible Experiences and produces 15 unique items across three adjacent five-item batches.
- Correct location-off replays change 18 of 43 compared result slots across the nine paired fixtures. Five fixtures change membership: solo has four shared IDs and a symmetric difference of two; Çukurambar friends has three shared IDs and a symmetric difference of four; tight budget and expensive budget each have four shared IDs and a symmetric difference of two; flexible budget has two shared IDs and a symmetric difference of six. Couple and large-group fixtures keep the same members but swap ranks. Short-duration and long-duration keep the same order.

A recorded post-refresh local latency sample was mean 1.446 ms, p50 0.850 ms, p95 3.698 ms, and p99 3.975 ms over 300 calls. This is a host-specific observation, not a fixed golden assertion.

## 7. Interpretation cautions

- A high match count can be tautological when an interest is also a hard eligibility filter. It proves no leakage, not subjective relevance.
- Exact budget fit does not describe affordability within a price band or value for money.
- Place group fit reflects the existing heuristic, not explicit venue capacity or accessibility evidence.
- District diversity does not apply to current Event and Idea types.
- Location changes membership or ordering in seven of the nine paired fixtures at these seeds. Short-duration keeps the same order despite positive proximity contributions; long-duration keeps the same order because all five eligible plans are beyond the Experience proximity-score radius. These findings characterize the current catalog and score balance; they are neither a defect assertion nor permission to change weights.
- `interestTier` is applied before adjusted score inside direct `recommendExperiences` candidate selection. `recommendAll` requests a wider Experience candidate set and may subsequently re-sort it by raw score, so primary-before-secondary is not an unconditional visible-feed ordering guarantee.
- The current rotation remembers only the immediately previous batch. Large pools often avoid adjacent overlap while allowing batch-1 items to return in batch 3.
- The fixed Event checkpoints remain at 14 and 21 September so pre/post refresh supply is comparable. They must not be moved forward automatically. Operational verification age is measured separately by `check:events` against the real run time.

## 8. CI policy

`check:recommendations` is deterministic apart from reported wall-clock latency and is fast enough for the App Quality workflow. CI fails only for objective invariants:

- non-deterministic replay;
- dismissed leakage;
- expired/invalid Event leakage;
- ineligible Place dependency or expired/invalid Experience lifecycle leakage;
- duration leakage;
- duplicates inside a batch;
- more than five results;
- more results than eligible candidates;
- missing explanations;
- coordinates changing eligibility.

CI does not initially fail on candidate supply, full-five rate, match counts, diversity, repetition, location rank delta, reason count, or latency from this harness. The existing recommendation performance budget continues to enforce its separate objective threshold.

## 9. Future human evaluation

A later review can score the saved machine-readable batches without changing the fixtures. Reviewers should see the context, ordered results, and explanations, but not score internals. Suggested 1–5 rubrics are:

1. contextual relevance: would this person reasonably choose the result now?
2. actionability: is it clear what to do next?
3. constraint honesty: do time, budget, group, location, and freshness claims match the catalog?
4. explanation usefulness: does the reason identify the strongest real match rather than repeat generic copy?
5. local plausibility: does the ordering make sense for Ankara and the stated district?
6. set quality: does the batch offer meaningful variety without sacrificing relevance?
7. refresh value: does the next batch feel materially different when supply permits?

Human review should record reviewer count, rubric version, catalog version, fixture ID, seed, disagreements, and written failure examples. No target score or automatic promotion threshold is approved in Phase 1.

## 10. Running and consuming the harness

- Human plus machine-readable output: `npm run check:recommendations`
- Machine-readable line only: `npm run check:recommendations -- --json`

The machine record is the JSON payload following `RECOMMENDATION_QUALITY_JSON=`. Schema version 2 adds the ordered location-on/off IDs, uses `changedSlotCount`, and includes the aggregate symmetric membership difference. The payload also contains the catalog version, scenario definitions by stable ID, three batch summaries, aggregate metrics, objective failure list, and latency sample. The harness requires no Firebase project, credentials, network, device, or content write.

## 11. Ankara Content Batch #2 delta

Command: `npm run check:recommendations -- --json`. Catalog version: `2026-09-18.1`. Result limit: 5.

| Measure | Before (`2026-09-16.3`) | After (`2026-09-18.1`) |
|---|---:|---:|
| Scenarios | 15 | 15 |
| Eligible candidates, summed across contexts | 467 | 481 |
| First-batch results | 69 | 69 |
| Zero-result scenarios | 0 / 15 (0.00%) | 0 / 15 (0.00%) |
| 1–4-result scenarios | 2 / 15 (13.33%) | 2 / 15 (13.33%) |
| Full-five scenarios | 13 / 15 (86.67%) | 13 / 15 (86.67%) |
| Results with explanations | 69 / 69 | 69 / 69 |
| Reason strings | 274 | 274 |
| Mood matches | 62 | 62 |
| Interest matches | 60 | 60 |
| Exact budget fits | 37 | 37 |
| Group fits | 64 | 64 |
| Experience primary matches | 16 / 19 | 16 / 19 |
| Experience secondary-only matches | 3 / 19 | 3 / 19 |
| Mean distinct categories per first batch | 2.600 | 2.600 |
| Mean distinct applicable districts per first batch | 2.600 | 2.533 |
| Distinct repeated IDs across three-batch fixture runs | 51 | 56 |
| Repeated slots across three-batch fixture runs | 65 | 70 |
| Location-paired changed slots | 18 | 20 |
| Location-paired symmetric membership difference, summed | 16 | 18 |
| Deterministic replay failures | 0 | 0 |
| Stale/expired/invalid lifecycle leakage | 0 | 0 |
| Objective invariant failures | 0 | 0 |

Changed coverage intersections account for the full candidate-total increase of 14: the Çukurambar friends Place fixture gains four candidates, the Eryaman large-group Place fixture gains four, cold-start Experience gains three, tight-budget Place gains one, expensive-budget Place gains one, and flexible-budget Place gains one. The remaining nine fixture candidate counts do not change. The short- and long-duration fixtures each gain one otherwise matching Experience that is correctly excluded by duration, so their returned supply remains five.

The unchanged result and explanation totals show that this batch expands eligible supply without manufacturing extra slots in already-full first batches. The district-diversity and repetition movements are characterization, not regressions against an approved threshold: no such threshold exists, and the ranking, diversity, and rotation logic was not changed. A recorded post-batch local latency sample was mean 1.616 ms, p50 0.928 ms, p95 4.092 ms, and p99 4.350 ms over 300 calls; this is host-specific and not a golden assertion.

## 12. Ankara Content Batch #3 delta

Command: `npm run check:recommendations -- --json`. Catalog version: `2026-09-18.2`. Result limit: 5.

| Measure | Before (`2026-09-18.1`) | After (`2026-09-18.2`) |
|---|---:|---:|
| Scenarios | 15 | 15 |
| Eligible candidates, summed across contexts | 481 | 511 |
| First-batch results | 69 | 71 |
| Zero-result scenarios | 0 / 15 (0.00%) | 0 / 15 (0.00%) |
| 1–4-result scenarios | 2 / 15 (13.33%) | 1 / 15 (6.67%) |
| Full-five scenarios | 13 / 15 (86.67%) | 14 / 15 (93.33%) |
| Results with explanations | 69 / 69 | 71 / 71 |
| Reason strings | 274 | 287 |
| Mood matches | 62 | 64 |
| Interest matches | 60 | 62 |
| Exact budget fits | 37 | 39 |
| Group fits | 64 | 66 |
| Experience primary matches | 16 / 19 | 18 / 21 |
| Experience secondary-only matches | 3 / 19 | 3 / 21 |
| Mean distinct categories per first batch | 2.600 | 2.533 |
| Mean distinct applicable districts per first batch | 2.533 | 2.400 |
| Distinct repeated IDs across three-batch fixture runs | 56 | 58 |
| Repeated slots across three-batch fixture runs | 70 | 74 |
| Location-paired changed slots | 20 | 23 |
| Location-paired symmetric membership difference, summed | 18 | 16 |
| Deterministic replay failures | 0 | 0 |
| Stale/expired/invalid lifecycle leakage | 0 | 0 |
| Objective invariant failures | 0 | 0 |

Changed coverage intersections account for the candidate-total increase of 30: solo Tunalı Kahve + Sanat gains five eligible Experiences; Ulus couple Sanat gains two; Çukurambar friends Place gains four; Eryaman large-group Place gains one; cold start gains eight Experiences; tight-budget Place gains four; premium-budget Place gains three; and flexible-budget Place gains three. The remaining seven fixture candidate counts do not change. Short- and long-duration fixtures each gain four otherwise matching Experiences that are correctly excluded by duration, while the sparse fixture gains one duration-excluded Experience.

The Ulus couple fixture moves from three to five eligible results, which accounts for the partial-to-full-five improvement. The category-diversity, district-diversity, repetition, and location movements are characterization, not regressions against an approved threshold; no such threshold exists, and ranking, diversity, rotation, filters, or weights were not changed. A recorded post-batch local latency sample was mean 1.742 ms, p50 1.085 ms, p95 4.078 ms, and p99 5.070 ms over 300 calls; this is host-specific and not a golden assertion.

## 13. Ankara Experience Batch #4 delta

Command: `npm run check:recommendations`. Catalog version: `2026-09-18.3`. Result limit: 5.

| Measure | Before (`2026-09-18.2`) | After (`2026-09-18.3`) |
|---|---:|---:|
| Scenarios | 15 | 15 |
| Eligible candidates, summed across contexts | 511 | 528 |
| First-batch results | 71 | 71 |
| Zero-result scenarios | 0 / 15 (0.00%) | 0 / 15 (0.00%) |
| 1–4-result scenarios | 1 / 15 (6.67%) | 1 / 15 (6.67%) |
| Full-five scenarios | 14 / 15 (93.33%) | 14 / 15 (93.33%) |
| Results with explanations | 71 / 71 | 71 / 71 |
| Reason strings | 287 | 287 |
| Mood matches | 64 | 64 |
| Interest matches | 62 | 62 |
| Exact budget fits | 39 | 40 |
| Group fits | 66 | 66 |
| Experience primary matches | 18 / 21 | 18 / 21 |
| Experience secondary-only matches | 3 / 21 | 3 / 21 |
| Mean distinct categories per first batch | 2.533 | 2.533 |
| Mean distinct applicable districts per first batch | 2.400 | 2.333 |
| Distinct repeated IDs across three-batch fixture runs | 58 | 57 |
| Repeated slots across three-batch fixture runs | 74 | 71 |
| Location-paired changed slots | 23 | 23 |
| Location-paired symmetric membership difference, summed | 16 | 18 |
| Deterministic replay failures | 0 | 0 |
| Stale/expired/invalid lifecycle leakage | 0 | 0 |
| Objective invariant failures | 0 | 0 |

The 10 added Experiences increase eligible supply by 17 across the fixed matrix without changing the already-full first-batch result count. The catalog now has 50 Experiences: primary/category distribution is 23 Sanat, 12 Doğa, 8 Lezzet, 4 Kahve and 3 Etkinlik; maximum-duration distribution is 6×30–60, 21×61–120, 17×121–240 and 6×241+ minutes. District mean and location-membership movement are characterization, not an approved-threshold regression; ranking, diversity, rotation, filters and weights did not change. A post-batch local recommendation-quality sample was mean 1.725 ms, p50 1.356 ms, p95 4.000 ms and p99 4.237 ms over 300 calls. The separate 5,000-call benchmark measured mean 2.177 ms, p50 1.024 ms, p95 6.223 ms and p99 6.594 ms against the 25 ms p95 budget; both are host-specific samples.

## 14. Idea Architecture + Batch A delta

Command: `npm run check:recommendations -- --json`. Catalog version: `2026-09-18.4`. Result limit: 5.

| Measure | Before (`2026-09-18.3`) | After (`2026-09-18.4`) |
|---|---:|---:|
| Scenarios | 15 | 15 |
| Eligible candidates, summed across contexts | 528 | 562 |
| First-batch results | 71 | 71 |
| Zero-result scenarios | 0 / 15 (0.00%) | 0 / 15 (0.00%) |
| 1–4-result scenarios | 1 / 15 (6.67%) | 1 / 15 (6.67%) |
| Full-five scenarios | 14 / 15 (93.33%) | 14 / 15 (93.33%) |
| Results with explanations | 71 / 71 | 71 / 71 |
| Reason strings | 287 | 287 |
| Mood matches | 64 | 64 |
| Interest matches | 62 | 62 |
| Exact budget fits | 40 | 40 |
| Group fits | 66 | 66 |
| Mean distinct categories per first batch | 2.533 | 2.533 |
| Mean distinct applicable districts per first batch | 2.333 | 2.333 |
| Distinct repeated IDs across three-batch fixture runs | 57 | 57 |
| Repeated slots across three-batch fixture runs | 71 | 71 |
| Deterministic replay failures | 0 | 0 |
| Objective invariant failures | 0 | 0 |

The candidate-total increase is exactly the 34 new Ideas in the controlled-discovery fixture; the other 14 scenarios and the first-batch result total are unchanged. The Fikir fixture still returns one selected-interest result and four independent discoveries, with 14 unique Ideas across three batches. The new structured fields are intentionally not consumed by ranking yet, so this delta is catalog coverage rather than a hidden scoring change. A post-batch local sample measured mean 1.795 ms, p50 1.380 ms, p95 4.104 ms and p99 4.525 ms over 300 calls; this is host-specific and not a golden assertion.

## 15. Ankara Place Completeness Batch #1 delta

Command: `npm run check:recommendations`. Catalog version: `2026-09-19.1`. Result limit: 5.

| Measure | Before (`2026-09-18.4`) | After (`2026-09-19.1`) |
|---|---:|---:|
| Scenarios | 15 | 15 |
| Eligible candidates, summed across contexts | 562 | 598 |
| First-batch results | 71 | 71 |
| Zero-result scenarios | 0 / 15 (0.00%) | 0 / 15 (0.00%) |
| 1–4-result scenarios | 1 / 15 (6.67%) | 1 / 15 (6.67%) |
| Full-five scenarios | 14 / 15 (93.33%) | 14 / 15 (93.33%) |
| Results with explanations | 71 / 71 | 71 / 71 |
| Reason strings | 287 | 287 |
| Mood matches | 64 | 64 |
| Interest matches | 62 | 62 |
| Exact budget fits | 40 | 39 |
| Group fits | 66 | 66 |
| Experience primary matches | 18 / 21 | 18 / 21 |
| Experience secondary-only matches | 3 / 21 | 3 / 21 |
| Mean distinct categories per first batch | 2.533 | 2.667 |
| Mean distinct applicable districts per first batch | 2.333 | 2.400 |
| Distinct repeated IDs across three-batch fixture runs | 57 | 58 |
| Repeated slots across three-batch fixture runs | 71 | 72 |
| Location-paired changed slots | 23 | 19 |
| Location-paired symmetric membership difference, summed | 18 | 14 |
| Deterministic replay failures | 0 | 0 |
| Stale/expired/invalid lifecycle leakage | 0 | 0 |
| Objective invariant failures | 0 | 0 |

The 13 approved Places increase summed eligible supply by 36 across six Place fixtures: Çukurambar friends gains eight, Eryaman large-group gains eight, no-location nature gains four, tight-budget Sanat + Doğa gains ten, and the premium- and flexible-budget Lezzet fixtures gain three each. Experience, Event and Idea fixture supply is unchanged because this batch adds no records to those surfaces.

The stable result total and explanation count show that the batch expands an already-full Place supply rather than manufacturing new recommendation slots. Exact-budget, diversity, repetition and location movements are characterization, not approved-threshold regressions; ranking, diversity, rotation, filters and weights did not change. A recorded post-batch local quality sample measured mean 1.998 ms, p50 1.485 ms, p95 4.715 ms and p99 4.955 ms over 300 calls. The separate 5,000-call benchmark measured mean 2.512 ms, p50 1.084 ms, p95 7.031 ms and p99 7.449 ms against the 25 ms p95 budget; both are host-specific samples.
