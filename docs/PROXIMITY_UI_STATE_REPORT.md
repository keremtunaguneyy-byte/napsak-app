# Proximity control UI and session state — 21 October 2026

## 22 October final acceptance and authorized protected merge

The user accepts implementation head `e36d1aeee1758ab6517c141cc5a14b3c11c916ed`, based on PR #80 merge `a4f5326fac4bf619ed6662cfa3f12a66d30bcf24`, and explicitly authorizes final documentation reconciliation and a normal protected merge of existing PR #81. This supersedes the earlier Draft/no-merge instructions and pending correction-retest/Figma notes below. No product code changes are part of this closeout. Merge completion, final exact-head checks and canonical-main equality must be verified live; this document does not pre-claim them.

The user reports the final Figma contract synchronized in file [`yTdAWr92ETyurlQQHNNqpi`](https://www.figma.com/design/yTdAWr92ETyurlQQHNNqpi?node-id=1390-2834), approved section `1390:2834`, behavior/accessibility ledger `1400:15195`. Annotation nodes `1400:15204`, `1400:15207`, `1400:15210`, `1400:15225`, `1400:15228` and `1390:2960`, plus component descriptions, now record the strict 60-second process-memory lease, fresh permission/service validation, forced explicit refresh, no polling, pending-filter survival, Home-departure cancellation and safe default restoration. The user confirms unchanged fingerprints for all 58 visual roots, 44 state/screen frames and 15 protected sections, with unchanged prototype connections/timings. This is user-provided synchronization evidence; the closing agent made no Figma edits or new independent fingerprint claim. There is no remaining Figma blocker.

Final user-reported Redmi acceptance and the separate deferred work are recorded at the end of this report. In particular, opening Ankara 101 during pending leaves Home, cancels acquisition and returns to default/off; this is accepted intended behavior. Real TalkBack and signed-release acceptance remain deferred release checks.

## 22 October amendment — historical implementation record

Continued the existing clean worktree/branch at `1143e7ed9fca1923c9c44fe53d2e30f6c0113561`; fetched main is still `a4f5326fac4bf619ed6662cfa3f12a66d30bcf24`. Both GitHub App Quality and Security Rules passed on that previous head. No new branch/worktree/PR; no merge. The user reports Redmi checks 1–12 passed on that implementation and explicitly confirms restart behavior. The two correction retests were pending at that checkpoint and are now accepted in the final record above.

The user now approves a **strict 60-second device-memory reuse lease** in place of fresh GPS on every activation. At that checkpoint, Figma ledger `1400:15195` still specified fresh acquisition on every activation and was not yet synchronized. The final user-confirmed synchronization above supersedes that mismatch. Visuals/copy/control dimensions remain unchanged; no Figma operation was performed.

### Lease lifecycle and personal-data boundary

`NEARBY_LOCATION_REUSE_MS = 60_000` is the single named policy constant. This is personal-data processing: the purpose-limited reusable location provenance stays in device process memory only, is never persisted or transmitted, and has a maximum 60-second reuse lifetime in the running process. Only finite latitude/longitude and the monotonic accepted timestamp are retained privately by the session owner; generation guards protect acceptance. The timestamp is absent from React state and every persistence/analytics/error/evidence path. No broader KVKK or compliance-document change is made.

The lease starts only after a finite fresh fix and final permission/service checks are accepted. Off retains the lease without renewing it. On reads services and existing foreground permission freshly, then rechecks finite coordinates, object identity and `0 <= age < 60_000` after those asynchronous reads. A valid lease restores the same-provenance B2 snapshot, or computes a missing one without incrementing its seed. At 60,000ms and later, a negative/nonfinite age, invalid coordinate or an invalidated candidate is discarded and activation uses the existing fresh acquisition path. Permission/services failure cannot leave B2 selected. Expiry is lazy on every lease read; there is no deletion timer, polling, background tracking or silent refresh. The lease limits off/on reuse; an already active Home session continues its existing foreground-validity contract rather than starting periodic GPS requests.

Explicit “Konumu güncelle” clears/bypasses the lease, always requests GPS and renews provenance only after its existing request-generation guard accepts a finite success. An activation supersedes any older explicit request. Failure, explicit invalidation, reset/data deletion and disposal clear reusable provenance. Restart creates an empty owner. Old permission/GPS/final-status callbacks cannot renew a newer or cancelled lease. No coordinates or accepted timestamps are written into correction evidence; browser location APIs are synthetic controlled fixtures, and the new lease evidence records assertion names/counts only.

### Pending-filter loss and ownership correction

The proximity owner was already App/session-scoped. The concrete indirect cancellation path was `cold filter A preflight → recommendationLocation invalidation → invalidateLocation → proximitySession.invalidate()`. While a fresh permission/GPS request was pending, a different filter could reject the older default-A cache; that global callback also cancelled the new acquisition. There was no direct control-instance unmount required. The regression reproduces that stale-cache/permission timing; the original Redmi OS timing was not instrumented, so no additional device trace is claimed.

The shared invalidation callback now clears the lease and old location cache, disables active B2, but preserves a newer pending explicit acquisition. Its own fresh GPS result is accepted only after final current permission/service checks. Explicit cancellation, complete Home departure, background/unmount, reset and newer actions retain generation protection. Feedback navigation is separated from ownership: `resultFilter` clears feedback, not the Home-session request. Gezek ↔ Mekân shows the same pending/busy state. Event/Fikir hide the control but keep that one request; success establishes the session and the current/returning supported filter computes/restores its own B2 snapshot. Seeds and unrelated filters are not rotated.

### Correction verification

Current correction commands/results are in `docs/evidence/proximity-ui-state/correction-verification.json`; focused browser results are `lease-results.json`, `results.json` and `edge-results.json`. The prior 21 October verification below is historical. Dependency declarations and lockfile are unchanged from `1143e7e`; the existing installation has a valid hidden lock and `npm ls --depth=0` succeeds, so `npm ci` was not repeated locally. CI installs the unchanged lockfile afresh.

Full final `npm test`: **362/362** (111 compiled domain/release + 251 TypeScript tests). Final focused tests: **67/67**, including **32 proximity tests** (18 added in this correction). Browser matrix **72/72**, async edge suite **14/14**, new lease/filter suite **21/21**, zero page/console errors. Existing Home/location/distance/Preference regressions: **52/80/56/38**, zero page errors. TypeScript, accessibility, performance, recommendation quality, asset checks and Android export pass. `check:events` still fails identically to main: 9 total, 7 upcoming, 2 expired, 19.61-day horizon, all 9 verification dates stale; sole issue `stale_verification`. No Event edits. Eleven of twelve canonical PNGs are byte-identical; only the Reduced Motion scene changes its synthetic recommendation because reuse correctly retains that fix rather than reacquiring. Control dimensions remain 189×44 / 189×64.

The focused unit/state/location tests cover all four boundary ages, invalid coordinates/statuses, no renewal on comparison, forced explicit refresh, restart, clock invalidity, held lease validation, stale GPS/final-status responses and the cold-A invalidation path. The App browser suite covers both supported directions, both unsupported round trips, repeated switching, unsupported success/failure, later deactivation, full Home departure/unmount, exactly one native request and newest-action ownership. Full verification and exact-head CI are recorded at delivery; no local/browser claim substitutes for physical acceptance, now separately reported by the user below.


## Authority and Git audit

User-approved scope: the complete `Gezek_Proximity_UI_State_Implementation_Handoff_2026-10-21.md`, read before edits, plus live Figma below. No Figma writes. Repository: `https://github.com/keremtunaguneyy-byte/napsak-app`.

- Provided checkout: `/Users/kerem/.codex/worktrees/9d7f/napsak-app`, initially clean, detached HEAD `a4f5326fac4bf619ed6662cfa3f12a66d30bcf24`.
- Primary checkout: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`, branch `main`; only the two protected untracked Verilog files were present.
- Fetch verified `origin/main` at `a4f5326fac4bf619ed6662cfa3f12a66d30bcf24`, normal PR #80 merge, parents `6244fa49b35669a04e5e5578f8b8a3dd0ec5eb41` and `41d318675104930143565412d5b89857bd400277`.
- Live GitHub: PR #80 MERGED; merge timestamp `2026-10-21T19:00:28Z`. Both merge-head checks completed SUCCESS: [app-quality](https://github.com/keremtunaguneyy-byte/napsak-app/actions/runs/39657814979/job/119422633388), [firestore-rules](https://github.com/keremtunaguneyy-byte/napsak-app/actions/runs/39657814958/job/119422632956).
- New worktree: `/private/tmp/gezek-proximity-control-ui-state`; new branch `codex/gezek-proximity-control-ui-state`, created directly from fetched main. Final commit/PR/check identity is reported from live GitHub at delivery, rather than embedding a self-referential SHA here.
- Protected directory `src/firebase/BA_4bit.sv/` remains in the primary checkout, untracked and untouched. SHA-256: `rtl/BA_4bit.sv` = `ab476087e42d5b8d3bc792264c5225c8e5002dcded51eb40bb26aa4e2608e6ff`; `rtl/tbBA_4bit.sv` = `b8e18e9ef4280fe1411cba06fcdfd647cdd739d6e1a990d52710c6799d48b6c7`.

## Implemented contract

RAM-only owner: `off → acquiring → active`. Repeated activation is a synchronous no-op outside off. Activation uses the strict lease above when valid; otherwise it checks services and uses the existing foreground-permission/current-position APIs with Balanced accuracy for a fresh finite coordinate. A 20-second one-shot acquisition deadline returns off with acquisition-failure feedback; this is a bounded request, never a polling loop. Existing two-second recommendation-location preflight remains authoritative for newly computed batches.

Permission denial, disabled services and acquisition failure return off without clearing A cards. Active invalidation returns off and restores A. One successful fix object is shared between Gezek and Mekân for the active session. Returning to either filter, Home/Detail boundaries and existing Android foreground/focus infrastructure validate services/permission without another GPS acquisition. Event/Fikir suspend the session and never expose the control. Reactivation within the validated lease restores its provenance; otherwise it reacquires.

The owner rejects stale results after off/cancel, navigation away, preferences opening/Save/reset, background during pending, invalidation, explicit location update and unmount. An explicit location update supersedes pending/active proximity ownership; its late predecessor cannot publish. The state is never included in preferences, AsyncStorage or Firebase.

| Action | Snapshot / seed result |
|---|---|
| Initial A | Existing default engine path and four-filter ownership |
| First B2 visit | Existing engine `proximityPolicy: 'nearby'`, current independent mode seed/history, valid activation provenance |
| Warm filter/mode return | Exact snapshot object/order restored, no computation or GPS |
| Toggle | No run increment; valid A restored, otherwise safe locationless A |
| Reactivation | Validated lease restores the same fix/cache; expired/invalid lease requires fresh provenance; mode history retained |
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

## Original implementation validation — `1143e7e`

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

Rules-specific local emulator tests were not run because Firebase/Rules are unchanged; exact-head GitHub Firestore Rules is checked at delivery. These original automated checks did not establish native acceptance. The user subsequently reports Redmi checks 1–12 and restart passed on `1143e7e`; signed-release acceptance remains separate. No production operation.

## Scope and delivery

Exact inventory: [PROXIMITY_UI_STATE_CHANGED_FILES.txt](PROXIMITY_UI_STATE_CHANGED_FILES.txt). Engine math, eligibility, catalog/stable IDs, Firebase and persistence schemas, Event/Idea behavior, Detail policy, onboarding/Preference Editor UI, Saved/Ankara 101, artwork mappings and release configuration are unchanged. App-level Preference Save only extends its existing invalidation to both Home modes. Package change only includes the focused tests in normal CI.

The final 22 October user instruction authorizes one normal documentation commit/push on the existing branch, exact new-head App Quality and Security Rules checks, final diff/review/thread/mergeability audit, marking PR #81 ready, and a normal merge commit through main's active ruleset without bypass. Then fetch and safely fast-forward canonical main, verifying local main = origin/main = GitHub merge commit. Retain the feature branch/worktree and protected Verilog directory. Earlier Draft/no-merge instructions are superseded for #81 only. No further feature implementation is authorized.

## Final Redmi acceptance — user report on `e36d1ae`

These are the user's physical Redmi acceptance results on `e36d1aeee1758ab6517c141cc5a14b3c11c916ed`, not agent-performed device tests. They supersede the earlier ambiguous checks-1–12 shorthand and both pending correction retests.

1. **Passed:** fresh proximity activation, pending state and nearby results.
2. **Passed:** off restores the original default-A snapshot without seed rotation or scroll jump.
3. **Passed:** re-enabling within the valid lease reuses the recent location with acceptable perceived latency.
4. **Passed:** re-enabling at or after lease expiry requires fresh acquisition.
5. **Passed:** permission/location-service invalidation blocks cached reuse and safely restores default A.
6. **Passed:** explicit “Konumu güncelle” forces fresh acquisition and renews the lease.
7. **Passed:** restart clears the proximity lease and starts off; ordinary preferences and saves remain intact.
8. **Passed:** Gezek → Mekân and Mekân → Gezek switching during pending.
9. **Passed:** Event/Fikir round trips and rapid switching cause no crash, stale overwrite or stuck pending.
10. **Accepted intended behavior:** opening Ankara 101 during pending leaves Home and cancels acquisition; returning shows default/off. This is not an unresolved bug.
11. **Passed:** Gezek and Mekân controls behave consistently.
12. **Accepted for beta:** card changes and perceived activation latency.
13. **Remain accepted:** previously tested save/unsave, dismiss/Undo, details/Back, scroll restoration, location invalidation, large text and Reduced Motion.
14. **Deferred release checks:** real TalkBack and signed-release acceptance. Browser ARIA/focus and export/CI evidence do not close these checks.

## Separate deferred follow-ups — not merge blockers

- Mekân's “Kahve”, “Sanat” and similar category chips are presentation only, not functional filters. Product semantics, catalog taxonomy and recommendation behavior require a separate audit and implementation.
- Ayarlar and Gizlediklerim/dismissed-management still use legacy visual designs and require separate production design closure.

Neither follow-up is implemented in PR #81. No Settings, Hidden Items, category-filter, catalog, Firebase or data-collection work starts as part of this closeout. Existing Event stale-verification health remains a separately evidenced baseline issue, not a scoped proximity regression. No remaining scoped acceptance or Figma blocker is reported; live CI/review/protected-merge gates still apply.
