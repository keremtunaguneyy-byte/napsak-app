# Proximity control UI and session state — 21 October 2026

## Authority and Git audit

User-approved scope: the complete `Gezek_Proximity_UI_State_Implementation_Handoff_2026-10-21.md`, read before edits, plus live Figma below. No Figma writes. Repository: `https://github.com/keremtunaguneyy-byte/napsak-app`.

- Provided checkout: `/Users/kerem/.codex/worktrees/9d7f/napsak-app`, initially clean, detached HEAD `a4f5326fac4bf619ed6662cfa3f12a66d30bcf24`.
- Primary checkout: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`, branch `main`; only the two protected untracked Verilog files were present.
- Fetch verified `origin/main` at `a4f5326fac4bf619ed6662cfa3f12a66d30bcf24`, normal PR #80 merge, parents `6244fa49b35669a04e5e5578f8b8a3dd0ec5eb41` and `41d318675104930143565412d5b89857bd400277`.
- Live GitHub: PR #80 MERGED; merge timestamp `2026-10-21T19:00:28Z`. Both merge-head checks completed SUCCESS: [app-quality](https://github.com/keremtunaguneyy-byte/napsak-app/actions/runs/39657814979/job/119422633388), [firestore-rules](https://github.com/keremtunaguneyy-byte/napsak-app/actions/runs/39657814958/job/119422632956).
- New worktree: `/private/tmp/gezek-proximity-control-ui-state`; new branch `codex/gezek-proximity-control-ui-state`, created directly from fetched main. Final commit/PR/check identity is reported from live GitHub at delivery, rather than embedding a self-referential SHA here.
- Protected directory `src/firebase/BA_4bit.sv/` remains in the primary checkout, untracked and untouched. SHA-256: `rtl/BA_4bit.sv` = `ab476087e42d5b8d3bc792264c5225c8e5002dcded51eb40bb26aa4e2608e6ff`; `rtl/tbBA_4bit.sv` = `b8e18e9ef4280fe1411cba06fcdfd647cdd739d6e1a990d52710c6799d48b6c7`.

## Implemented contract

RAM-only owner: `off → acquiring → active`. Repeated activation is a synchronous no-op outside off. Activation checks services, uses the existing foreground-permission/current-position APIs with Balanced accuracy and requires a fresh finite coordinate. A 20-second one-shot acquisition deadline returns off with acquisition-failure feedback; this is a bounded request, never a polling loop. Existing two-second recommendation-location preflight remains authoritative for newly computed batches.

Permission denial, disabled services and acquisition failure return off without clearing A cards. Active invalidation returns off and restores A. One successful fix object is shared between Gezek and Mekân for the active session. Returning to either filter, Home/Detail boundaries and existing Android foreground/focus infrastructure validate services/permission without another GPS acquisition. Event/Fikir suspend the session and never expose the control. Reactivation always reacquires.

The owner rejects stale results after off/cancel, navigation away, preferences opening/Save/reset, background during pending, invalidation, explicit location update and unmount. An explicit location update supersedes pending/active proximity ownership; its late predecessor cannot publish. The state is never included in preferences, AsyncStorage or Firebase.

| Action | Snapshot / seed result |
|---|---|
| Initial A | Existing default engine path and four-filter ownership |
| First B2 visit | Existing engine `proximityPolicy: 'nearby'`, current independent mode seed/history, valid activation provenance |
| Warm filter/mode return | Exact snapshot object/order restored, no computation or GPS |
| Toggle | No run increment; valid A restored, otherwise safe locationless A |
| Reactivation | New fresh fix; old-fix B2 cache and presentation fallback cannot be reused; mode history retained |
| Explicit refresh | Only the active filter/mode run increments and captures previous IDs |
| Save/unsave | Snapshot IDs/order/history unchanged |
| Dismiss/Undo | Shared dismissed set and semantic dismissal keys reconcile both modes; hidden IDs are filtered immediately, Undo remains unsaved |
| Preference Cancel | No invalidation |
| Preference Save | Both mode revisions invalidated; active regenerates, others lazily; no seed increment |
| Catalog/eligibility/Event retry | Existing surface-specific keys/rules preserved |
| Location presentation update | No visible-card rotation |
| Invalid session | B2 off; valid A or locationless A; unrelated runs unchanged |

Cache ownership is four A slots plus `experience:nearby` and `place:nearby`. Nearby keys and fallback reads require identity with the current activation fix. Detail receives no Home proximity policy and uses the existing A seed, even after a B2 refresh. Mode changes cancel pending refresh-scroll intent and introduce no card animation or scroll reset.

## Live Figma mapping and visual review

File [`yTdAWr92ETyurlQQHNNqpi`](https://www.figma.com/design/yTdAWr92ETyurlQQHNNqpi?node-id=1390-2834). Read with the Figma design-to-code workflow and read-only node inspection:

- Approved section `1390:2834`; control set `1390:2862`; feedback set `1390:2958`; behavior/accessibility ledger `1400:15195`.
- All control variants `1390:2846`–`1390:2861`: off, pressed, pending, selected/pressed, permission/services/acquisition failures, invalidation, restored default, disabled pending, large text and Reduced Motion.
- 393×852: off `1394:4398`, pending `1394:4650`, selected `1394:4907`, fallback `1394:5163`, Mekân selected `1394:5421`.
- 412×915: off `1394:5664`, selected `1394:5924`, Mekân selected `1394:6188`.

Normal control matches x184/y318 at 393 and x193.5/y318 at 412, 189×44. Large-control proof is 189×64 with 18/24 text at 150%; content grows naturally beyond that. Existing navy/canvas/mint/lavender tokens, Plus Jakarta Sans, 18px selection marker and unchanged 12px approved onboarding check are reused. Selected border 1.5px, default 1px; 12px horizontal padding and 8px marker gap. Gezek card begins at y374; Mekân at y400. Approved Mekân context row retains Kahve/Sanat presentation and has no `Yakınımda` chip. The repository baseline did not actually render that old chip; no duplicate-control removal or new category filtering was invented.

Feedback uses the approved navy/white pattern, 16px radius, 14/20 text (21/28 at 150%), minimum 56px, grows for long copy and large text, and ends 12px above existing fixed navigation. It expires after eight seconds or navigation/replacement; expiry does not change recommendations or mode.

Canonical PNGs and JSON results: [evidence/proximity-ui-state](evidence/proximity-ui-state/). Full live Figma reference PNGs remain in `/private/tmp/gezek-proximity-figma`; all browser captures remain in `/private/tmp/gezek-proximity-browser`. The eight matching responsive states, large-control proofs, full text scaling and Reduced Motion were inspected visually. Dynamic recommendation IDs/artwork/order/distances come from the real catalog/engine; Figma permutations are illustrative. No artwork was generated or remapped. The approved existing check is reused from `assets/gezek/onboarding/6057a.svg` (12×12) through its immutable local registry.

Existing production Home background/cards and bottom-nav/safe-area implementation remain. At 412 the production nav still spans the viewport, whereas Figma centers a 393px nav: this pre-existing discrepancy was deliberately retained under the explicit instruction to preserve production navigation. Browser visual comparison removes the synthetic top inset; the standard regression fixture retains 24px. Native safe-area acceptance is pending. Full-Home font scaling grows existing content; the separate isolated proofs keep existing typography unchanged as in Figma's control-only simulation.

## Accessibility and exact copy

Role checkbox, stable accessible label `Yakına öncelik ver`; checked/selected when active; busy/disabled while acquiring, with pending status in the hint. Visible pending text is `Konum güncelleniyor`. Hint: `Uygun öneriler arasında yakındaki seçeneklere daha fazla öncelik ver.`

Failure strings are exact: `Yakın öneriler için konum izni gerekli.`, `Yakın öneriler için telefonunun konumunu aç.`, `Konum alınamadı. Sana göre önerilerin korunuyor.`, `Konum kullanılamadığı için Sana göre önerilerine döndük.` Each failure/invalidation is announced once; feedback never takes focus. Success/off/failure request focus on the same control without scrolling. Decorative marker/backgrounds are excluded; redundant Gezek section heading is excluded before the control. Targets are at least 44px. No state transition introduces decorative motion, so Reduced Motion changes cannot leave an animation pending.

The browser SVG bridge maps native `accessible=false` to `aria-hidden` instead of forwarding an invalid boolean DOM attribute; console errors are checked, not suppressed. Browser ARIA/focus adapters and simulated scaling are diagnostic evidence, not native TalkBack, OS font scaling, GPS, permission-sheet or signed-release proof.

## Validation

See [verification-results.json](evidence/proximity-ui-state/verification-results.json) for exact commands, exit codes and local log paths. `npm run check` does not exist. Initial sandbox-restricted dependency installation failed DNS resolution; authorized network retry of `npm ci` succeeded with the unchanged lockfile. Browser dependencies were installed separately in `/private/tmp/gezek-proximity-web-deps`, without repository dependency changes.

- `git diff --check`, `git diff --cached --check`: PASS.
- `npm ci`: PASS.
- `npm run typecheck`: PASS, including a final invocation after integration corrections.
- `npm test`: PASS, **344** = 111 compiled domain/release + 233 TypeScript tests, including 14 new proximity tests. The final full rerun also passed 344/344.
- `node --import tsx --test tests/proximity-session.test.ts`: PASS, **14/14** separate invocation.
- `node --import tsx --test tests/proximity-session.test.ts tests/home-filter-snapshots.test.ts tests/experience-distance.test.ts`: PASS, **49/49** final focused invocation.
- `npm run test:catalog`, `npm run check:accessibility`, `npm run test:stress`, `npm run check:performance`, `npm run check:recommendations`, `npm run check:assets`: PASS.
- Additional `npm run check:build -- --profile=preview`, `npm run check:observability`, `npm run check:release`: PASS. Release readiness remains a blocker-baseline check, not release acceptance.
- `CI=1 npx expo export --platform android --output-dir /private/tmp/gezek-proximity-android-export`: PASS; final export path `/private/tmp/gezek-proximity-final-android-export`.
- `npm run check:events`: known baseline FAIL, identical to an untouched archive of fetched main using the same installed dependencies: 9 total, 7 upcoming, 2 expired, horizon 19.9 days, 9 stale verifications; sole issue `stale_verification`. Exact outputs retained as `event-main-baseline.txt` and `event-branch.txt`. No Event edits.
- Browser `tests/proximity-browser.cjs`: PASS **72** checks, two viewports × normal/150% text, zero page errors; ARIA/focus, snapshots/history, fresh/reused acquisition, failures, motion, scroll and clearance. `tests/proximity-browser-edges.cjs`: PASS **14** checks, zero errors, including held-preflight provenance, preferences, related-A seed/policy, lifecycle/unmount/update races and isolated large-control proofs.
- Existing browser regressions: Home snapshots **52**, location preflight **80**, distance **56**, Preference/Event **38**, all PASS, zero page errors. The first preflight run exposed a default-path compatibility issue; corrected and rerun successfully without weakening assertions.

Rules-specific local emulator tests were not run because Firebase/Rules are unchanged; exact-head GitHub Firestore Rules is checked at delivery. Physical Redmi/TalkBack/OS-large-text/Reduced Motion/signed-release acceptance has not been performed. No production operation.

## Scope and delivery

Exact inventory: [PROXIMITY_UI_STATE_CHANGED_FILES.txt](PROXIMITY_UI_STATE_CHANGED_FILES.txt). Engine math, eligibility, catalog/stable IDs, Firebase and persistence schemas, Event/Idea behavior, Detail policy, onboarding/Preference Editor UI, Saved/Ankara 101, artwork mappings and release configuration are unchanged. App-level Preference Save only extends its existing invalidation to both Home modes. Package change only includes the focused tests in normal CI.

Normal commit/push and one Draft PR to main are explicitly authorized. The PR must remain Draft, open and unmerged; do not merge. Exact pushed-head CI is checked independently of PR #80's merge checks. Recommended next action: review this Draft and perform the complete Redmi checklist on its exact final SHA before any later merge authorization.

## Pending Redmi acceptance — every item remains unchecked

1. Gezek off → activate: pending appears, one location flow occurs, then nearby cards appear.
2. Toggle off: original A cards/order return without seed rotation or scroll jump.
3. Re-enable: a new explicit acquisition occurs.
4. While active, switch Gezek ↔ Mekân repeatedly: no repeated permission/GPS prompt; snapshots restore quickly.
5. Event and Fikir never show the control.
6. `Başka planlar göster` rotates only the active filter/mode.
7. Save/unsave preserves cards; dismiss/Undo never leaks the item through the other mode.
8. Deny permission, disable services, force acquisition failure: approved feedback appears and A cards remain.
9. Revoke permission/disable services while active, then foreground/revisit: B2 switches off and A returns.
10. Navigate to details and back: mode, snapshot and scroll restore correctly; related details remain default A.
11. Rapid taps, hardware Back and app background/foreground produce no stale overwrite or stuck pending state.
12. Real OS large text, TalkBack and Reduced Motion.
13. Android status/navigation safe areas and feedback clearance.
14. Restart app: proximity mode is off because it is session-only; ordinary preferences/saves remain persisted.
