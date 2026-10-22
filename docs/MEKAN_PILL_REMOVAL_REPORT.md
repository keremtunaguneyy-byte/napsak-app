# Narrow Mekân Home category-pill removal — 22 October 2026

## 23 October — Redmi acceptance and authorized PR #82 closeout

The user reports all nine focused Redmi checks passed on exact implementation head `01b724876c85245d585c3b6d358656cbf748d8bc`, based on `4fd7fd672e63884a1d13b5d7cfa81867141d3606`:

1. Decorative Kahve and Sanat pills are absent.
2. The unnecessary space is gone and the main card position is correct.
3. Yakına öncelik ver remains correctly positioned and works.
4. Nearby activation changes the cards correctly.
5. Başka mekânlar göster works.
6. Save, dismiss and Undo work.
7. Place Detail → Android Back preserves the card batch and scroll position.
8. Large system text creates no overlap.
9. Fixed bottom navigation does not cover the final content.

These are user-reported physical Redmi observations, separate from the browser evidence below. Real TalkBack remains deferred to the consolidated accessibility acceptance pass and is not a blocker for this narrow visual correction. Signed-release acceptance remains unverified; this acceptance is not signed-release evidence.

This instruction supersedes the earlier Draft/no-merge and pending-Redmi notes below for PR #82 only. The user authorizes one documentation-only commit and normal push, successful required CI on that exact new head, a final review/thread/mergeability audit, ready status and a normal protected merge commit, followed by safe canonical-main fast-forward and SHA equality verification. Merge completion and final main identity must be verified live; this document does not pre-claim them. No product/test code or additional implementation is authorized. Home background polish and Settings/Hidden PR 2 remain unstarted. The unchanged main-baseline `check:events` failure is still `stale_verification`; no Event data is changed.

## Scope and repository audit

