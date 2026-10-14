# Experience start distance — implementation and audit

2026-10-14. Branch `codex/gezek-plan-distance`. Verified repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`.

## 2026-10-14 — Redmi foreground location validity correction

Continues the existing `codex/gezek-plan-distance` / Draft [PR #76](https://github.com/keremtunaguneyy-byte/napsak-app/pull/76) from `fd766d8c29276c729a866dd20c6e151ba4e3e72d`, with fetched main still `746aad3a19b78d0e0da5fb286898758b0cbba0a0`. Initial status remains only `?? src/firebase/BA_4bit.sv/`. Previous-head App Quality and Firestore Rules are verified SUCCESS, PR Draft/OPEN/MERGEABLE. The user reports Redmi checks 1–6 passed; check 7 reproduced stale location after disabling Android services. This correction requires a new physical retest; previous device acceptance does not validate it. Same branch/PR only; normal commit/push, no amend/rebase/force/merge, #57 and user-owned Verilog preserved.

### Root cause and supported APIs

At `fd766d8`, `requestLocation` cleared coordinates only on explicit request denial/error/invalid response. There was no service-enabled or permission-status revalidation on return to the app. Thus the old RAM coordinate survived disabling services. Place Home cards additionally held `distance` on scored recommendation records. An unrelated unconditional `setEligibilityNow(new Date())` on every active event also recomputed recommendations even without an elapsed eligibility boundary.

Inspected installed **React Native 0.86.0**, **Expo 57.0.11**, **expo-location 57.0.7**, including:

- `node_modules/react-native/Libraries/AppState/AppState.js` and `.d.ts`: supported Android `focus`/`blur` and `change` events.
- `ReactAndroid/src/main/java/com/facebook/react/modules/appstate/AppStateModule.kt`: host resume/pause emit state changes; window focus emits `appStateFocusChange` independently. This catches notification/quick-settings interaction even when state stays active. See [RN 0.86 AppState](https://reactnative.dev/docs/0.86/appstate).
- `expo-location/src/Location.ts`, Android `LocationModule.kt` and `LocationHelpers.kt`: `hasServicesEnabledAsync()` reads GPS/network provider availability; `getForegroundPermissionsAsync()` reads coarse/fine permissions through the permission manager, distinct from the requesting method. See [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/). Installed source, not the newer version shown by online “latest”, is the implementation authority.

The existing local ambient Expo declaration hid these already-installed exports from TypeScript; `types/native-modules.d.ts` now declares the two supported read-only functions. Dependencies, package manifest and lockfile are unchanged by this follow-up; `npm ci` was unnecessary and was not rerun.

### Lifecycle, races and recommendation invariants

`App.tsx` installs one monitor per mounted effect. `AppState change → active` and Android `focus` call `resume`; non-active and Android `blur` call `pause`. All three subscriptions, debounce timer and pending-result ownership are cleaned up on unmount. No polling, watch, background tracking, permission request, settings dialog or GPS acquisition is started by these hooks.

`src/locationValidity.ts` coalesces a burst with a **120 ms debounce** and allows only one native status pair in flight. Both reads must settle before its serial gate opens, even if one rejects early. Duplicate active/focus events during the same check share it. A genuine rapid departure/return marks the old generation obsolete and queues at most one fresh check after old native reads settle. This serializes calls rather than pretending to cancel native operations.

Explicit request start and result publication supersede older status generations. Therefore an older negative status cannot clear a newer acquired coordinate. A current invalid status (services false, permission other than granted, malformed result or read failure) invalidates the existing explicit-request guard too: a still-pending old GPS result cannot repopulate the cleared coordinate. It synchronously clears the latest coordinate ref used by future batches, clears presentation state and loading, and shows the existing location request affordance. Valid status leaves the current coordinate and labels intact; successful revalidation after invalidation cannot resurrect the discarded fix. A later successful explicit update is required.

The Place ranking dependency is now an **explicit-location publication revision**, separate from presentation validity. Automatic invalidation leaves it unchanged. `homeDisplayItems` derives Place display distances from the valid presentation coordinate without mutating or sorting the scored records; Experience continues using its audited first ordered stop. Both disappear when invalidated/loading, never substituting zero. Explicit successful updates retain Place's existing immediate location recomputation, formatter and Haversine behavior.

Foreground re-entry no longer advances the eligibility clock when no known Event boundary elapsed; actual Event expiry still advances it, verified in the actual App. Scoring/eligibility formulas and expiry rules are unchanged. Place detail's related-plan memo likewise ignores display-only coordinate invalidation while still consuming the latest coordinate on independent place/catalog/preference/seed/eligibility changes. Main, alternative and related plan IDs/order remain stable during invalidation. Scores, filter, seed/run, previous batch, save/dismiss state and Home scroll are preserved. The next independent refresh receives `coordinates: undefined`; no stale coordinate survives into scoring. Save/Dismiss/Undo, detail/Back, card keys and scroll restoration retain their existing paths.

### Follow-up validation and evidence

[61 lifecycle browser checks](evidence/experience-distance/lifecycle-browser-results.json), [existing 56 distance checks](evidence/experience-distance/browser-results.json), and [all command outcomes](evidence/experience-distance/verification-results.json). Both viewports are **393×852 and 412×915**; the existing distance suite also reruns normal/simulated 1.8× font scale. No new screenshots or raw logs were added; original visual evidence remains valid for the unchanged layouts. Raw logs, generated fixtures and Android export stay under `/private/tmp/gezek-validity-*`.

| Check | Current result |
|---|---|
| Initial status / branch / SHA / fetched refs | PASS; existing branch and exact expected local/remote head, protected untracked directory only |
| `git diff --check` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS **281 tests** (111 compiled-domain + 170 TypeScript) |
| `node --import tsx --test tests/experience-distance.test.ts` | PASS **18/18**, including 9 lifecycle/display regressions |
| `npm run check:accessibility` | PASS |
| `npm run check:performance` | PASS; 5,000 calls, **p95 7.241 ms / 25 ms**, checksum **22308** unchanged |
| `npx expo export --platform android --output-dir /private/tmp/gezek-validity-android-export` | PASS |
| Existing distance fixture/browser suite | PASS **56 checks**, both viewports and normal/large text, 0 page errors |
| Lifecycle browser suite | PASS **61 checks**, Experience/Place, both viewports; elapsed Event boundary regression, 0 page errors |
| 52-record coordinate audit | PASS, files unchanged |
| `npm ci` | NOT RUN: installed dependencies sufficient; no dependency or lockfile change |
| Staged `git diff --cached --check` | PASS; 14 scoped follow-up files; protected directory excluded |
| Final status / normal commit-push / exact-head CI | Recorded in final handoff/live Draft #76 |

Coverage includes background→active services-disabled, quick-settings blur/focus, permission revoked, valid status preserving coordinates, no automatic prompt/GPS, fail-closed errors from either read, no resurrection without explicit update, stale status versus newer GPS, duplicate/rapid cycles, loading invalidation versus late GPS, unmount cleanup, current batch/state/scroll invariants, next-batch input, related ordering, explicit recovery, and existing action/detail regressions. The first typecheck revealed the missing local ambient API declarations and was corrected. The first Android-simulated browser run exposed the fixture's Web-only `findNodeHandle`; the test adapter now supplies the same native-focus bridge used by its onboarding simulation. Final suites have zero page errors; production focus code was not changed.

Exact current PR inventory: [EXPERIENCE_DISTANCE_CHANGED_FILES.txt](EXPERIENCE_DISTANCE_CHANGED_FILES.txt). Follow-up source/test changes: `App.tsx`, `src/locationValidity.ts`, `src/components/gezek/gezekHomePresentation.ts`, `src/components/gezek/DetailHost.tsx`, `types/native-modules.d.ts`, `scripts/buildDetailBrowserFixture.cjs`, `tests/experience-distance.test.ts`, `tests/location-validity-browser.cjs`. Follow-up documentation/evidence: this report, `START_HERE.md`, `STATUS.md`, the inventory, `verification-results.json` and `lifecycle-browser-results.json`.

### Redmi retest (pending on the new head)

1. Acquire location on Gezek and Mekân. Disable services in quick settings, return: all km labels disappear, without a prompt, loading spinner, batch reorder, seed change or scroll jump. Repeat via background/Settings and by revoking foreground permission.
2. Request the next batch: no old coordinate/distance is used. Re-enable services: labels stay absent until explicit “Konumu güncelle”/location request succeeds; valid foreground returns preserve that fix.
3. Repeat rapid blur/focus/background returns and leave during an explicit fix. Verify no late stale overwrite or stuck loading. Test Saved and Plan/Place related metadata too.
4. Repeat Save/Dismiss/Undo, Plan→Place→Back, scroll restoration, large text and TalkBack. Record exact commit/device/build and results. Previous checks 1–6 are user-accepted on the previous SHA; this fix, native quick-settings cadence, TalkBack and signed-release acceptance remain unverified here.

The original audit and initial implementation evidence below are retained as history. Exact new commit, normal push and exact-head CI links are reported in the final delivery and live Draft #76, without a self-referencing commit SHA in this document.

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
| Why does refresh change results? | Baseline `rotateRecommendations` stores current IDs in `previousBatch` and increments `recommendationRun` (baseline `App.tsx:390`; fd766d8 line 412). With fixed location, refresh varies seed and previous-batch avoidance. The unchanged location score remains an input; refresh does not itself request or change location. A newly received position could previously change the batch separately. |

These findings confirm the documented existing proximity score in `ALGORITHM_SPEC.md`; the task does not introduce or increase it.

## Initial implementation at fd766d8

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

## Initial validation at fd766d8

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

## Initial delivery checklist at fd766d8 (historical)

No physical Redmi test, real OS permission prompt, TalkBack traversal, OS font-scale validation, native Back/scroll timing or signed-release acceptance was run: this session has browser/component/local-export evidence only. Existing release gates remain unchanged. No production system was modified. The user authorized normal commit/push and exactly one Draft PR titled **Show distance to Gezek plan starting points**, targeting `main`; no merge or force push. Delivery SHA/URL/CI state are verified after creation and reported separately.

Redmi acceptance checklist:

1. Open Gezek without location, deny permission, then retry/grant: no fake distance/loading row; main and all visible alternatives show `Başlangıca … km` only with valid location.
2. Refresh location: labels update, current plan IDs/order and scroll stay stable; explicit “Başka planlar göster” still rotates normally. Mekân distance behavior remains unchanged.
3. Save, dismiss, Undo; enter Plan→first Place→Back→Home; verify actions stay independent and scroll restores. Check Saved and related-plan metadata.
4. Use large OS text and TalkBack: distance wraps clear of controls and is announced once as text; save/dismiss/card actions remain separate.
5. Start a location request, navigate away/Back or close the view before it returns; verify no late overwrite or stuck loading. Record device/build/commit identity and results.
