# Experience start distance — implementation and audit

2026-10-14. Branch `codex/gezek-plan-distance`. Verified repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`.

## Baseline and scope

Initial branch `main`, HEAD and fetched `origin/main` both `746aad3a19b78d0e0da5fb286898758b0cbba0a0`. GitHub #75 is MERGED with that merge commit; Redmi onboarding acceptance is user-reported, not a new device test. Initial `git status --short` was only `?? src/firebase/BA_4bit.sv/`. That user-owned directory was never read, modified or staged. Historical onboarding/Main/Draft statements in older memory are superseded by live Git/GitHub and this task's explicit authorization. #57 is untouched.

This is a presentation and request-lifecycle change. No catalog, scoring formula, weights, eligibility, diversity, rotation, seed, Firebase contract, persistence schema, dependency/lockfile, artwork, release or filter-control change. New/changed proximity weighting and user-facing proximity/budget filters remain deferred.

## Mandatory audit — completed before UI edits

[Complete 52-row table](evidence/experience-distance/coordinate-audit.md), [machine-readable rows](evidence/experience-distance/coordinate-audit.json). Regenerate with `node --import tsx scripts/auditExperienceStartCoordinates.ts --write`.

**52/52 PASS, zero discrepancies, every separation exactly 0 km.** Checked every Experience and every ordered point, unique stable-ID Place linkage, matching `cityId`, finite coordinates and the existing Ankara bounds (latitude 38–41, longitude 30.5–34.5). There are no empty routes, repeated first-stop links, ambiguous/missing linked Places, invalid coordinates or anchor/start mismatches. No catalog correction was necessary or performed.

`src/data/experiences.ts:11` resolves `pointIds` using the Place ID map. `buildExperience` preserves array order in `points`, copies the first Place coordinates to the Experience anchor and copies each linked Place coordinates to its point. The schema has no separate stop ID or numeric order field: first stop means `points[0]`, whose stable ID is `placeId`. Titles are never used to resolve a record. This audit verifies internal catalog integrity; it makes no claim about externally surveyed/geocoded accuracy. Catalog parity also passes.

## Existing location/recommendation behavior (baseline source)

| Question | Verified path and finding |
|---|---|
| Experience eligibility uses location? | No. `src/recommendations.ts:144` filters dismissed, content-policy/lifecycle, duration, budget and interests before scoring. `src/contentPolicy.ts` has no location input. Full-pool focused test confirms the eligible ID set is identical with/without location. |
| Experience scoring uses location? | Yes, already at baseline. `recommendExperiences`, `src/recommendations.ts:151`, computes Haversine distance to the Experience anchor; line 159 adds `max(0, 14 - distance * 1.25)`; line 170 adds the existing “başlangıç noktası sana yakın” reason below 5 km. Exact score-delta tests confirm this existing signal. All 52 audited anchors equal their first stop. |
| Location passed only to Place? | No. `recommendAll`, lines 402–408, passes it to both Experience and Place. Place retains its `max(0, 14 - distance * 1.75)` signal and below-3-km reason. Related plans also use `recommendExperiencesForPlace`, retaining its existing scoring. |
| Granting permission reruns recommendations? | At baseline `App.tsx:291` waits for permission, then position. Successful position calls `setCoordinates`; coordinates were a dependency of the recommendation memo (`App.tsx:128–132` at baseline), so the current batch recomputed without incrementing its seed/run. Permission grant alone, before a valid position, does not recompute. |
| Why does refresh change results? | Baseline `rotateRecommendations` stores current IDs in `previousBatch` and increments `recommendationRun` (baseline `App.tsx:390`; current line 412). With fixed location, refresh varies seed and previous-batch avoidance. The unchanged location score remains an input; refresh does not itself request or change location. A newly received position could previously change the batch separately. |

These findings confirm the documented existing proximity score in `ALGORITHM_SPEC.md`; the task does not introduce or increase it.

## Implementation

`experienceStartDistanceLabel` is the authoritative display path: validate live user and first ordered point coordinates, call the existing `distanceInKm` Haversine function once against **`points[0]` only**, then format `Başlangıca … km`. It ignores the recommendation's cached `distance` and the Experience anchor for display; it never uses a route centre, average, last stop, title search or external geocoding.

Place had repeated inline `toFixed(1)` formatters with a decimal point, rather than an existing reusable locale-aware function. Those call sites now share `formatDistanceInKm`; its default preserves exact valid Place output (e.g. `1.3 km`). The same precision with the `tr-TR` option renders Experience `3,4 km`. Short/medium/long rounding boundaries are tested. A real zero distance can correctly render `0,0 km`; missing, nonfinite or out-of-range coordinates render no label. No new formula or stored/transmitted location field is introduced. Existing Maps coordinate validation is reused from `domain.ts` without changing URL ordering or semantics.

Main and all four alternative Home cards have a wrapping metadata text line. Shared Saved/Hidden cards, Plan detail metadata and Place detail's related-plan cards use the same function. The retained unused legacy `RecommendationCard` also uses the same optional live-coordinate path. No broad Home redesign or new controls.

**Location-only Gezek updates keep the existing batch:** `App.tsx:134–147` isolates the Experience memo's location dependency, while retaining the latest location for the next independently triggered recomputation (refresh, filter/preferences, dismissal, catalog/eligibility changes). Such a recomputation still uses the unchanged engine and scoring formula. Place keeps its immediate location-triggered recomputation. This scheduling change is necessary to satisfy presentation-only updates; it does not disable existing proximity scoring on subsequent batches. Location-only updates retain identical IDs, ordering, scores, seed/run, previous batch, filter, saved/dismissed state, recommendation-compute count and Home scroll offset in the actual App browser tests.

`createLocationRequestGuard` issues request generations. App checks after both awaited OS stages, in catch and in finally; a newer request, departure to another screen/detail/filter, deletion or unmount invalidates the older generation. Old results cannot set coordinates/messages/loading or emit a permission result. The OS request itself is not cancellable here. Denied/error/invalid results clear stale coordinates, and loading omits distance text. This is RAM-only; persistence/backend allowlists are unchanged.

Distance is a separate meaningful `text` accessibility node, outside the card-body Pressable and its hidden visual-copy group; card/button labels omit it, preventing duplicate or button announcements. Existing hidden title/metadata/reason children retain their semantics. Large text wraps and grows the existing cards; independent save/dismiss and related-plan body controls retain at least 44 px targets. Browser accessibility snapshots show exactly five start-distance strings and no button label containing them. TalkBack still requires device acceptance.

## Changed files

- `App.tsx`: presentation coordinates, Experience memo isolation, request guards and shared Saved/Hidden/legacy metadata.
- `src/domain.ts`, `src/mapLinks.ts`: shared formatter and existing coordinate validation.
- `src/experienceStartDistance.ts`, `src/locationRequestGuard.ts`: authoritative first-stop display and request generation guard.
- `src/components/gezek/GezekHome.tsx`, `gezekHomePresentation.ts`, `DetailHost.tsx`: wrapping metadata, separate accessible text and shared Place formatting.
- `scripts/auditExperienceStartCoordinates.ts`: complete reproducible stable-ID audit with discrepancy reasons.
- `tests/experience-distance.test.ts`, `tests/experience-distance-browser.cjs`, `scripts/buildDetailBrowserFixture.cjs`, `package.json`: focused regression tests and opt-in generated-fixture service stubs/instrumentation. No production browser globals or new dependencies.
- This report, `docs/START_HERE.md`, `docs/STATUS.md`, and `docs/evidence/experience-distance/*`: audit/verification evidence and entry points.

## Validation

[Command outcomes](evidence/experience-distance/verification-results.json), [56 browser checks](evidence/experience-distance/browser-results.json). Raw command logs, generated bundle, fonts and Android exports remain in `/private/tmp/gezek-distance-*`, not the repository.

| Command / check | Result |
|---|---|
| Initial `git status --short`, branch, HEAD, fetched `origin/main` | PASS; exact baseline above, protected untracked directory only |
| `npm ci` | PASS after sandbox DNS failure retry; lockfile unchanged. Existing dependency audit warnings were not repaired in this scope. |
| Coordinate audit command | PASS 52/52, 0 km all pairs |
| `git diff --check` | PASS |
| `npm run typecheck` | PASS, final source |
| `npm test` | PASS 272 tests (111 compiled-domain + 161 TypeScript), including 9 new focused tests |
| `node --import tsx --test tests/experience-distance.test.ts` | PASS 9/9 |
| `npm run test:catalog` | PASS |
| `npm run check:events` | PASS, 9 upcoming, no stale verification or health issues |
| `npm run check:accessibility` | PASS final; initial missing `mainTitle` header annotation fixed and rerun |
| `npm run test:stress` | PASS; Experience 640 scenarios, 480 rotations, 0 empty/mismatch/duplicate/overlap |
| `npm run check:performance` | PASS; 5,000 calls, p95 7.555 ms / 25 ms budget, checksum 22308 |
| `npm run check:recommendations` | PASS |
| `npm run check:assets` | PASS |
| `npx expo export --platform android --output-dir /private/tmp/gezek-distance-final-android-export` | PASS final; local export only |
| Opt-in fixture build and `tests/experience-distance-browser.cjs` | PASS 56 checks / 0 page errors |
| Browser/component layouts | PASS 393×852 and 412×915; normal and simulated 1.8× text, inspected screenshots, wrapping/no covered actions or horizontal overflow |
| Staged `git diff --cached --check` before commit | PASS; only the 28 scoped files staged, protected directory excluded |
| Final `git status --short`, commit, normal push, Draft PR, CI | Live delivery metadata in final response/GitHub; no self-embedded commit SHA |

Package scripts were inspected; no generic `npm run check` script exists or was claimed. Initial typecheck attempted while the first failed install was incomplete (`tsc` unavailable); installed-dependency and final typechecks subsequently pass. The first browser Saved assertion was corrected to respect the existing contract that Dismiss/Undo removes a save; final assertions pass without changing that behavior.

Browser matrix covers unavailable, permission pending, position pending, valid, live update, denial after valid, invalid OS response, rejected position, superseded request, departed Home, departed filter's permission response and unmounted App. It also verifies the unchanged immediate Place path, independent Save/Dismiss/Undo, Plan→Place→Back detail entry, Home scroll restoration, and Saved/related metadata. Synthetic invalid/no-stop/ambiguous-link fixtures fail the audit as expected. No fake catalog records were added.

## Remaining acceptance and delivery

No physical Redmi test, real OS permission prompt, TalkBack traversal, OS font-scale validation, native Back/scroll timing or signed-release acceptance was run: this session has browser/component/local-export evidence only. Existing release gates remain unchanged. No production system was modified. The user authorized normal commit/push and exactly one Draft PR titled **Show distance to Gezek plan starting points**, targeting `main`; no merge or force push. Delivery SHA/URL/CI state are verified after creation and reported separately.

Redmi acceptance checklist:

1. Open Gezek without location, deny permission, then retry/grant: no fake distance/loading row; main and all visible alternatives show `Başlangıca … km` only with valid location.
2. Refresh location: labels update, current plan IDs/order and scroll stay stable; explicit “Başka planlar göster” still rotates normally. Mekân distance behavior remains unchanged.
3. Save, dismiss, Undo; enter Plan→first Place→Back→Home; verify actions stay independent and scroll restores. Check Saved and related-plan metadata.
4. Use large OS text and TalkBack: distance wraps clear of controls and is announced once as text; save/dismiss/card actions remain separate.
5. Start a location request, navigate away/Back or close the view before it returns; verify no late overwrite or stuck loading. Record device/build/commit identity and results.
