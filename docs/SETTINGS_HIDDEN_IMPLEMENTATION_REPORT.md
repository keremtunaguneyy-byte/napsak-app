# Production Settings and Hidden Items

Implemented 23 October 2026, Europe/Istanbul. Delivery is one Draft PR, not merged. Physical-device acceptance belongs to the user.

## Repository and authority

Canonical repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`. Separate existing worktree: `/Users/kerem/.codex/worktrees/9975/napsak-app`. Initial detached HEAD and freshly fetched `origin/main` both `3bc0e9631d059d4ef0bdf573cdf8263e674a1e91` (post-#82). No tracked/untracked work in this feature worktree before implementation. No open PRs. Branch: `codex/gezek-production-settings-hidden`, created from that fetched main. The canonical checkout and protected untracked `src/firebase/BA_4bit.sv/` were not modified; protected contents were not inspected.

Read the supplied closure and runtime audit; parsed and traversed the complete 1,294,982-byte metrics JSON (34,391 leaves), SHA256 `661ada8768726d4ae1c28c0a3881340474c21e172516ac716a90621478608842`. No measurement experiment was regenerated. Their historical main is superseded by the live Git baseline above. The user's implementation request supersedes audit-only recommendations and the closure's historical two-PR split; #82's Mekân correction remains unchanged.

Read-only Figma design-to-code inspection: file `yTdAWr92ETyurlQQHNNqpi`, approved section `1419:15195`; Settings `1430:17221`, `17256`, `17291`, `17326`; Hidden `1431:17742`, `17864`, `17986`, `18108`. Exact copy/navigation/action/restore contracts are closure §§5–6. No Figma mutation or broad audit. Existing Back/Close/brand and semantic Compact artwork are reused; the approved 22×22 restore SVG is local. Both widths center a 353px content lane; the body scrolls. Large text stacks static row contents and expands controls naturally.

## Implemented contract

Settings exposes Bugünkü tercihlerin, Gizlediğim öneriler, accurate inline local/anonymous-document/RAM-location explanations, and confirmed Tüm verilerimi sil. The pre-existing diagnostic remains available only under its existing non-production environment gate. No account, notifications, version, legal/help links, theme/language/location dashboard or onboarding-reset action was added.

The existing Production Preference Editor receives a typed `settings` origin. Drafts and field drafts remain local until Apply/Save. Cancel/Back/Close do not persist. A coherent Save preserves onboarding completion and the current all-mode preference invalidation. Duplicate and obsolete editor callbacks cannot reapply a departed session. Settings remains the host, preserving its scroll and returning focus to the entry row.

Management captures Home/Saved/Ankara caller, Home filter, entry focus and scroll. Settings Back/Close returns to caller; Settings → Hidden Back returns to Settings; Hidden Close exits the whole management host. Direct Home → Hidden Back returns Home. Brand/Önerilere dön explicitly returns Home. Android Back retains nested Modal handling before host exit. Hidden bottom selection reflects the caller and its tabs retain the existing navigation behavior. Saved and Ankara hosts remain mounted but inaccessible while management owns the screen, and restore their viewport/gear focus on return. Home batches/runs/history are not changed by navigation.

Hidden resolves the four supported kinds by stable kind + ID in original dismissal order, using existing public-resolvability policy. Unresolved, Guide and hard-excluded IDs have neither row nor visible count and are not automatically pruned. Inactive resolvable Places and expired Events have truthful status metadata; restoration never bypasses eligibility. Static card bodies have no Detail, URL or Save action. Existing semantic Compact artwork is decorative.

Individual Geri getir uses the existing reducer: removes the ID from dismissed and saved, clears matching Undo and removes the row immediately. Rapid taps are latched; departed-host/reset callbacks are rejected. Focus moves to next/previous restore or empty heading, with one accessibility announcement. Final visible removal shows the approved displayable-empty state even if unresolved IDs remain. Bulk is shown only with resolved rows, clears the entire dismissed array (including unresolved/foreign IDs), preserves saved, clears Undo and has no extra confirmation. There is no fake restore spinner, delay, cloud-success message or rollback.

The existing per-kind dismissal keys invalidate that kind's A and B2 slots. No explicit extra invalidation, seed increment, history increment, catalog/filter dimension or recommendation-engine change was introduced. Old keys cannot be accepted as current mode snapshots. Reappearance competes under existing eligibility with unchanged seed/history; insertion is not guaranteed.

## Deletion, persistence and failure boundaries

The native Alert's exact destructive confirmation/cancelability and the existing backend pipeline are retained. A synchronous root-owned controller prevents duplicate confirmation/confirmation callbacks. Busy reflects only the real asynchronous deletion; new edit/restore entries and duplicate deletion disable, Back/Close stay functional and do not cancel the operation.

The service result selects exact approved copy: local-only cleanup, connected user-document cleanup, or Auth-only partial failure. Successful data cleanup and Auth partial reset to first-use Welcome, clear RAM interactions/location/runs and invalidate old editor/restore callbacks. Identity, remote or cleanup exceptions show the approved incomplete result and never falsely reset or promise all data was preserved. Returning from an error/Cancel focuses the delete entry when its host is visible. Root unmount ignores late completion; leaving Settings does not.

No backend, Auth model, schema, Rules, queue or local storage key changed. Existing serialized remote-first deletion, deleted-UID tombstones, queue ownership and local generation boundaries remain authoritative. Restoration stays optimistic: local failure shows Kayıt yapılamadı, keeps the updated current-session list, and acknowledgement restores list focus without rollback. A successful restart reloads the persisted restored state; after failed disk writes restart can differ. Offline remote work uses the existing snapshot queue and has no new UI guarantee. Timeout is not cancellation; process termination is not resumable/atomic deletion. No production or connected Firebase mutation was performed.

## Accessibility and evidence

44×44 header/brand/action targets; normal restore 132×46 and large restore 220px with natural height; destructive target ≥56px. Title-entry and nested return focus, independent restore buttons, once-only announcements, real disabled/busy reason, decorative artwork exclusion, wrapping Turkish copy, root Android insets and 24px list-end clearance are implemented. No new spatial animation or timed restoration; existing bottom-navigation system text scaling remains intact. Native Alert and TalkBack behavior require real-device acceptance.

The exact inventory contains 32 changed files. Eight canonical PNGs and two compact JSON files are under `docs/evidence/settings-hidden/`. Browser tests use actual App/components/reducers with explicit native/service adapters; screenshots are not native evidence. Existing regression screenshots were suppressed, and temporary bundles/logs stayed under `/private/tmp`. [Focused scenarios](evidence/settings-hidden/results.json), [complete verification](evidence/settings-hidden/verification.json), [exact file inventory](SETTINGS_HIDDEN_CHANGED_FILES.txt).

## Validation

| Command | Final result |
|---|---|
| `git diff --check` / `git diff --cached --check` | PASS; rechecked at delivery |
| `npm ci` | PASS; lockfile unchanged. npm reports 47 existing audit findings (20 moderate / 25 high / 2 critical); no dependency changes |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 111 CJS + 269 TypeScript tests; includes 17 focused Settings/Hidden tests |
| `npm run test:catalog` | PASS |
| `npm run check:events` | FAIL, unchanged `stale_verification`: 9 total / 6 upcoming / 3 expired / 9 stale; same current canonical main result |
| `npm run check:accessibility` | PASS; includes all three new screen/shell files (16 sources) |
| `npm run test:stress` | PASS |
| `npm run check:performance` | PASS |
| `npm run check:recommendations` | PASS |
| `npm run check:assets` | PASS |
| `npm run check:build -- --profile=preview` | PASS |
| `npm run check:observability` | PASS |
| `npm run check:release` | PASS in existing non-strict baseline mode; does not close release blockers |
| `CI=1 npx expo export --platform android --output-dir /private/tmp/gezek-settings-hidden-android` | PASS; final-code export also passed at `/private/tmp/gezek-settings-hidden-android-final` |
| Focused `tests/settings-hidden-browser.cjs` | PASS: 21 scenario groups, zero page errors; 393×852 / 412×915 × 1 / 1.8 simulated text, populated/empty/stale/long/inactive/expired, three callers, editor, restore, restart and deletion outcomes |
| Existing Home snapshots, location preflight, Experience distance, proximity / edges / lease, Preference/Event, Ankara101 and Detail browser suites | PASS (9 suites) |
| Existing Saved, location-validity, Event/Idea browser suites | Same three failures reproduced from an `origin/main` archive; details below |

Initial new-test failures were corrected: editor selector role/copy, fixture startup-write isolation, UI tap simulation and state probe before Welcome's early return. Full-test source assertion and accessibility tag scanning were corrected by retaining the onboarding guard order and placing role attributes before callback refs. The final full test and accessibility runs pass. No historical test result is used to validate this tree.

Three unchanged browser baselines, reproduced against `3bc0e9631d059d4ef0bdf573cdf8263e674a1e91` with identical failures:

- `saved-browser.cjs:86`: old exact Guide heading visibility expectation. Four recommendation-kind Detail Back/Close and nested Plan/Place checks pass before it. The full current Ankara suite independently passes Saved-origin readers, and the focused suite passes Saved → Settings/Hidden → caller/gear/scroll.
- `location-validity-browser.cjs:21`: waits for old Konum izni iste button no longer present after accepted proximity UI. Current preflight and proximity/lease/edge suites pass.
- `detail-event-idea-browser.cjs:61`: its expired fixture selects the first catalog Event without making it expired; the expected expired message is absent. Existing internal Event/Idea/default/external checks before that point pass. No Event data or external behavior changed.

No requested script is missing. `test:rules` was not run locally because Rules/Firebase were unchanged; exact-head Security Rules CI is required. Physical device, TalkBack, real OS font scale, connected/offline Firebase and signed-release checks were not run because the user explicitly deferred device acceptance and no connected test environment was authorized.

## Pending Redmi acceptance

Record exact commit/build and test with disposable local/test-account data:

1. Home (all four filters), Saved and Ankara101 → Settings: Back/Close/hardware Back restores caller, filter, scroll, selected tab and gear. Direct Hidden and nested Settings → Hidden Back/Close behave as above.
2. Settings → Editor: field Back/Cancel, full Close, Apply/Save; drafts cancel without writes, completion stays complete; return focus/scroll. Confirm no Welcome replay except actual deletion.
3. Hide/restore all four kinds; inactive/expired, mixed stale and stale-only, last-row empty, long list, rapid taps, unsaved invariant and restart. Bulk preserves saved and clears all dismissed IDs. Confirm A/B2 can reconsider restored items without unrelated rotation or leakage.
4. Airplane mode and actual local write failure: immediate current-session restore, truthful failure Alert, queue/restart limitations. No cloud-success badge or fake busy delay.
5. Delete Cancel, local/connected success, Auth partial and identity/remote/cleanup failure in an approved disposable environment; duplicate tap, Back/Close while busy, truthful outcome, no stale callback or preference resurrection. Do not use production personal data for agent-led tests.
6. TalkBack entry/return order, next/previous/empty focus and single announcements; native Alert focus/cancelability; decorative exclusions and selected/disabled/busy states.
7. Real Android large text/maximum supported font, 393/412-class insets, Turkish wrapping, reachable end actions, navigation/status-bar clearance; OS Reduced Motion.
8. Repeat changed journeys on an exact signed artifact under the release-device runbook. Expo Go/export/browser evidence does not close that gate.

## Preservation and delivery

Home atmosphere/background, the merged Mekân pill correction, recommendation engine/eligibility/scoring/diversity/rotation, A/B2 math and lease, catalog/IDs/relationships, Saved semantics, Event/Idea external behavior, Firebase/Auth/persistence schemas, analytics and release configuration are unchanged. Only management navigation/focus, presentation and truthful operation handling changed. No new dependency or global store.

Three normal logical commits: Settings/shared foundation; Hidden and shared App integration; tests/evidence/documentation. Draft PR and exact-head required CI state are recorded in the PR/current chat delivery after push; no ready/merge operation is authorized. Recommended next step: the user's Redmi checklist, followed by review of the Draft PR. Existing release blockers and baseline browser/Event failures remain open.

## 24 October 2026 — F01 stale-callback coverage correction

Continuation starts from clean `codex/gezek-production-settings-hidden` / Draft PR #83 at `91e69aa970bc3dcf5350df53dd6e0222a0a37144`, fetched main/base `3bc0e9631d059d4ef0bdf573cdf8263e674a1e91`. Remote, worktree, branch, local/remote/PR heads and Draft status were verified before editing. No new branch/worktree/PR, amend, rebase, force-push or merge. Protected untracked Verilog remains untouched and uninspected.

F01 was a false-positive **test coverage defect**, not demonstrated production failure. The original test assigned `window.__lateEditor` / `window.__lateRestore` in earlier scenarios, called `fresh(page)` before deletion, then used optional invocation after those globals had been erased. Its restore wrapper also looked up `window.__managementCallbacks.restoreHidden` when invoked, so it did not retain the historical function object. The earlier 21-group browser result does not establish that missing stale-callback claim; this follow-up supersedes it for that purpose.

The corrected test captures the actual `applyEditor` and `navigatePreferenceEditor` functions while an unapplied changed budget draft exists, closes that editor, then captures actual `restoreHidden` and `restoreAllHidden` functions while real dismissed rows remain. It freezes those function references and stores the restore argument separately. Before destructive confirmation it asserts all four are callable, differ from the newly rendered current callbacks, retain object identity and belong to the same document UUID. There is no reload or callback replacement between capture, busy state, completion and result acknowledgement; no optional callback invocation can hide missing setup.

The matrix covers Home, Saved and Ankara101 callers × local success, connected success, Auth partial and failure: **12 lifecycle scenarios × four phases × four historical functions = 192 checked invocations**. Phases are busy in Settings, busy after returning to caller, completed reset (or failed deletion without reset), and result acknowledgement. The approved failure harness has **no failure/reset path**: it preserves completion/state/caller and is asserted as such. Success/partial explicitly reaches Welcome with saved/dismissed empty. Saved/Ankara start from nonzero scroll and retain caller origin/viewport during busy return and failure.

Each historical invocation is compared against its own settled phase baseline, permitting the legitimate deletion reset while rejecting callback-induced changes. Checks cover every preference field, saved/dismissed IDs, onboarding, editor/route/origin/focus/scroll state, A/B2 run/seed/history/revisions, current recommendation snapshot/key and the actual existing six-slot cache, local/remote write arrays/counts, durable fixture storage and deletion call count. Added fixture probes only observe existing state/cache in the temporary browser bundle; production state and cache implementations are untouched. The entire corrected browser suite retains the original visual/restore/navigation/persistence/deletion checks; screenshots are disabled for this non-visual follow-up.

### Sensitivity check

Four independent temporary mutants bypassed the first guard in one real App callback at a time. Only a temporary bundle retained each mutation. `App.tsx` was restored byte-for-byte immediately after each mutant build, **before** running its browser negative control, using `try/finally`; no intentionally broken code was staged or committed. Restored SHA256: `67d36b7cbfff6fb07ab65ec982cdeabe7f568604f58ecea0891dc27a9c25a99e`.

| Bypassed production guard | Corrected test result (expected exit 1) |
|---|---|
| `applyEditor` | Detected `results/local/busy-settings/applyEditor changed state.filterRuns` |
| `navigatePreferenceEditor` | Detected `results/local/busy-settings/navigatePreferenceEditor changed state.preferenceSession` |
| `restoreHidden` | Detected `results/local/busy-settings/restoreHidden changed state.dismissed` |
| `restoreAllHidden` | Detected `results/local/busy-settings/restoreAllHidden changed state.dismissed` |

The guarded implementation passes; all four mutants fail on real state differences, rather than missing callbacks or fixture setup. **Production-code changed: no.** `git diff 91e69aa -- App.tsx src assets package.json package-lock.json` is empty. The correction changes only `tests/settings-hidden-browser.cjs`, `scripts/buildDetailBrowserFixture.cjs`, this report and `docs/STATUS.md`. The canonical 32-path PR inventory remains exact: no new path was added, so `SETTINGS_HIDDEN_CHANGED_FILES.txt` needs no content change. START_HERE's product-state summary remains accurate.

### Follow-up validation

Commands use existing external browser tooling `GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules`. Temporary logs, bundles, mutant results and compact JSON remain under `/private/tmp/gezek-settings-hidden-f01`; **zero new screenshots** and no evidence collection was committed.

| Exact command / scope | Exit / result |
|---|---|
| `git fetch origin` plus Git/PR identity verification | 0; expected head/base, clean worktree and Draft #83 confirmed |
| `node --check tests/settings-hidden-browser.cjs` | 0 |
| `GEZEK_MANAGEMENT_FIXTURE=true GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-settings-hidden-f01/guarded node scripts/buildDetailBrowserFixture.cjs` | 0 |
| `GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules GEZEK_BROWSER_URL=http://127.0.0.1:8810/guarded GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-settings-hidden-f01/guarded-results GEZEK_BROWSER_SCREENSHOTS=false GEZEK_SETTINGS_HIDDEN_CASE=stale node tests/settings-hidden-browser.cjs` | 0; 12 same-document lifecycle scenarios |
| `python3 /private/tmp/gezek-settings-hidden-f01/sensitivity.py` | 0; all four negative controls exit 1 at the expected state-mutation assertion; source restored |
| `GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules GEZEK_BROWSER_URL=http://127.0.0.1:8810/guarded GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-settings-hidden-f01/full-browser-results GEZEK_BROWSER_SCREENSHOTS=false node tests/settings-hidden-browser.cjs` | 0; 30 scenario groups, zero page errors, 192 historical invocations, zero PNGs |
| `node --import tsx --test tests/settings-hidden.test.ts tests/user-data-boundary.test.ts tests/persistence.test.ts tests/detail-flow.test.ts tests/preference-event.test.ts tests/home-filter-snapshots.test.ts` | 0; 77/77 tests |
| `GEZEK_PREFERENCE_FIXTURE=true GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-settings-hidden-f01/preferences node scripts/buildDetailBrowserFixture.cjs` | 0 |
| `GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules GEZEK_BROWSER_URL=http://127.0.0.1:8810/preferences GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-settings-hidden-f01/preferences-results NODE_OPTIONS=--require=/private/tmp/gezek-settings-hidden-regression/no-screenshots.cjs node tests/preference-event-browser.cjs` | 0; 38 checks, zero page errors; screenshot-only suppression |
| `npm run typecheck` | 0 |
| `npm run check:accessibility` | 0; 16 sources |
| `npm test` | 0; 111 CJS + 269 TypeScript tests, zero failures |
| `git diff --check`; `git diff --cached --check` before commit | 0; checked before the normal follow-up commit |

No `npm run check` was invented; package scripts were inspected. No production code changed, so local Android Expo export and broad unrelated browser/native runs were not repeated. No Event/legacy-browser baseline failure was encountered by these targeted runs; the initial-delivery baseline findings above remain historical and separate. Existing Settings/Hidden copy/design, Figma, Home, recommendation/catalog/Event, Firebase/Rules/persistence schemas, proximity/lease/acquisition, onboarding, Saved, Ankara, artwork and release configuration are preserved. All Redmi/TalkBack/real OS text/Reduced Motion/connected-test-data/signed-release acceptance above remains pending; this test correction supplies no new native or Android behavior claim.

Normal follow-up commit/push targets the same Draft PR #83. Exact new SHA and terminal App Quality/Security Rules CI links are recorded in the PR and chat after push. Keep Draft and unmerged; next step remains the user's existing Redmi checklist.