Repository: `keremtunaguneyy-byte/napsak-app`. Canonical checkout: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`. Implementation worktree: `/Users/kerem/.codex/worktrees/ba3b/napsak-app`, initially clean and detached. Initial HEAD, local `main`, and fetched `origin/main` all equal `4fd7fd672e63884a1d13b5d7cfa81867141d3606` (PR #81 merge). Existing worktrees were inspected; GitHub returned no open PRs. The fresh `codex/gezek-mekan-pill-removal` branch was created from fetched `origin/main` in this clean worktree; the interrupted work continued on that same branch without resetting, recreating or overwriting its partial edit.

The original implementation request authorized PR 1 only. The complete 1,042-line attached closure was read as design/reference material; its Settings/Hidden implementation instructions were not executed. The continuation request preserved that boundary. Its original Draft/no-merge restriction is historical and superseded only by the 23 October closeout authorization above. Final commit/PR/exact-head CI identities are reported from live Git/GitHub at delivery instead of embedding a self-referential commit SHA.

## Design authority and exact edit

File [`yTdAWr92ETyurlQQHNNqpi`](https://www.figma.com/design/yTdAWr92ETyurlQQHNNqpi/Gezek?node-id=1419-15195), closure `1419:15195`, ledger `1453:22737`. Corrected masters: Default `1426:15361`, Nearby `1426:15584`, LargeDefault `1426:15807`, LargeNearby `1426:16030`. Responsive references: `1435:19346`, `1435:19806`, `1435:20263`, `1435:20724`, `1435:21187`, `1435:21643`, `1435:22096`, `1435:22558`. Historical proximity section `1390:2834` is preserved behavioral history, not this correction's visual source.

Live design context/screenshot verified Default. A read-only Figma comparison against the four preserved source masters checked all twenty card subtrees: content, descendant geometry, paints, typography and artwork match (numeric tolerance 0.001px for serialization precision). Each card's outer y moves −26px. Corrected masters have zero `Filter Chip` nodes. No Figma write or asset generation occurred.

Runtime edit is confined to `src/components/gezek/GezekHome.tsx`:

- Delete the `s.contextChips` wrapper containing the exact `Kahve` and `Sanat` Text nodes; delete `contextChips` and `contextChip` styles.
- Move the existing `BUGÜNÜN MEKÂNI` header into that row's left slot; retain its font, color, line height and tracking. Use the approved 128px left slot with stretch alignment.
- Remove the now-obsolete standalone heading position and its bottom margin. Its former 14px line plus 12px margin accounts for exactly 26px.
- Removed category callbacks/selected state: **none existed**. Both pills were hidden decorative Text, never functional filters. No invisible controls or replacement category state/handlers were retained or added.

No new design-system component or App/router wiring was needed. MainCard, Alternative, QuickActions, ProximityControl, content selector, background, safe-area/status-bar handling and fixed navigation are unchanged. Existing card category metadata and preference-summary interests remain; their words are not category controls.

## Geometry and browser evidence

The existing `scripts/buildDetailBrowserFixture.cjs` with `GEZEK_SNAPSHOT_FIXTURE=true` and `GEZEK_PROXIMITY_FIXTURE=true` builds the actual App, hooks, engine and components with controlled native-service adapters. A baseline bundle was built before editing. The new focused suite compares that baseline with the final bundle, using identical preferences/catalog and controlled synthetic location input. It stores no coordinate or lease provenance payload in evidence.

| Configuration | Main before → after | Proximity x/y | Proximity size |
| --- | --- | --- | --- |
| 393×852 normal | 400 → 374 | 184 / 318 | 189×44 |
| 412×915 normal | 400 → 374 | 193.5 / 318 | 189×44 |
| 393×852 approved large-control proof | 420 → 394 | 184 / 318 | 189×64 |
| 412×915 approved large-control proof | 420 → 394 | 193.5 / 318 | 189×64 |

All four states (off, acquiring, active, fallback) pass at both widths, in normal, approved control-only 150% examples, and supplemental full-Home 180% browser text. Full-Home text naturally grows the intro/summary/row: its main y is 582.78125 instead of the static proof's 394. Its pre-change main y was 628.390625, including the old scaled decorative row and heading; this is not a claim that Android OS fontScale has been accepted or that whole-Home scaling uses fixed Figma y coordinates.

Thirty browser checks pass, including 120 baseline/final card-tree comparisons (five cards × four states × six configurations). Text, artwork SVG attributes, actions, dimensions and internal presentation match; only floating-point SVG transform coordinates allow ≤0.01px tolerance. Normal and approved large-control proof cards all move exactly −26px, and the control/nav rectangles match baseline. Runtime IDs/order/scores/seed/history match baseline in every state. Pending never recomputes merely because the pills disappeared. Save/unsave preserves batch/order/computation count; dismiss/Undo, filter switching, active-filter refresh, Detail→Back scroll restoration and reachable actions above fixed navigation pass. The existing lease browser suite separately passes 21 checks covering strict 60-second boundaries, A/B2 reuse, pending filter changes, invalidation, explicit refresh, cancellation, stale callbacks, unmount and restart.

Only these four canonical screenshots were generated, visually inspected and retained; passing captures were not regenerated:

- [393 normal/off](evidence/mekan-pill-removal/393-normal-off.png)
- [393 normal/selected](evidence/mekan-pill-removal/393-normal-active.png)
- [412 normal/off](evidence/mekan-pill-removal/412-normal-off.png)
- [393 approved large-control example](evidence/mekan-pill-removal/393-large-off.png)

Machine-readable evidence: [results.json](evidence/mekan-pill-removal/results.json), [lease-results.json](evidence/mekan-pill-removal/lease-results.json). Raw fixture bundles: `/private/tmp/gezek-mekan-before` and `/private/tmp/gezek-mekan-after`; browser output: `/private/tmp/gezek-mekan-evidence`. No contact sheet or Base64 QA artifact was created. Browser bundle internals are temporary standard fixture outputs, not committed QA artifacts.

## Validation

All requested npm scripts exist. Commands and final outcomes:

| Command | Result |
| --- | --- |
| `git diff --check` | Pass |
| `git diff --cached --check` | Pass; rechecked after staging |
| `npm ci` | Pass with network-enabled retry; initial sandbox DNS failure. Existing audit reports 61 dependency vulnerabilities; no dependency/lockfile edits |
| `npm run typecheck` | Pass |
| `npm test` | Pass: 111 compiled-domain/release tests + 252 TypeScript tests = 363 total, 0 failures |
| `npm run test:catalog` | Pass: 178 Places, 52 Experiences, 9 Events, 140 Ideas, 12 Guides |
| `npm run check:events` | Fails `stale_verification` identically on current main: 9 total, 7 upcoming, 2 expired, 9 stale verification records. No Event changes |
| `npm run check:accessibility` | Pass: 13 source files, 16 minimum-target styles |
| `npm run test:stress` | Pass: 640 scenarios, 480 rotation checks; 0 empty/interest/duration/duplicate failures, 0 overlap |
| `npm run check:performance` | Pass: 5,000 calls, p95 7.641ms against 25ms budget, checksum 22308 |
| `npm run check:recommendations` | Pass: 15 scenarios, 0 objective invariant failures, 0 deterministic replay failures |
| `npm run check:assets` | Pass: 125 families, 375 responsive variants, 46 contextual icons, 11 UI exports |
| `CI=1 npx expo export --platform android --output-dir /private/tmp/gezek-mekan-pill-removal-android` | Pass: Android Hermes bundle and metadata exported |
| `GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-mekan-after GEZEK_PROXIMITY_FIXTURE=true GEZEK_SNAPSHOT_FIXTURE=true node scripts/buildDetailBrowserFixture.cjs` | Pass; same fixture command built baseline before editing |
| `GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules GEZEK_BROWSER_URL=http://127.0.0.1:8824/after GEZEK_BROWSER_BASELINE_URL=http://127.0.0.1:8824/before GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-mekan-evidence node tests/mekan-home-browser.cjs` | Pass: 30 checks, 120 card comparisons, 4 screenshots, 0 page errors |
| `GEZEK_BROWSER_MODULES=/private/tmp/gezek-proximity-web-deps/node_modules GEZEK_BROWSER_URL=http://127.0.0.1:8824/after GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-mekan-lease node tests/proximity-lease-browser.cjs` | Pass: 21 checks, 0 errors, no screenshots |

