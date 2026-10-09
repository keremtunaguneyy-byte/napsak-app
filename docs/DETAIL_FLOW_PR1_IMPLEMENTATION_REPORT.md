# Gezek Detail Flow PR 1 — implementation and acceptance evidence

Date: 2026-10-08. Repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`.

## 2026-10-09 — Plan chip-row follow-up on existing Draft PR #69

Verified clean local/fetched remote head `9e5cd7459ade5862b624d2da18a244e6fae87842`, same `codex/gezek-detail-plan-place` branch and open Draft PR #69. The earlier ID removal also removed the whole Plan chip row. The user explicitly requested restoring only supported Experience metadata. Plan now displays its own `category`, `district` (Turkish uppercase), and existing formatted `priceLevel` (`Bedava` at 0), with lavender chips and the unchanged wrapping style. Place labels, order, price formatter and mint styling are unchanged. No ID, first-Place, title, artwork or reason-derived metadata is rendered. Bookmark, history, snackbar and all completed corrections remain intact.

Proportionate verification only:

| Verification | Current result |
| --- | --- |
| `git diff --check` | Pass, exit 0 |
| `npm run typecheck` | Pass, exit 0 |
| `npm test` | Pass, exit 0: 111 compiled + 85 TypeScript = 196 tests; 13 Detail tests |
| `npm run check:accessibility` | Pass, exit 0: eight source files, 16 minimum-target styles |
| Existing Detail browser/component checks | Pass: 44 regression checks (32 prior + 12 chip cases), 38 existing layout/navigation checks, zero page errors, both 393×852 and 412×915 |
| `CI=1 npx expo export --platform android --output-dir /tmp/gezek-plan-chips-android-export` | Pass, exit 0; Android Hermes export |

The added source regression verifies direct Plan/Place fields, unchanged price formatting, no ID/inference in the row and wrapping. Rendered-component regressions verify exact catalog chip labels for both Plan and Place, forbidden visible `xp-…` IDs, a real Eymir Plan's `DOĞA / GÖLBAŞI / Bedava`, and identical Experience labels when the fixture's associated Place category/district/price differ. Narrow-screen and simulated fontScale 1.8 containment/wrapping pass for both families. The test fixture modifies associated Place metadata only in memory; production catalogs remain unchanged. Existing browser navigation/bookmark/snackbar checks also pass.

Evidence: `docs/evidence/detail-pr1-redmi-corrections/plan-chip-results.json`, `plan-chips-393.png`, `plan-chips-412.png`. Visually inspected both free Eymir screenshots. Existing reproducible fixture/suite commands below apply. No new dependencies, branch, PR or merge. Normal commit/push and PR-body update are authorized; resulting SHA and current CI are recorded in Git/GitHub and the completion response.

Exact changed files for this follow-up:

- `src/components/gezek/DetailHost.tsx`
- `scripts/buildDetailBrowserFixture.cjs`
- `tests/detail-flow.test.ts`
- `tests/detail-browser-regressions.cjs`
- `docs/DETAIL_FLOW_PR1_CONTRACT.md`
- `docs/DETAIL_FLOW_PR1_IMPLEMENTATION_REPORT.md`
- `docs/evidence/detail-pr1-redmi-corrections/plan-chip-results.json`
- `docs/evidence/detail-pr1-redmi-corrections/plan-chips-393.png`
- `docs/evidence/detail-pr1-redmi-corrections/plan-chips-412.png`

Stress, performance, catalog, separate state-browser and release checks were not rerun locally because this is a metadata-only UI correction and the user requested the proportionate list above. GitHub CI runs its configured gates independently. Physical Redmi/TalkBack and signed-release validation were not available; next step is verifying the restored chip row on Redmi. Recommendation, catalog, Firebase and release contracts remain unchanged. PR #69 stays Draft/unmerged; earlier results below are historical.

## 2026-10-09 — Redmi correction follow-up on existing Draft PR #69

Previous verified local/remote HEAD: `3232de3179bb634ac2a22b6478d23b3dfd2f455e`. Fetched the existing branch and `main` before editing; worktree was clean. Continued `codex/gezek-detail-plan-place`; no new branch or PR. User explicitly authorized normal commit/push and updating Draft PR #69, with no merge. New commit SHA, push and current CI are recorded in Git/GitHub and the completion response; no self-referential SHA is written into this commit.

### Device findings and corrections

Inspected the three supplied Redmi images in Downloads (`WhatsApp Image 2026-10-09 at 12.55.04 (1).jpeg`, `(2).jpeg`, `(3).jpeg`). They show Place hearts and Plan `xp-da-vinci-yeni-oyun` beneath Hero. This is an internal Experience ID, not an image filename. Removed the Plan chip entirely with no replacement metadata; IDs still drive routing/lookup/artwork, and catalog duration/budget/stops remain visible. Actual rendered-body regression checks forbid visible `xp-…` IDs.

Replaced both Detail heart assets with 22×22 outlined navy / filled cobalt bookmarks, updating the local XML registry and SHA manifest. User approval is the component-level override authority. Figma Save `928:1779` and its glyph nodes still need a later synchronization; no Figma write or export claim was made for these glyphs. Selected, busy, disabled and accessibility behavior plus 44×44 targets remain intact; other controls were not redesigned.

The reported alternating Plan–Place duplicate Back history now truncates to the existing `kind + id` frame. Surviving scroll, return-focus key and original reasons are preserved; distinct Plan B stays nested. Root Back restores Home/Saved, nested Back restores its parent, and Close exits any depth.

Snackbar Undo eligibility still expires after eight seconds. At expiry the action is disabled and the presentation fades and moves 6 px down over 180 ms using native Animated; reduced motion removes the presentation instantly. This presentation-only exit cannot restore persistence or extend Undo. New dismissal resets timers/animation; Undo/Restore/navigation/unmount cancel pending work. Home and Detail share this existing lifecycle; no Home or Saved redesign was introduced.

### Current verification (supersedes historical results below)

| Verification | Result |
| --- | --- |
| `git diff --check` | Pass, exit 0 |
| `npm run typecheck` | Pass, exit 0 |
| `npm test` | Pass, exit 0: 111 compiled + 84 TypeScript tests = 195 total; 12 Detail regressions |
| `npm run check:accessibility` | Pass, exit 0: 8 source files, 16 existing minimum-target styles; reduced-motion and expired Undo gates added |
| `npm run check:performance` | Pass, exit 0: 5,000 iterations, p95 9.068 ms, p99 9.539 ms, below 25 ms budget; local JS benchmark |
| `npm run test:stress` | Pass, exit 0: 2,560 recommendation scenarios, 640 Experience scenarios, 192 Experience rotation checks; zero mismatch/duplicate/diversity/rotation issues |
| `npm run test:catalog` | Pass, exit 0: unchanged version 2026-09-21.1; 1 city / 178 Places / 52 Experiences / 14 Events / 140 Ideas / 12 guides |
| `CI=1 npx expo export --platform android --output-dir /tmp/gezek-redmi-android-export` | Pass, exit 0: Android Hermes export; not a signed build or physical-device test |
| `npm run check` | Absent; attempted command exit 1, Missing script; never reported as a pass |
| Browser/component at 393×852 and 412×915 | Pass: 32 new regression cases + 38 existing layout/navigation cases, zero page errors |
| Actual-App state/undo/Saved context | Pass: seven checks, real 8.3-second wait verifies persistence after exit; zero page errors |

New reducer tests cover revisiting Plan A and Place X, preserved frame scroll/focus/reasons, same-current-route idempotence, distinct Plan B, root Back and depth-independent Close. Timer tests cover exact eight-second cutoff, 180 ms presentation removal, consumed Undo, reset during exit, stale callbacks and cleanup. Local asset tests validate bookmark geometry/tokens and override provenance along with all SVG SHA hashes. Native transition source checks cover reduced-motion subscription and animation cleanup.

`tests/detail-browser-regressions.cjs` adds actual-App Home→Plan A→Place X→Back→Plan A→Back→Home and select-parent-Plan→root→Home checks, invoking-control focus, distinct nested Plan B, surviving frame snapshot and Close at depth three. It verifies actual visible text has no technical ID; rendered bookmark geometry, fill, target and native selected/busy/disabled props; intermediate fade/down motion, expiry disabled Undo, replacement reset, Undo once, navigation/unmount cleanup and instant reduced motion at both sizes. Synthetic Plan B exists only in the test fixture; production catalog is unchanged.

Reproducible optional fixture setup (external test tooling, no production dependency added):

```sh
GEZEK_BROWSER_MODULES=/path/to/test/node_modules node scripts/buildDetailBrowserFixture.cjs
python3 -m http.server 8771 --bind 127.0.0.1 --directory /tmp/gezek-detail-browser
GEZEK_BROWSER_MODULES=/path/to/test/node_modules GEZEK_CHROME_PATH=/path/to/chrome node tests/detail-browser-regressions.cjs
```

External tooling supplies `react-native-web`, `react-dom`, and `playwright`; the builder uses the repository's esbuild/fonts/assets. Native services are stubbed, including storage and external links. The RN Web adapter translates native accessibilityState props (not directly supported by this RN Web version), and provides its expected global alias. Controlled clock tests wait for React effect commits before advancing animation frames. These browser results do not prove native driver timing, TalkBack or Android hardware Back.

Current screenshots/result JSON: `docs/evidence/detail-pr1-redmi-corrections/`. Earlier evidence below is historical and may still show the superseded heart/ID chip.

### Exact files changed by this correction commit

- `App.tsx`
- `assets/gezek/detail/manifest.json`
- `assets/gezek/detail/svg/save.svg`
- `assets/gezek/detail/svg/saved.svg`
- `docs/DECISIONS.md`
- `docs/DETAIL_FLOW_PR1_CONTRACT.md`
- `docs/DETAIL_FLOW_PR1_IMPLEMENTATION_REPORT.md`
- `docs/STATUS.md`
- `docs/evidence/detail-pr1-redmi-corrections/experience-default-393.png`
- `docs/evidence/detail-pr1-redmi-corrections/experience-saved-412.png`
- `docs/evidence/detail-pr1-redmi-corrections/place-default-393.png`
- `docs/evidence/detail-pr1-redmi-corrections/place-saved-412.png`
- `docs/evidence/detail-pr1-redmi-corrections/results.json`
- `scripts/buildDetailBrowserFixture.cjs`
- `scripts/checkAccessibility.ts`
- `src/components/gezek/DetailHost.tsx`
- `src/components/gezek/GezekHome.tsx`
- `src/components/gezek/UndoNoticeTransition.tsx`
- `src/components/gezek/detailAssetXml.ts`
- `src/detailFlow.ts`
- `tests/detail-browser-regressions.cjs`
- `tests/detail-flow.test.ts`

### Remaining Redmi acceptance

On the updated build: verify Da Vinci Plan has no ID chip; outlined/filled bookmarks on both Plan and Place; selected/busy/disabled TalkBack announcements and 44×44 touch behavior; hardware Back for both specified Home sequences and Saved return; distinct related Plan navigation; scroll/focus restoration and Close at depth; smooth 180 ms snackbar exit, Android reduced-motion preference, replacement dismissal, Undo before/after eight seconds, external navigation/unmount cleanup, and app-restart persistence. No physical Redmi, native TalkBack, signed-release or production verification was run in this follow-up because only still screenshots/local browser tooling were available. Figma component synchronization remains pending and outside this request.

Recommendation behavior, catalog/stable IDs/relationships, Firebase, release configuration, Event/Idea, Onboarding, Saved redesign and Ankara 101 are unchanged. PR #69 must remain Draft and unmerged. Recommended next step is updated Redmi acceptance and CI review, not merge.

## Historical 2026-10-08 Git and authorization

Initial branch `main`, clean tracked/untracked worktree. Fetched `origin/main`: `c1426357ccd4df3ad7408aede9d8b2b77e0e344d`; local main matched. Created `codex/gezek-detail-plan-place` from that ref. Open PR audit found only unrelated #57, which was untouched. The user explicitly authorized implementation, normal commit/push and a Draft PR; merge and PR 2 are excluded. Commit SHA and Draft PR URL are recorded by Git/GitHub and the delivery message, avoiding a self-referential commit hash in this report.

## Implemented contracts

See `DETAIL_FLOW_PR1_CONTRACT.md` for approved Figma IDs and behavior. The shared modal host replaces legacy `PlaceDetails`: direct exact-ID Plan/Place resolution, ordered clickable stops, nested history, one Android/visible Back transition and Close-to-origin. The mounted Home/Saved keeps filter/seed/scroll; the origin snapshot and invoking-control reference restore scroll/focus. Detail and external navigation never increment the recommendation seed. If dismissal removes the invoking card, focus falls back to the origin screen; scroll can naturally clamp when Saved content shrinks.

Atomic reducer owns saved/dismissed state. Dismiss removes saved; saving dismissed is rejected; Restore/Undo produce unsaved. Existing local v5 records normalize overlap with dismissal winning. Persistence chronology, migration precedence and remote owner-bound queue/schema remain unchanged. One eight-second notice resets on latest dismissal and clears on Undo, matching Restore, navigation, Close, rotation/filter change and unmount; expiry leaves persisted dismissal intact.

Production Hero artwork uses existing stable-ID mappings. Seven exact local Figma control SVGs retain intrinsic geometry and SHA-256 evidence. Metadata comes from the catalog, with no synthetic stop durations, distance without coordinates, live opening/crowd claims or title-search Maps. Optional external actions are conditional. Header focus, decorative artwork, selected/busy/disabled semantics, 44×44 targets, wrapping/growing content, fixed measured footer clearance and instant modal transitions are implemented.

Event/Idea navigation/details, Home design, Saved visuals, onboarding/edit, Ankara 101, Settings, recommendation engine/explanations/diversity/rotation, catalog IDs/relationships, Firebase rules/schema/sync implementation, dependency versions and release configuration were not changed. Shared exclusive state behavior applies across existing saved/dismissed IDs as approved.

## Command results

| Command | Exact result |
| --- | --- |
| `git diff --check` | Passed, exit 0 |
| `npm ci` | Passed with network access, exit 0; 1,183 packages installed; lockfile unchanged. Initial sandbox attempt failed DNS. Existing audit output: 64 vulnerabilities (24 moderate, 38 high, 2 critical); dependency remediation is outside this PR. |
| `npm run typecheck` | Passed, exit 0 |
| `npm test` | Passed, exit 0: 111 compiled domain/release tests + 80 TypeScript tests = 191 total |
| `node --import tsx --test tests/detail-flow.test.ts` | Passed, exit 0: 8 targeted tests |
| `npm run check` | Absent script; attempted command exited 1 with Missing script, not reported as passed |
| `npm run check:accessibility` | Passed, exit 0; source gate includes DetailHost controls/semantics/clearance |
| `npm run check:performance` | Passed, exit 0; 5,000 iterations, p95 7.737 ms < 25 ms budget, checksum 23,624. Local JS benchmark, not native timing. |
| `CI=1 npx expo export --platform android --output-dir /tmp/gezek-detail-pr1-android-export` | Passed, exit 0; Android Hermes bundle exported |
| `npm run test:stress` | Passed, exit 0; 2,560 recommendation scenarios and 192 Experience scenarios, zero listed mismatch/duplicate/diversity/rotation issues |
| `npm run test:catalog` | Passed, exit 0; 1 city / 178 Places / 52 Experiences / 14 Events / 140 Ideas / 12 guides |
| `npm run check:build -- --profile=preview` | Passed, exit 0; local preview preflight |
| `npm run check:observability` | Passed, exit 0; development/disabled configuration |
| `npm run check:recommendations` | Passed, exit 0; 15 deterministic scenarios, zero objective invariant failures |
| `npm run check:release` | Passed, exit 0; existing eight-blocker baseline preserved; not release approval |
| `npm run check:events` | Existing baseline failure, exit 1: 2 upcoming, 12 expired, all 14 stale verification; `stale_verification, insufficient_upcoming_events`. Verified identical output against a temporary archive of fetched origin/main. Catalog unchanged. |

Targeted tests cover Home/Saved snapshots, Back/root Close, exact ID resolution with colliding titles, ordered stops, unavailable IDs, atomic exclusivity, local save/reload and remote queue replay, v5 normalization, reset/stale-expiry/once-only undo/cleanup, conditional Maps/source, ID artwork, focus/accessibility wiring and exact local control-asset geometry/checksums.

## Browser evidence

Actual React Native components rendered through temporary RN Web tooling with bundled fonts/assets. Backend/storage/location/Linking/status-bar/safe-area services were stubbed. No production services or native device were used. Large text uses a Text/fontScale shim at 1.8; this is a simulation, not Android OS font-setting evidence.

`node /tmp/gezek-detail-pr1-browser-test.cjs`: 38 checks, zero page errors. Both 393×852 and 412×915: Plan/Place default, saved, loading, unavailable, dismissed, no-external, long-scroll and related-empty fixtures; no horizontal overflow, visible 44×44 controls and nonempty SVG geometry. Long content scrolls clear of the fixed footer. Simulated large text wraps and stacks footer actions. Actual App exercises Plan→Place→Back, restoring the invoking stop and parent scroll; Maps and external-return callback preserve detail; Close restores Home scroll. Escape drives Modal onRequestClose nested/root transitions, testing the same callback used by Android Back without claiming an Android hardware test.

`node /tmp/gezek-detail-pr1-state-test.cjs`: seven actual-App checks, zero page errors: save/dismiss atomic persisted snapshot; undo to unsaved; Restore consumes notice; a real 8.1-second browser wait verifies expiry without restoring dismissal; Saved origin nested Close; dismissed Saved entry removed; Close clears snackbar. Timer reset and stale callbacks use deterministic injected-clock tests.

Portable result JSON and selected rendered screenshots are in `docs/evidence/detail-pr1/`. Temporary harness services are intentionally not production evidence. Figma sample Kakule Kahve is absent from current catalog; Place fixture uses real CerModern and its mapped Hero. Sample Plan duration differs from catalog; runtime shows catalog duration 75–105 minutes. No catalog facts were replaced with mockup copy.

## Remaining acceptance / risk

No implementation blocker remains. The pre-existing Event catalog health failure and eight release blockers remain open. `npm run check` is absent. Firebase Rules emulator/live Firebase verification was not run: rules, config and backend implementation did not change; existing connected-service tests and targeted queue replay cover the preserved contract. No device, OS process-restart, TalkBack or signed-release acceptance was performed.

Keep the PR Draft for Redmi checks: Home and Saved origin return/filter/seed/scroll; Plan→Place→Back; Android hardware Back and Close; Maps/browser return; native safe areas/status bar; save/dismiss/Restore/Undo, consecutive timer reset and expiry; persisted state across process restart; long Turkish titles, OS large fonts, long scroll and measured footer clearance; loading/unavailable/no-source/no-mapping states; TalkBack focus entry/stop/card/control restoration, selected/busy/disabled semantics and decorative artwork exclusion. Existing native Home filter pause is not fixed or measured by this PR.

Next step: review Draft PR CI and perform Redmi/TalkBack acceptance. Do not merge or start Event/Idea PR 2 under this authorization.

## Exact changed files

- `App.tsx`
- `assets/gezek/detail/manifest.json`
- `assets/gezek/detail/svg/back.svg`
- `assets/gezek/detail/svg/close.svg`
- `assets/gezek/detail/svg/dismiss.svg`
- `assets/gezek/detail/svg/maps.svg`
- `assets/gezek/detail/svg/save.svg`
- `assets/gezek/detail/svg/saved.svg`
- `assets/gezek/detail/svg/source.svg`
- `docs/DECISIONS.md`
- `docs/DESIGN_SPEC.md`
- `docs/DETAIL_FLOW_PR1_CONTRACT.md`
- `docs/DETAIL_FLOW_PR1_IMPLEMENTATION_REPORT.md`
- `docs/START_HERE.md`
- `docs/STATUS.md`
- `docs/evidence/detail-pr1/experience-default-393.png`
- `docs/evidence/detail-pr1/experience-default-412.png`
- `docs/evidence/detail-pr1/experience-dismissed-393.png`
- `docs/evidence/detail-pr1/experience-dismissed-412.png`
- `docs/evidence/detail-pr1/large-text-393.png`
- `docs/evidence/detail-pr1/large-text-412.png`
- `docs/evidence/detail-pr1/place-default-393.png`
- `docs/evidence/detail-pr1/place-default-412.png`
- `docs/evidence/detail-pr1/results.json`
- `package.json`
- `scripts/checkAccessibility.ts`
- `src/components/PlaceDetails.tsx`
- `src/components/gezek/DetailHost.tsx`
- `src/components/gezek/GezekHome.tsx`
- `src/components/gezek/detailAssetXml.ts`
- `src/components/gezek/detailFocus.ts`
- `src/contentInteractions.ts`
- `src/detailFlow.ts`
- `src/persistence.ts`
- `tests/detail-flow.test.ts`
