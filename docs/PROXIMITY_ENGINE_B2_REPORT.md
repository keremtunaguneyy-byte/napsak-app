# Gezek proximity engine B2 implementation

Date: 2026-10-21. Engine-only; A remains default. B2 is optional and no production UI caller enables it. This report records local source/automated evidence, not physical-device or release acceptance.

## Authority and pre-edit audit

The user explicitly authorized the self-contained `Gezek_Proximity_Engine_B2_Implementation_Handoff_2026-10-21.md`, superseding the missing walkthrough attachment. The complete handoff was read. The same-date design closure available in Downloads without the `(1)` suffix was also read as a later UI/state reference; no Figma operation was performed. Current code, `AGENTS.md`, project-memory entry point, relevant product/decision/algorithm/performance contracts and package scripts were inspected before engine edits.

| Audit item | Observed value |
| --- | --- |
| Actual existing clone | `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app` |
| Remote | `https://github.com/keremtunaguneyy-byte/napsak-app.git` |
| Source branch / HEAD | `main` / `6244fa49b35669a04e5e5578f8b8a3dd0ec5eb41` |
| Fresh fetch / branch base | `origin/main` = `6244fa49b35669a04e5e5578f8b8a3dd0ec5eb41`; no advance from handoff |
| Source status | No tracked changes; only `?? src/firebase/BA_4bit.sv/` |
| Protected/unrelated work | Verilog directory preserved in source checkout; no move, edit, deletion, staging or addition to worktree |
| Open PRs / competing proximity branch | `gh pr list --state open` returned `[]`; no local/remote proximity branch existed |
| New isolated worktree | `/private/tmp/gezek-proximity-engine-b2` |
| New branch | `codex/gezek-proximity-engine-b2`, created directly from fetched `origin/main` |

Source discrepancy: application preflight already rejects invalid origins, but direct calls to the old engine passed unchecked numeric coordinates into the distance calculation. Invalid input could therefore produce `NaN`. The handoff explicitly requires finite/locationless fallback. The new pure distance boundary treats invalid/missing origin or candidate coordinates, or a nonfinite computed distance, as `undefined`. This changes malformed direct-engine input handling only; valid/locationless A parity is checked against the pre-edit engine. No acquisition, permission, freshness, catalog-validity or eligibility contract was changed.

## Implemented behavior

The typed optional input is `proximityPolicy?: RecommendationProximityPolicy`, exported from the recommendation API with values `'default' | 'nearby'`. `recommendAll`, `recommendExperiences` and `recommendPlaces` accept it. There is no global policy state.

| Policy | Place contribution | Experience contribution |
| --- | --- | --- |
| omitted / `default` (A) | `Math.max(0, 14 - distanceKm * 1.75)` | `Math.max(0, 14 - distanceKm * 1.25)` |
| `nearby` (B2) | `-2 * distanceKm` | `-2 * distanceKm` |

B2 replaces A; the contributions never stack. At 0/2/5/8/11.2/18/30/80 km the B2 values are 0/-4/-10/-16/-22.4/-36/-60/-160; 80 minus 18 km is -124 points. There is no clamp, radius gate or nearest-first sort. Invalid/absent distance contributes zero without removing the candidate. Valid great-circle arithmetic remains unchanged. Numeric overflow passed directly to the score helper is also treated as invalid; real geographic distance cannot reach that range.

Eligibility/dismissal still precede scoring. All non-distance scoring terms, seed consumption, diversity, previous-batch pool/fallback and visible reasons remain intact. Experience interest tiers still precede adjusted score inside the chosen pool; Place gains no hard primary tier. Event and Idea scorers receive no policy input and their explicit feeds have exact result parity. Mixed-feed competition can naturally change when spatial scores change.

`recommendExperiencesForPlace` excludes the option from its public type and explicitly uses A at runtime, including if an options spread contains a Home policy. Existing app/Detail callers remain unchanged. No UI/Figma, Home layout/state/snapshots, location acquisition/freshness, onboarding, Preference Editor, Saved, Ankara 101, Firebase, persistence, catalog, artwork or release configuration changes are included.

## Default parity and focused regression method

