# Home filter snapshot stability — 2026-10-15

## Scope and verified base

Branch: `codex/gezek-home-filter-snapshot-stability`. Base: `5ed153e46fe7bc53a4d9100efef2f62ec1183111` (PR #77 merge). Implementation was opened as separate Draft PR #78. The subsequent user-provided Redmi acceptance and conditional normal-merge authorization below supersede its original Draft/unmerged hold.

Stage 1 completed before this branch existed. PR #77 was fetched and reconciled against expected implementation head `d1b611c38eb665f35711ce546264a5661fa5529f`, base `056ad19faf63107766408867972a76521c7ec134`, and 60 expected files. It was open/Draft, CLEAN/MERGEABLE, without reviews or unresolved review threads; no unexpected code/design change appeared. Only `START_HERE.md`, `STATUS.md`, `DECISIONS.md`, and `SAVED_IMPLEMENTATION_REPORT.md` changed for acceptance. Documentation commit `6e4e9015371ba1b1741b28e1c3020cbee843ef2b` was pushed normally and the PR description updated consistently. Exact-head [App Quality](https://github.com/keremtunaguneyy-byte/napsak-app/actions/runs/38754642602) and [Security Rules](https://github.com/keremtunaguneyy-byte/napsak-app/actions/runs/38754642630) both passed. After another head/base/review/thread/mergeability check, #77 was marked ready and merged with `--merge --match-head-commit`, without squash/rebase/force. Merge commit: `5ed153e46fe7bc53a4d9100efef2f62ec1183111`, merged 2026-10-15 14:53:39 UTC. Fetched `origin/main` and fast-forwarded local `main` matched that exact SHA before Stage 2.

User-provided exact-build Redmi acceptance for Saved is recorded in its report: mixed list, editorial saves, independent body/Unsave, final-item Empty, recommendation/editorial Android Back, restart persistence, normal layout/navigation clearance. Expired Event, real OS large text and TalkBack separation remain explicitly deferred; signed-release acceptance is separately unverified. Simple Ankara 101 Saved visuals remain for later Ankara 101 closure.

## PR #78 Redmi acceptance reconciliation

On 2026-10-15, the user reported testing exact PR #78 implementation head `6b03a1366f31bfd2271eaac6bd5ba0c8b8afef99` on Redmi and accepted:

1. First visits to Gezek, Mekân, Etkinlik and Fikir work.
2. Ten warm filter cycles preserve recommendation IDs and ordering.
3. The previous approximately three-second Mekân delay is gone.
4. The remaining transition below approximately one second is acceptable for the beta.
5. Pressing the active filter is a no-op.
6. Explicit refresh changes only the active filter.
7. Preference Cancel preserves snapshots.
8. Preference Save performs controlled invalidation.
9. Dismiss and Undo affect only the relevant surface.
10. Location behavior remains correct.
11. Detail → Android Back preserves the active filter and batch.

This is user-provided exact-build device evidence. The approximate timing observations are not instrumented native measurements or FPS claims. The behavioral defect and major delay are accepted as fixed; the remaining beta-accepted transition does not reopen performance implementation. The separately deferred checks are **real Android OS large text, TalkBack, and signed-release acceptance**. The browser evidence and original implementation verification ledger below remain historical evidence of that implementation, not new tests run during this documentation-only reconciliation.

Initial reconciliation verified the real repository path, branch, local/fetched PR head above, and local/fetched main/base `5ed153e46fe7bc53a4d9100efef2f62ec1183111`. Only protected Verilog work was untracked. PR #78 was Draft/open, CLEAN/MERGEABLE, with its expected one implementation commit and 22-file scope, no unexpected changes or conflicts, no reviews and no review threads (complete first page). Exact implementation-head App Quality `38760481964` and Security Rules `38760481715` were both successful.

Only `START_HERE.md`, `STATUS.md`, `DECISIONS.md` and this report change for acceptance; the PR description is reconciled consistently. No runtime/test/evidence/configuration file is changed. The user now authorizes normal commit/push, new exact-head App Quality and Security Rules, then ready + normal merge if the PR remains mergeable without a review blocker. No squash, rebase, amend or force push. After merge, fetch and fast-forward local main and verify equality with origin/main. Final head/CI/merge/main SHAs are reported from live Git/GitHub in the completion response; this pre-merge documentation commit does not assert completion in advance. PR #57 is closed as superseded without merge and remains untouched.

## Confirmed root cause and old lifecycle

Reproduced through actual `App.tsx` → `useValidatedRecommendationBatch` → `recommendAll`, using a frozen build of the verified main before production edits, not a simulated recommendation implementation.

`selectResultFilter` unconditionally called `setPreviousBatch([])` and `setRecommendationRun(run => run + 1)`, even for the already active tab. One shared run/history served all filters. Changing either changed `computeRecommendations`' callback identity; the validated-batch hook recomputed and replaced the visible batch. With cached coordinates it also ran service/permission preflight again. Separate Event diagnostics repeated their two engine calls on entering Event. Place's `locationRankingRevision` additionally recomputed on successful location arrival, conflicting with the newly explicit all-Home snapshot contract.

The Home heading DOM identity survived navigation: Home did not remount. Card/artwork subtrees did mount/unmount as different recommendation content was selected. This fix does not promise to eliminate those ordinary presentation renders.

Before edits, startup computed twice (unhydrated and hydrated inputs). The eight requested presses `Gezek → Mekân → Etkinlik → Fikir → Gezek → Mekân → Fikir → Gezek` produced **8 additional batches**. Twenty four-filter cycles produced **80 batches**, 20 per kind, with run advancing to 88. In a separate cached-location warm revisit, service reads, permission reads and primary batch counts each increased by one. Evidence: [before.json](evidence/home-filter-snapshots/before.json).

## New ownership and lifecycle

`homeFilterSnapshots.ts` owns four independent run/history/revision values and a bounded four-entry session cache. Each entry holds its semantic input key and complete measured recommendation result, including the ordered items, active first item, seed/history and Event diagnostics. `useHomeRecommendationSnapshot.ts` owns the cache for the mounted App/Home session. It does not change the shared Detail Host's validated-batch hook.

Only the hydrated, completed-onboarding, active Home surface computes. First visits compute once; matching returns reuse the exact cached batch. Repressing the selected tab returns immediately before any state update, undo clearing, profiling, seed change or engine call. Explicit “Başka … göster” retains its current name/design and the existing deterministic engine semantics, recording the current ordered IDs and advancing only that surface's seed.

A new location-scored batch still uses the existing read-only resolver if coordinates are cached; absent coordinates compute locationless immediately. Event/Idea do not score location and require no unrelated OS preflight. Async requests capture their semantic inputs and cannot publish after selection/input changes or unmount. While genuine preflight is pending, the previous committed content retains the current content height; a first cold target may temporarily display the previous committed surface, matching the prior lifecycle. That visible refresh action rotates the visible surface and cannot copy its IDs into another filter's history. Dismissed IDs are removed immediately even during this pending replacement.

There is no new scrolling design. Existing shared Home offset and Detail return restoration remain. Switching away clears an obsolete refresh's pending scroll intent so it cannot jump the restored target. A canceled batch request cannot later publish or scroll another filter.

## Invalidation matrix

| Trigger | Snapshot effect | Seed/history and other surfaces |
|---|---|---|
| First visit | Compute that filter once | Independent initial seed 0/history empty |
| Warm return / active tab press | None; zero engine/preflight calls | IDs, scores, order, main item, seed/history unchanged |
| Explicit refresh | Replace only active/visible filter | Only its seed +1 and previous IDs updated |
| Accepted Preference Editor Save/Apply | All four revisions invalidated; active computes once; others lazy | Existing preference commit/persistence boundary unchanged; no rotation |
| Preference Cancel/Close | None | All snapshots retained |
| Selected catalog payload/version changes | Relevant payload keys invalidate affected kinds; version/city/schema change invalidates all | Same seed/history; inactive lazy |
| Equivalent deserialized catalog or fetchedAt-only change | None | No polling/version fetch introduced |
| Dismiss / Undo / restore | Only owning kind's dismissed-ID key changes; currently dismissed rows hidden immediately | Existing exclusive save/dismiss and restore-unsaved contract retained; no other kind rotation |
| Save / unsave alone | Presentation only | No batch replacement or engine call |
| Location grant/clear/revalidation | Distance presentation only | All existing IDs/order/scores retained, including Place |
| Later genuine location-scored batch | Existing service/foreground-permission resolver before scoring | Freshest valid location, same formula; warm returns skip resolver |
| Existing known eligibility boundary | Event and Experience invalidate | Existing one-shot expiry/lifecycle scheduling unchanged; Place/Idea retained |
| Real successful Event retry/recovery | Event revision invalidates; genuinely selected catalog changes apply normally | No navigation-as-retry; no rotation; failed retry retains approved resolver/cache behavior |
| Home hidden in Saved/editor/Detail | No eager recommendation computation | Needed invalidation resolves lazily on Home return |
| Full process restart / legitimate data reset | Session snapshots discarded/reset | Existing persisted preferences/saved/dismissed/catalog unchanged; no new schema |

Relevant catalog payload keys are calculated only when a catalog object is actually selected. Experience depends on Experiences, Places and Events; the other filters each depend on their own records. Catalog arrays, IDs, relationships and facts are not modified. Dismissal ownership follows the existing direct-ID-before-scoring algorithm: a dismissed Place does not dismiss an Experience containing that stop.

Preference invalidation uses the existing accepted Apply boundary and asynchronous persistence behavior. This PR does not introduce a different editor transaction, error UI or persistence contract.

## Controlled computation, render and timing results

[comparison.json](evidence/home-filter-snapshots/comparison.json) contains the measurements and methodology; [after.json](evidence/home-filter-snapshots/after.json) contains exact per-filter IDs/order/scores and all 52 browser scenario-group assertions. Four configurations passed: 393×852 and 412×915, normal and simulated 1.8× text.

| Measurement (393×852, normal text) | Frozen main before | After |
|---|---:|---:|
| Startup primary computations | 2 | 1 |
| Eight requested presses, additional computations | 8 | 3 (only first visits to Place/Event/Idea) |
| Twenty full four-filter cycles, computations | 80 (20 per kind) | **0** |
| All engine calls including Event diagnostics during warm cycles | Baseline did not separately instrument this counter | **0** |
| Home render delta during warm cycles | 80 | 79 |
| Artwork render delta | 1,909 | 1,896 |
| Artwork mount/unmount delta (each) | 1,591 | 1,580 |
| SVG cache misses / elements constructed | 20 / 162 | 0 / 0 |
| Repress active tab | Recomputes/rotates | 0 compute, 0 Home/artwork render |

The 80-press cycle begins by pressing already-active Gezek; the new no-op explains the one fewer Home render. Artwork rendering remains on real surface switches; this PR fixes batch lifecycle, not artwork caching or rendering design. All four configurations have one initial primary computation per filter and zero warm-cycle recommendation or diagnostic calls.

Same budget (`Fark etmez`) and fixture preferences were used for baseline/after render comparison. Browser wall time includes Playwright dispatch/waits plus two animation frames and is not isolated engine time. At 393×852, cold first-visit wall times after were Place 147 ms, Event 115 ms, Idea 97 ms; initial warm returns were 80/81/80/81 ms. Twenty-cycle median warm wall times were Gezek 79 ms, Place 79 ms, Event 78 ms, Idea 79 ms. Baseline sequence wall times ranged 79–136 ms. These do **not** establish a native speedup, Redmi latency or FPS. Zero warm computation is the decisive measured result. Standalone unchanged-engine benchmark: 5,000 calls, p95 7.308 ms against 25 ms budget, checksum 22308.

Reviewed all four [Home screenshots](evidence/home-filter-snapshots/) individually. Normal and simulated-large text preserve the existing Home design, wrapping and fixed navigation. Large text extends content below the fold and remains scrollable. No layout/artwork mapping source changed. Real Android text scaling and screen-reader acceptance remain device checks.

## Focused regressions

Eight new automated policy/engine tests cover cache reuse, independent rotation, Apply/Cancel, semantic catalog changes, scoped dismiss/restore, save/location identity exclusion, eligibility/Event retry, and identical-input determinism including three explicit rotations per kind. The browser test exercises the actual App/hook/engine, including held native preflight, stale callbacks, cold first visits, visible refresh ownership and canceled scroll intent.

[regressions.json](evidence/home-filter-snapshots/regressions.json) records existing browser suites: 80 location-preflight, 56 distance, 36 Saved, 10 onboarding, and 38 Preference/Event checks, all without page errors. The location suites' former immediate-Place-rerank assertions were updated to the user-approved all-Home snapshot contract. Service/permission/error/timeout, late result, hidden screen and explicit-refresh checks remain.

Identical direct inputs retain identical full engine output/scores, verified through tests and the existing determinism/stress/quality suites. `src/recommendations.ts`, domain/content policy, catalog/data, recommendation location resolver and validity monitor are unchanged from the merged base. No eligibility, weights, duration, Bedava gate, ranking, diversity, rotation formula, location formula, Firebase/persistence schema, Detail Host, onboarding, Saved UI, Event design, artwork mappings, Ankara 101 implementation or release configuration changes.

## Verification ledger

All commands below succeeded on this work. Final typecheck/test/Android export were repeated after the last production change. Earlier stress/performance/quality checks exercise unchanged algorithm inputs; subsequent edits only canceled a stale Home scroll intent.

| Command | Result |
|---|---|
| `git diff --check` | PASS |
| `git diff --cached --check` | PASS before commit |
| `npm ci` | PASS; no dependency/lockfile changes; existing audit reports 64 findings (24 moderate / 38 high / 2 critical), dependency remediation outside scope |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 111 compiled tests + 195 TS tests = 306; zero failures |
| `npm run test:catalog` | PASS; 1 city / 178 Places / 52 Experiences / 9 Events / 140 Ideas / 12 guides |
| `npm run check:events` | PASS; 9 upcoming, 0 expired/stale; current catalog health preserved |
| `npm run check:accessibility` | PASS, 13 checked files |
| `npm run test:stress` | PASS, 2,560 generic + 640 Experience scenarios; zero mismatches/duplicates/diversity failures; 2,512 + 480 rotation checks |
| `npm run check:performance` | PASS, 5,000 calls, p95 7.308 ms, checksum 22308 |
| `npm run check:recommendations` | PASS, 15 golden scenarios, zero objective failures/determinism failures |
| `npm run check:assets` | PASS, 392 records / 125 families / 375 variants / 46 icons / 11 UI assets |
| `npm run check` | Not run: no `check` script exists |
| `npx expo export --platform android --output-dir /private/tmp/gezek-filter-android-final` | PASS; Android Hermes bundle and assets exported |
| `node tests/home-filter-snapshots-browser.cjs` | PASS, 52 scenario groups, 4 viewport/text configurations, zero page errors |
| `node tests/location-preflight-browser.cjs` | PASS, 80 checks |
| `node tests/experience-distance-browser.cjs` | PASS, 56 checks |
| `node tests/saved-browser.cjs` | PASS, 36 checks |
| `node tests/onboarding-browser.cjs` | PASS, 10 checks |
| `node tests/preference-event-browser.cjs` | PASS, 38 checks |
| Protected Verilog SHA-256 comparison | PASS; both files remain byte-identical and untracked |
| Algorithm/catalog/location source diff against merged base | Empty |

Browser prerequisites remain external at `/private/tmp/gezek-artwork-web-deps/node_modules` (React Native Web, React DOM, Playwright) and local Chrome. No dependencies added to the app. Build each fixture using `GEZEK_BROWSER_MODULES=... GEZEK_BROWSER_OUTPUT=... node scripts/buildDetailBrowserFixture.cjs`; set `GEZEK_SNAPSHOT_FIXTURE=true` for the new suite, `GEZEK_DISTANCE_FIXTURE=true` for distance/preflight, `GEZEK_SAVED_FIXTURE=true` for Saved, `GEZEK_ONBOARDING_FIXTURE=true` for onboarding, or `GEZEK_PREFERENCE_FIXTURE=true` for Preference/Event. Serve that directory locally, then set `GEZEK_BROWSER_MODULES`, `GEZEK_BROWSER_URL` and `GEZEK_BROWSER_OUTPUT` before the relevant browser command (onboarding uses `GEZEK_BROWSER_EVIDENCE` for evidence output). Fixture-only diagnostic globals, service adapters and profiling are not included in production App code.

Local Firebase Rules and release-readiness checks were not separately rerun: this PR changes neither contract/configuration; repository CI covers its normal checks. No physical-device or signed-release run was available in this session. Android Expo export and controlled browser tests are not signed-release device evidence.

## Files, review state and native acceptance

Exact file inventory: [HOME_FILTER_SNAPSHOT_CHANGED_FILES.txt](HOME_FILTER_SNAPSHOT_CHANGED_FILES.txt). Runtime changes are limited to App wiring plus the two Home snapshot modules. Test/fixture changes, focused evidence and status/decision updates make the lifecycle reviewable. PR #57 was not modified; `src/firebase/BA_4bit.sv/` remains untouched and uncommitted. No amend, reset, clean, stash or force push used.

The original implementation was authorized for one separate Draft PR. The later PR #78 Redmi acceptance reconciliation above supersedes that original hold and authorizes a conditional normal merge. Exact-head CI, final head and merge/main commits must be verified live and reported in the completion response.

Original Redmi retest checklist (historical; accepted checks and remaining deferrals are reconciled above):

1. Visit all four filters, note first main item and ordered alternatives; repeat 20 cycles and verify they stay unchanged with no former warm-return pause. Measure real device latency separately.
2. Repress the selected filter; verify no rotation. Refresh each filter explicitly and verify only that filter changes; return to the others.
3. Change a preference and Save; active refreshes, others compute on next visit. Change and Cancel; all four remain.
4. Save/unsave without batch movement; dismiss cannot reappear after switching; Undo restores unsaved and existing notice behavior.
5. Acquire/clear location or toggle services/permission; existing IDs/order remain, distance presentation updates, and an explicit later refresh safely preflights. Revisit warm filters without GPS/prompt.
6. Home → Detail → Android Back preserves filter/batch/offset; verify normal navigation and pending-refresh switches do not jump. Check genuine Event loading/error/Retry/recovery.
7. Repeat normal/actual OS large text and TalkBack interactions. Signed-release acceptance remains a separate gate. Saved's expired Event/native text/TalkBack deferrals and Ankara 101 visual closure remain open as already recorded.

No implementation blocker was found during local implementation validation. The subsequent user-reported Redmi acceptance closes the confirmed filter defect and major-delay acceptance; real Android OS large text, TalkBack and signed-release acceptance remain separately deferred. Existing Saved-specific expired-Event and Ankara 101 visual closure deferrals are unchanged.
