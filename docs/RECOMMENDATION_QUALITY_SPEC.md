# N’apsak — Recommendation Quality Baseline

Baseline date: 14 September 2026. This document defines measurement and characterization only. It does not approve a ranking change.

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

The live code at the verified starting commit `a4d9b5e832b01fada066ff4dab0d275d6d857c65` is the behavioral baseline. The project-memory rules in `PRODUCT_SPEC.md` and `ALGORITHM_SPEC.md` remain the product contract.

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

For the fixed scenario instant the harness reports upcoming, expired, invalid-start, and stale-verification Event counts using the repository's Event operations contract. Returned expired/invalid Events, expired or invalid seasonal/live Experiences, and duration-ineligible Experiences are objective leakage failures.

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
| Active Event catalog | Etkinlik | 14 Sep 2026 12:00 TRT, Sosyal, Etkinlik, ₺₺₺, 3–4 kişi | Upcoming/expired split and four-result supply |
| Stale Event catalog | Etkinlik | 21 Sep 2026 12:00 TRT | Fully expired local catalog must return zero |
| Controlled 1+4 discovery | Fikir | Meraklı, Kahve + Sanat, Fark etmez, 2 kişi | One selected-interest result plus four independent discoveries |

## 6. Initial production-catalog baseline

Command: `npm run check:recommendations`. Catalog version: `2026-09-07.1`. Result limit: 5.

| Measure | Baseline |
|---|---:|
| Scenarios | 15 |
| Eligible candidates, summed across contexts | 438 |
| First-batch results | 63 |
| Zero-result scenarios | 1 / 15 (6.67%) |
| 1–4-result scenarios | 3 / 15 (20.00%) |
| Full-five scenarios | 11 / 15 (73.33%) |
| Results with explanations | 63 / 63 |
| Reason strings | 255 |
| Mood matches | 55 / 58 results with an explicit mood |
| Interest matches | 54 / 58 results with explicit interests; four Fikir discoveries are intentionally independent |
| Exact budget fits | 34 / 48 results with an explicit non-flexible budget |
| Group fits | 58 / 58 results with an explicit group size |
| Experience primary matches | 16 / 19 interest-bearing Experience results |
| Experience secondary-only matches | 3 / 19 interest-bearing Experience results |
| Mean distinct categories per first batch | 2.467 |
| Mean distinct applicable districts per first batch | 2.467 |
| Distinct repeated IDs across three-batch fixture runs | 45 |
| Repeated slots across three-batch fixture runs | 63 |
| Location-paired scenarios | 9 |
| Location-paired changed slots | 17 |
| Location-paired symmetric membership difference, summed | 14 |
| Deterministic replay failures | 0 |
| Stale/expired/invalid lifecycle leakage | 0 |
| Objective invariant failures | 0 |

Supply-specific observations:

- The Ulus couple fixture has three eligible 1–2-hour Sanat Experiences and returns all three.
- The sparse Kahve + 3–4-hour fixture has one eligible secondary-interest Experience and returns one.
- At 14 September 12:00 TRT, four Events are upcoming and eight are expired; all 12 source verifications are older than the seven-day freshness boundary at that instant. The Event surface returns the four upcoming items and does not fill the fifth slot.
- At 21 September 12:00 TRT, all 12 embedded Events are expired and the Event surface returns zero.
- The Fikir fixture returns one selected-interest idea plus four independent discoveries and produces 14 unique items across three batches.
- The short and half-day fixtures each have exactly five eligible Experiences. Their three refreshes necessarily repeat the entire supply.
- Cold start has 20 eligible Experiences and produces 15 unique items across three adjacent five-item batches.
- Correct location-off replays change 17 of 43 compared result slots across the nine paired fixtures. Four fixtures change membership: Çukurambar friends has three shared IDs and a symmetric difference of four; tight budget and expensive budget each have four shared IDs and a symmetric difference of two; flexible budget has two shared IDs and a symmetric difference of six. Couple and large-group fixtures keep the same members but swap their first two ranks. Solo, short-duration, and long-duration keep the same order.

A recorded local latency sample was mean 0.370 ms, p50 0.128 ms, p95 1.824 ms, and p99 2.068 ms over 300 calls. This is a host-specific observation, not a fixed golden assertion.

## 7. Interpretation cautions

- A high match count can be tautological when an interest is also a hard eligibility filter. It proves no leakage, not subjective relevance.
- Exact budget fit does not describe affordability within a price band or value for money.
- Place group fit reflects the existing heuristic, not explicit venue capacity or accessibility evidence.
- District diversity does not apply to current Event and Idea types.
- Location changes membership or ordering in six of the nine paired fixtures at these seeds. Solo and short-duration keep the same order despite positive proximity contributions; long-duration keeps the same order because all five eligible plans are beyond the Experience proximity-score radius. These findings characterize the current catalog and score balance; they are neither a defect assertion nor permission to change weights.
- `interestTier` is applied before adjusted score inside direct `recommendExperiences` candidate selection. `recommendAll` requests a wider Experience candidate set and may subsequently re-sort it by raw score, so primary-before-secondary is not an unconditional visible-feed ordering guarantee.
- The current rotation remembers only the immediately previous batch. Large pools often avoid adjacent overlap while allowing batch-1 items to return in batch 3.
- The fixed Event dates intentionally make depletion visible. The matrix must not be moved forward automatically, because doing so would hide a reproducible catalog-quality finding.

## 8. CI policy

`check:recommendations` is deterministic apart from reported wall-clock latency and is fast enough for the App Quality workflow. CI fails only for objective invariants:

- non-deterministic replay;
- dismissed leakage;
- expired/invalid Event leakage;
- expired/invalid Experience lifecycle leakage;
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