Before engine edits, `node --import tsx scripts/auditProximityEngine.ts capture-default` wrote the immutable [baseline](evidence/proximity-engine-b2/default-baseline.json). Capture uses `wx` so rerunning cannot overwrite it. A first independent invocation produced the same hash before the canonical capture. The engine file had no diff when capture completed.

The matrix contains **1,920 scenarios and 28,800 calls**: four moods, eight interest selections, five budgets, absent plus five duration preferences, two seeds, rotating absent/four group preferences, five catalog-derived origins plus locationless cases, fixed 13/21 October clocks, dismissal/history cases, full direct candidate results, five-result direct calls, related-detail lists, all five unified filters and a seeded next batch for every filter. Full-result snapshots contain a total of **127,728 eligible Place appearances and 29,392 eligible Experience appearances** across the matrix; these are sums across profiles, not catalog sizes.

Every entire result array is serialized with `JSON.stringify` and a newline into a SHA-256 stream. This compares IDs, order, scores, distance, reasons and record data, including empty results. The pre-edit reference is:

`f9c62c79430dcbfbe8410e0505c853ffe18ec212355cf22c4ff1c94d1f9ba9e2`

Omitted and explicit-default post-edit results are independently checked against that same reference in the normal `npm test` suite. Invalid coordinates are tested against locationless results rather than the old malformed-input behavior. Focused tests also cover approved numeric contributions, replacement rather than stacking, candidate-set equality, public/mixed plumbing, finite invalid-input fallback, Experience tier priority, no Place tier, Event/Idea isolation, deterministic diversity/rotation, small-pool fallback, far eligibility, free-budget protection and detail A isolation.

To reproduce the original capture, apply only the audit script/helper to a checkout of the recorded base and run `capture-default` before source edits. To verify this implementation, run `node --import tsx scripts/auditProximityEngine.ts verify-default` or the focused tests. Neither operation requires remote data or a device.

## Sixteen-batch A/B2 comparison

Reproduction: `node --import tsx scripts/auditProximityEngine.ts measure`. Canonical [measurement JSON](evidence/proximity-engine-b2/sequence-measurements.json) records exact profiles, origins with source URLs/verification dates, definitions, per-sequence metrics and result hashes. No location was invented for this audit: origins are exact active catalog records for Kuğulu Park, CerModern, Göksu Parkı, Ahmet Taner Kışlalı Parkı and Mavi Göl. Their source metadata was checked locally, not re-surveyed or independently re-geocoded. No requested origin was excluded; none beyond these five was assumed.

Eight synthetic profiles cover all four moods and all five interests, broad/no-interest, mixed interests, short/long/indifferent durations, all group choices and all budgets. Two profiles use free budgets. Each (origin, profile, surface, policy) runs **16 consecutive batches**, seeds 1000–1015, with only the immediately previous batch's IDs passed to the next call. There are 40 sequences/640 groups per surface/policy, **160 sequences / 2,560 groups total**. Modes have independent histories for this measurement only; no application snapshot owner is implemented.

| Metric | Experience A | Experience B2 | Place A | Place B2 |
| --- | ---: | ---: | ---: | ---: |
| Main-card median km | 10.642 | 8.670 | 4.328 | 2.937 |
| Groups with any result >30 km /640 | 116 | 48 | 381 | 90 |
| Mean distinct IDs per 16-batch sequence | 9.300 | 8.775 | 19.225 | 13.775 |
| Repeat appearances, summed per sequence | 2348 | 2369 | 2351 | 2569 |
| Adjacent-repeat appearances | 675 | 675 | 300 | 300 |
| Primary-interest matches / explicit-interest results | 1680/2320 | 1680/2320 | n/a | n/a |
| Mood matches / all results | 2280/2720 | 2240/2720 | 3072/3120 | 2982/3120 |
| Positive group-fit matches | 2680 | 2680 | 3119 | 3094 |
| Exact selected price-band matches | 760 | 760 | 1441 | 1387 |
| Empty groups | 0 | 0 | 0 | 0 |
| Nonempty partial groups | 160 | 160 | 80 | 80 |

B2 reduces far inventory exposure and median main distance in this matrix, while reducing refresh variety and some mood/group/budget fit. Experience primary retention remains 72.414% for these explicit-interest appearances under both policies. This is an observed aggregate, not a new guarantee or threshold. Sparse free/short profiles explain partial supply and some adjacent repeats; existing fallback remains authoritative. Duration-fit means are retained per sequence in JSON. No duplicate IDs, invalid scores or paid leakage in free profiles were observed by the measurement assertions.

