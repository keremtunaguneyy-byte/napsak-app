# Gezek Detail Flow PR 1 — implementation and acceptance evidence

Date: 2026-10-08. Repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`.

## Git and authorization

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