Full command logs use `/private/tmp/gezek-mekan-*.log`. The focused source regression is included in `npm test`; it guards absence of decorative nodes/styles and replacement category handlers/state, with the unchanged proximity callback as the row's only action.

Tool limitations: two sandbox HTTP-server attempts failed with the same local bind permission error and were stopped. The interrupted custom Chrome/file diagnostic was rejected by automatic review because its usage limit prevented review completion; it was not executed, repeated or bypassed. After the continuation instruction, the documented existing fixture workflow ran with normal tool approval over localhost HTTP. Initial browser regression issues were test synchronization (32ms RN Web scroll publication) and subpixel SVG serialization; those were repaired in the test only. No runtime behavior was broadened to accommodate a fixture.

## Preserved boundaries and remaining acceptance

PR 2 was not started. No Settings/Hidden/Saved/Details/onboarding/editor implementation, recommendation eligibility/scoring/diversity/rotation, A/B2 math, catalog taxonomy/data/IDs/relationships, location acquisition/60-second lease, snapshot/history/seed, Firebase, persistence/schema, artwork mappings, dependencies or release configuration changed. New code files outside the single Home component are tests only.

The canonical checkout's unrelated `src/firebase/BA_4bit.sv/` remains untracked and untouched. Before/after SHA-256 match: `rtl/BA_4bit.sv` = `ab476087e42d5b8d3bc792264c5225c8e5002dcded51eb40bb26aa4e2608e6ff`; `rtl/tbBA_4bit.sv` = `b8e18e9ef4280fe1411cba06fcdfd647cdd739d6e1a990d52710c6799d48b6c7`.

## Exact changed-file inventory

- `src/components/gezek/GezekHome.tsx`
- `tests/gezek-home-presentation.test.ts`
- `tests/mekan-home-browser.cjs`
- `docs/PRODUCTION_HOME_DESIGN_CONTRACT.md`
- `docs/STATUS.md`
- `docs/MEKAN_PILL_REMOVAL_REPORT.md`
- `docs/evidence/mekan-pill-removal/393-normal-off.png`
- `docs/evidence/mekan-pill-removal/393-normal-active.png`
- `docs/evidence/mekan-pill-removal/412-normal-off.png`
- `docs/evidence/mekan-pill-removal/393-large-off.png`
- `docs/evidence/mekan-pill-removal/results.json`
- `docs/evidence/mekan-pill-removal/lease-results.json`

The historical pending-Redmi checklist is superseded by the nine user-reported accepted checks above. Do not infer additional device coverage beyond those observations. Real TalkBack remains deferred to the consolidated accessibility acceptance pass; signed-release acceptance remains separate and unverified. Existing reduced-motion acceptance limits are not changed. No new device/browser evidence was generated during this documentation-only closeout. Event freshness remains an unchanged baseline issue. Proceed only through the authorized protected workflow above; Home background polish and Settings/Hidden implementation are outside this closeout.