These are synthetic profiles on the embedded catalog at fixed `2026-10-21T09:00:00.000Z`. Five catalog coordinates are not live user GPS. Great-circle distance is neither route distance nor travel time. Results do not establish universal relevance, device performance or release acceptance. Advisory earlier audit numbers were not reused as acceptance gates.

## Verification and delivery

`npm run check` does not exist in this repository; individual supported commands are used. No dependency versions or lockfile changed. The first sandboxed `npm ci` failed on network access; authorized retry installed the exact lock successfully (1,183 packages). npm reported existing dependency advisories (20 moderate, 38 high, 2 critical); no out-of-scope dependency fix was attempted.

| Command | Result |
| --- | --- |
| `git diff --check` | PASS |
| `git diff --cached --check` | PASS; final staged content checked before commit |
| `npm ci` | PASS on authorized network retry; locked dependencies installed |
| `npm run typecheck` | PASS after correcting two typing issues in new test/audit code |
| `node --import tsx --test tests/proximity-engine.test.ts` | PASS, 14/14 (separate focused invocation) |
| `npm test` | PASS, 330/330: 111 compiled CJS + 219 TypeScript tests including the 14 focused tests |
| `npm run test:catalog` | PASS; 178 Place / 52 Experience / 9 Event / 140 Idea / 12 Guide / 1 City |
| `npm run check:events` | FAIL, existing `stale_verification`, identically reproduced on untouched source main |
| `npm run check:accessibility` | PASS, existing source contract (13 files / 16 target styles); not a TalkBack execution |
| `npm run test:stress` | PASS; 2,560 Place +640 Experience scenarios; 0 empty/interest mismatch/duplicates/diversity or duration problems; 0 overlap in sufficient fresh pools |
| `npm run check:performance` | PASS, 5,000 measured calls; p95 9.947 ms <25 ms, checksum 22308; concurrent local workload, not native timing |
| `npm run check:recommendations` | PASS, 15 fixed golden scenarios, 0 objective invariant failures |
| `npm run check:assets` | PASS; 392 content records / 125 artwork families / 375 variants / 46 contextual icons / 11 UI exports |
| `CI=1 npx expo export --platform android --output-dir /private/tmp/gezek-b2-android-export` | PASS; Android Hermes bundle exported to external temporary directory |
| `node --import tsx scripts/auditProximityEngine.ts capture-default` | PASS before source edits; immutable 1,920-case / 28,800-call reference |
| `node --import tsx scripts/auditProximityEngine.ts measure` | PASS; 160 sequences / 2,560 groups with finite/duplicate/free assertions |

The first typecheck caught an inferred empty-array type in the audit and a duplicate fixture ID spread in the test; both were corrected before the passing typecheck/tests. No expected score, policy threshold, test expectation or baseline was relaxed. The standalone `verify-default` command is provided for reproduction; identical verification runs in both the focused and full test commands above rather than an unnecessary third full replay. Rules/release-readiness commands were not required for unchanged Rules/release configuration; GitHub's normal checks still run on the resulting Draft PR. Raw local logs and Android output are temporary artifacts outside Git; the canonical data and exact commands are committed here.

Current Event-health limitation: `npm run check:events` exits 1 with `stale_verification` (9 total, 7 upcoming, 2 expired, 9 stale). The same command reproduced the same issue on untouched source main. Event catalog freshness must be handled separately; it is not an engine regression and is not marked closed here.

Device, TalkBack, real OS large text/Reduced Motion, signed-release and native-FPS validation were not run: this PR has no UI/acquisition/state change and automated/export evidence cannot establish those claims. No production operation is included. UI/state integration and its native acceptance are a separate later PR.

Exact [changed-file inventory](PROXIMITY_ENGINE_B2_CHANGED_FILES.txt). Deliver with one normal commit/push and one Draft PR targeting main, left unmerged. Final commit/PR/CI identity is reported from live Git/GitHub at delivery. Recommended next action: review the engine boundary and measured tradeoffs; leave UI/session/snapshot implementation to the separate approved integration task.
