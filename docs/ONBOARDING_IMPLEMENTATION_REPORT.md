# Production first-run onboarding implementation

2026-10-13. Branch: `codex/gezek-production-onboarding`. This report describes repository implementation and local/browser/export evidence, not production or signed-release acceptance.

## Verified starting state and continuation

Actual clone: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`; remote `https://github.com/keremtunaguneyy-byte/napsak-app.git`. Initial `main`, HEAD and fetched `origin/main` exactly matched PR #74 merge `782723c9b2d6aff17363a3c8f2532efcde107f55`. Tracked worktree was clean; `src/firebase/BA_4bit.sv/` was the sole unrelated untracked directory. It remains untouched, unread and unstaged. PR #74 was verified merged, with accepted implementation head `ee857c645444fa5d40b0708e921525ce59818208`. PR #57 was inspected read-only and has not been modified.

The existing feature branch was resumed without recreation, reset, stash or Undo. At continuation HEAD was still the baseline and the existing implementation, audit and captures were preserved. The rejected final command had not added a success latch, deletion guard reset, fixture completion hook or departed-callback regression. Controlled edits added the minimal correction: keep success latched, release failure for Retry, and increment an in-memory generation on the existing deletion reset so old callbacks cannot reopen completion. No generation is persisted and no Firebase contract changed.

The historical audit is preserved in [ONBOARDING_IMPLEMENTATION_AUDIT.md](ONBOARDING_IMPLEMENTATION_AUDIT.md). The exact complete path inventory is [ONBOARDING_CHANGED_FILES.txt](ONBOARDING_CHANGED_FILES.txt). Commit/remote/PR/CI identity is reported in the delivery message and attached Draft PR; it cannot be self-embedded into its own commit.

## Authoritative design and intentional reconciliations

Live Figma file `yTdAWr92ETyurlQQHNNqpi`: section `31:3`; Welcome `31:4`, Mood `31:29`, Interests `31:86`, Budget `31:153`, Group `31:217`, Duration `31:273`, Preparing `31:336`, Ready `389:1179`; selected components `30:214`/`30:232`, Final Review Board `288:3` with onboarding `288:7`/`288:10`, Ready shimmer `507:37`. Context, screenshots, prototype links/guards and motion were inspected. PR #74 overview `288:1879` and budget-only `288:2439` references and current code were compared. Production Home remains the existing implementation associated with `824:2880`/`823:2041`, rather than adopting the older onboarding prototype's Home destination appearance.

**Approved production Figma onboarding requires at least one Interest and supersedes the permissive legacy onboarding UI. The domain layer retains empty-array compatibility for existing data.** This is first-run validation only. Zero choices visibly disable Continue with the disabled accessibility state, first choice enables it, last deselection disables it again, multiple choices have no invented maximum, Back retains the current draft, and no Alert/toast/error is invented for zero choices. The user explicitly approved this reconciliation after the preserved audit. Completed legacy users with zero interests bypass onboarding; incomplete persisted sessions with a mood and zero interests resume Interests safely. PR #74 editor validation remains independent and still permits an empty array.

`Bedava` maps to existing internal `Ücretsiz`. Group presentation 1/2/3–4/5+ maps to existing values. Duration copy preserves the approved available-maximum contract, excluding first-stop arrival and homeward travel, rather than importing travel-inclusive prototype wording. No eligibility, weights, score, rotation, explanations or data values were changed.

## Exact before / after matrix

| Concern | Baseline before | Implemented after |
|---|---|---|
| Flow | Welcome → Mood → Interests → Budget → Group → Duration → Home | Welcome → Mood → Interests → Budget → Group Size → Duration → Preparing → Ready → explicit Planı Gör → Home |
| Visuals | Inline App forms and emoji choices | Small native host with Gezek tokens, Plus Jakarta Sans, exact local Figma artwork and central replaceable BrandLogo |
| Interest guard | Empty selection continued | First run requires ≥1; visibly/accessibly disabled at zero, unlimited multi-select, no invented validation error |
| Draft ownership | Live preference setters and per-step autosave | Session-local RAM draft; no unfinished new draft writes |
| Back | Partial explicit links | All question Back links and Android hardware Back use the same reducer, retaining draft values; Welcome allows OS exit |
| Preparing/Ready | Absent | Figma 4800 ms preparation, current selection summary, Ready waits for explicit CTA; no Back/Close invented |
| Completion | Flag/Home before persistence success | One coherent existing v5 snapshot awaited before flag/Home/completion event; autosave skips that exact already-written snapshot |
| Duplicate callbacks | No first-run transaction latch | Ref blocks rapid calls; success remains latched; departed callbacks write/emit nothing; deletion invalidates old generation |
| Failure | Generic autosave error after navigation | Actual local write failure retains Ready/draft, reports existing storage error, unlocks Retry |
| Restart | Completed flag plus mood required Home | Completion flag authoritative, including legacy empty interests/missing optional values; successful restart goes Home |
| Incomplete restart | Welcome with prior autosaved live choices | Existing stored answers resume first missing question; mood+zero interests → Interests; fresh unfinished RAM-only draft restarts Welcome |
| Home Düzenle | PR #74 editor | Same independent editor |
| Home Baştan başla | Cleared preferences and replayed Mood | Existing Home callback opens independent editor so returning users cannot replay first run; Home component/layout unchanged |
| Budget | Ücretsiz in UI/data | Bedava in onboarding, existing Ücretsiz in data |
| Duration meaning | Approved maximum excludes arrival/homeward travel | Same runtime meaning, explicit reconciled copy |
| Analytics | Existing screen/completion allowlist | Same schema; Preparing stays under duration without duplicate view; one onboarding completion event after success |
| Accessibility/layout | Growing inline content | ≥44 px targets, selected/checked/disabled/busy roles, decorative tree exclusion, focus after navigation/Back, safe areas, warm root/dark status, measured anchored CTA clearance |
| Motion | Legacy UI | Native forward 500 ms/back 440 ms presentation, exact route/progress/Ready shimmer; OS reduced motion suppresses presentation without changing preparation/completion semantics |
| Contracts | Existing domain/catalog/Firebase/v5/editor | Preserved; protected-file comparison and regression coverage prove compatibility |

## Implementation and persistence boundaries

`src/onboarding.ts` owns deterministic order, draft transitions, readiness validation and existing-snapshot construction. It reuses `PreferenceDraft`/`PersistedPreferences`; it introduces no second preference model or schema. `OnboardingHost` owns visual presentation only. `App.tsx` owns hydration, the 4800 ms preparation timer, one awaited local transaction and completion publication. New unfinished drafts are intentionally RAM-only; no new resume storage is invented. Saved and dismissed arrays are retained unchanged in the final snapshot. Existing remote synchronization follows successful local completion through its unchanged queue contract.

Busy is set synchronously before awaiting storage. Failed storage releases it; successful storage leaves it latched while Ready departs. The existing data-deletion reset releases the latch and advances an in-memory session generation. A retained old Ready closure is harmless before and after that reset. The browser completion hook is injected only into the generated `/private/tmp` test bundle by the fixture builder; production App/host/controller expose no browser test globals.

64 exact local nonempty Figma exports plus a hash/geometry manifest are bundled. SVG source strings/root geometry match the files. Native rendering trims the exact exported cubic route using its measured length; it does not redraw the route or alter source bytes. Preparing uses the exact transparent 52×52 PNG at the Figma 26×26 rendered size. Existing PR #74 Interest controls are shared where geometry matches; other onboarding tile/row geometry stays scoped. Final logo, app icon, splash and store artwork remain unresolved and out of scope.

## Verification and evidence

Final command output and exit codes are durable in `evidence/onboarding/final-verification/results.json` and `command-1.log` through `command-11.log`. Earlier successful command evidence remains in `evidence/onboarding/verification/`. `npm ci` passed earlier in this same task; dependency declarations and package-lock did not change, so it was not repeated (only the test script adds the new suite). The existing dependency audit reported 65 vulnerabilities (24 moderate, 39 high, 2 critical); dependency remediation is outside this PR.

| Required command | Result |
|---|---|
| `git diff --check` | PASS (exit 0) |
| `npm run typecheck` | PASS (exit 0) |
| `npm test` | PASS (exit 0); 111 domain/release + 142 TypeScript tests, including 14 focused onboarding tests |
| `npm run test:catalog` | PASS (exit 0) |
| `npm run check:events` | PASS (exit 0) |
| `npm run check:accessibility` | PASS (exit 0) |
| `npm run test:stress` | PASS (exit 0) |
| `npm run check:performance` | PASS (exit 0) |
| `npm run check:recommendations` | PASS (exit 0) |
| `npm run check:assets` | PASS (exit 0) |
| `npx expo export --platform android --output-dir /private/tmp/gezek-onboarding-android-export` | PASS (exit 0); export is not a native-device result |

No `npm run check` script exists. Firebase Rules/release-readiness commands are outside this UI change; rules, release configuration and blockers were not changed. Browser fixture generation: `GEZEK_ONBOARDING_FIXTURE=true GEZEK_BROWSER_MODULES=/private/tmp/gezek-artwork-web-deps/node_modules GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-onboarding-browser node scripts/buildDetailBrowserFixture.cjs`. Full browser run: `GEZEK_BROWSER_MODULES=/private/tmp/gezek-artwork-web-deps/node_modules GEZEK_BROWSER_EVIDENCE=docs/evidence/onboarding/final-passed node tests/onboarding-browser.cjs`.

The final browser suite passed all 10 scenario groups with zero page errors. Final browser evidence is `evidence/onboarding/final-passed/browser-results.json` and PNGs in that directory. Both 393×852 and 412×915 cover Welcome, unselected/selected Mood, zero/one/multiple Interests, Back return, selected Budget/Group/Duration, Preparing, Ready and first Home. Additional captures cover long Turkish copy, 1.8× simulated text, full large-text Ready and scrolled CTA clearance, 393×667 with top/bottom safe-area adapters and normal motion. Earlier captures are preserved, not replaced. RN Web adapters simulate backend/storage/native APIs; browser fonts genuinely load before measurement.

Regression evidence covers rapid calls making one write attempt, one successful persistence and one completion event; departed Ready callback after Home makes no write/event; failure releases Retry; restart goes Home; real Settings deletion confirmation resets the guard and permits one future completion; stale prior callback remains rejected after reset. Separate cases prove first-run zero/one/last deselection, unlimited multi-select, Back/forward draft retention, completed empty-interest bypass, incomplete resume, no unfinished writes, saved/dismissed preservation, identical recommendation inputs/results, domain empty-array safety, existing v5 roundtrip and unchanged editor empty-array behavior. Final screenshot inspection confirmed disabled/enabled Interests at both widths, preserved Back selection, Preparing/Ready and first Home; large-text Ready remains scrollable with summary/note clear of the anchored CTA. Performance p95 was 7.266 ms against the 25 ms budget over 5000 calls. Protected source equality is recorded in `evidence/onboarding/protected-contracts.json`.

## Remaining Redmi acceptance checklist

- Fresh install: complete every step in the approved order; zero/one/last deselection and multiple Interests; Back and forward retain selections.
- Android hardware Back: Welcome OS exit; question Back parity; Preparing/Ready safely consume Back without inventing exit.
- Native portrait at actual device size: safe top/status/navigation bars, dark status icons, warm background/no white flash, anchored CTA and scroll clearance on every step.
- TalkBack: reading order, headers/focus on forward, restored selection/heading on Back, selected/checked/disabled/busy announcements, decorative artwork excluded and Ready focus.
- Actual OS large-system-text: full flow and Ready summary with reachable CTA; long Turkish copy and short/tall screen behavior.
- Actual OS reduced motion and live setting changes: static fallback, no focus stealing, same preparation timing and completion semantics.
- Rapid Ready taps, delayed/lifecycle callbacks, storage failure then Retry, completed cold restart and incomplete restart; legitimate data deletion followed by new onboarding.
- Confirm first Home recommendations, saved/dismissed preservation and Düzenle/returning-user Baştan entry stay in independent PR #74 editor.
- Signed-release device matrix, production Sentry/restore/identity/release gates remain separate pending acceptance; Expo export or development testing does not close them.

No unresolved product-contract blocker remains after the explicit Interest reconciliation. Native acceptance is still pending. Recommended next action: review the Draft PR and perform the above Redmi/TalkBack checks before considering merge; do not merge automatically.

## 2026-10-14 — Incoming transition correction on existing Draft PR #75

Resumed the verified repository and existing branch at local/remote `82507e7f6559eb5ed6f9672b7168cf8db7993adc`. Tracked tree was clean; user-owned Verilog remained the only untracked directory and was not read, staged or changed. Fetched `origin/main` remains `782723c9b2d6aff17363a3c8f2532efcde107f55`. Draft PR #75 remains open against main. The earlier implementation report/audit/evidence above are preserved as historical checkpoints.

**Confirmed root cause:** the old scene reused an `Animated.Value` settled at zero across a revision change. React committed the incoming content with that value; a passive `useEffect([session.revision])` subsequently reset it to ±width and started timing. Before fixtures at both requested widths recorded zero translation in every incoming commit, including cold forward and warm Back/forward. This creates a commit-to-passive-effect exposure window. The user reported the visible native/browser symptom; the diagnostic records prove the zero-position commit, not native GPU paint timing. SVG construction contributes measurable render work but does not explain the lifecycle defect, which also occurs on warm returns. The spinner PNG appears only in Preparing and cannot cause the first Welcome→Mood transition.

| Lifecycle | Before | After |
|---|---|---|
| Identity | Same scene/value for changed question | `OnboardingScene` keyed by navigation revision; draft stays in unchanged parent/controller |
| Initial translation | Reused settled zero | Lazy scene construction uses +width forward, −width Back, zero for Reduced Motion before first commit |
| Start | Passive effect resets translation then starts | Layout effect resets scroll and schedules animation on the next frame after the initial commit; no timeout/loading extension |
| Cancellation | Stops prior timing and cancels focus frames in passive cleanup | Layout cleanup marks scene cancelled before stopping animation/cancelling pending start/focus frames; late callbacks are rejected |
| Focus | Completed callback plus two frames | Only the surviving successful transition may enqueue the existing two-frame focus; Back restores the selected control/heading |
| Reduced Motion | Stops presentation without replay | No slide is constructed/started for reduced entry; live reduction settles to zero once; switching back does not replay or refocus |
| Preparing/Ready | 4800 ms app timer, same revision for Ready | Unchanged timer/state/completion guards; Ready focus retained without remount/replaying entrance |
| Assets | SVG XML memoization local to each renderer | Bounded module cache of immutable parsed SVG elements plus memoized asset renderer; exact original XML/geometry; static spinner source reused |

An unexpectedly interrupted timing on a surviving scene snaps to zero without emitting stale completion focus; cancelled departed scenes are ignored. No new product behavior, screen geometry/copy, location behavior, recommendation, Home, catalog, Firebase, persistence schema or release setting changed. `App.tsx`, `src/onboarding.ts` and their completion guards are byte-identical to the prior head. Gezek-plan location correctness/UX is explicitly deferred to a separate post-onboarding PR.

### Cold / warm measurements — browser diagnostics only

The before fixture loads the exact prior `OnboardingHost.tsx` extracted read-only with `git show 82507e7f6559eb5ed6f9672b7168cf8db7993adc:src/components/gezek/OnboardingHost.tsx`. The after fixture loads the current component. Both use the same generated service/native adapters, real Plus Jakarta Sans, Chrome/Pixel 7 emulation, React Profiler and DOM commit/RAF probes. Final before and after runs are sequential after other local tests finish. Cold is the first forward entry into Mood in a new page; warm Back revisits Mood; warm forward revisits Interests. Times are one instrumented sample per case, include browser/profiling/scheduling overhead, and are not statistically controlled benchmarks or native performance evidence.

| Viewport | Case | Commit X before → after | Render→commit ms before → after | Commit→start ms before → after | SVG subtree ms before → after |
|---|---|---|---|---|---|
| 393×852 | cold-forward | 0 → 393 | 10.2 → 11.1 | 0.9 → 28.5 | 2.9 → 3.0 |
| 393×852 | warm-back | 0 → -393 | 4.8 → 5.7 | 0.8 → 5.5 | 1.9 → 2.0 |
| 393×852 | warm-forward | 0 → 393 | 7.4 → 8.5 | 0.7 → 0.9 | 0.8 → 1.3 |
| 412×915 | cold-forward | 0 → 412 | 10.6 → 11.8 | 0.9 → 27.1 | 2.6 → 3.6 |
| 412×915 | warm-back | 0 → -412 | 4.4 → 7.5 | 0.8 → 3.1 | 1.6 → 2.1 |
| 412×915 | warm-forward | 0 → 412 | 8.2 → 8.4 | 0.8 → 1.6 | 0.8 → 1.3 |

The corrected commits are always on the correct side before non-reduced motion starts; the deliberate commit→frame interval keeps that off-screen position, rather than exposing final content. Keyed construction still performs layout/render work; no general cold/warm latency improvement or Redmi FPS claim is made. Raw commit, animation, frame, focus and first-commit asset subtree measurements: `evidence/onboarding/transition-before/transition-results.json` and `transition-after/transition-results.json`.

### Correction validation and changed files

All requested commands passed on the corrected implementation: `git diff --check`, `npm run typecheck`, `npm test` (111 domain/release + 146 TypeScript = 257 tests, including 18 onboarding), `npm run check:accessibility`, `npm run check:performance` (5000 calls, p95 9.127 ms against 25 ms), `npm run check:assets`, and `npx expo export --platform android --output-dir /private/tmp/gezek-onboarding-transition-android-export`. Exact exit codes/logs are in `evidence/onboarding/transition-verification/results.json` and its command logs. No dependency/package/lock change; npm ci was not repeated locally.

The existing full onboarding browser suite passed all 10 scenario groups at 393×852 and 412×915, including normal/reduced motion, draft Back preservation, long/large/short layouts, Preparing/Ready, failure/Retry, completed restart, real deletion/reset and rapid/departed completion with one persistence/event per session. Evidence: `evidence/onboarding/transition-full-regression/`. 32 settled screenshots are byte-identical to the earlier captures; Preparing/Ready at 412 and large-text clearance were visually reinspected. New transition suite passed both viewports with commit/RAF positions, forward/back sides, interrupted/rapid actions, surviving-only focus, reduced entry and live OS reduction without replay. Unit tests also deliberately invoke cancelled starts, late stopped callbacks and cancelled queued focus. No production browser globals are introduced; probes and hooks are only in generated fixtures.

Runtime changed: `src/components/gezek/OnboardingHost.tsx`, new `src/onboardingTransition.ts`. Tests/fixture changed: `tests/onboarding.test.ts`, new `tests/onboarding-transition-browser.cjs`, `scripts/buildDetailBrowserFixture.cjs`. Documentation changed: this report, `STATUS.md`, complete PR inventory `ONBOARDING_CHANGED_FILES.txt`; new baseline/after/full-regression/verification evidence directories are included in that inventory. Intermediate diagnostic artifacts and generated bundles remain in `/private/tmp` and are not committed. Original audit/assets/screenshots are retained untouched.

Fixture build/run commands retain the existing external browser modules. Set `GEZEK_ONBOARDING_FIXTURE=true`, `GEZEK_BROWSER_MODULES=/private/tmp/gezek-artwork-web-deps/node_modules`, `GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-onboarding-browser` and run `node scripts/buildDetailBrowserFixture.cjs`; run `node tests/onboarding-browser.cjs` with `GEZEK_BROWSER_EVIDENCE=docs/evidence/onboarding/transition-full-regression`. For transition assertions use `node tests/onboarding-transition-browser.cjs` with evidence `transition-after`. For baseline diagnostics additionally set `GEZEK_ONBOARDING_SOURCE` at fixture build to the read-only extracted source, serve it separately at 8779, and set `GEZEK_TRANSITION_BASELINE=true`, `GEZEK_BROWSER_URL=http://127.0.0.1:8779`, evidence `transition-before` at test execution. Native adapters and DOM probes do not establish native compositor or TalkBack results.

Normal commit/push update the existing branch/PR only. Exact final SHA and CI status are reported in the delivery message and live Draft PR, rather than self-embedded into their own commit. No merge, new branch, new PR, production operation or #57 modification.

### Remaining Redmi transition checks

- Cold first Continue and warm returns on the actual device: incoming content must not briefly appear centered, freeze and then restart its slide.
- Forward/right and Back/left entrances; rapid Continue/Back and hardware Back during motion settle the surviving scene without translated leftovers or stale replay.
- Draft selections and scroll-to-top after Back; TalkBack focus moves only after the surviving animation, restoring the selected control or heading.
- Actual OS Reduced Motion on/off and changing mid-transition: no spatial slide for reduced entry, immediate safe settle when enabled, no replay/refocus when disabled.
- Preparing→Ready retains its timing, summary and CTA focus; repeated completion remains single-write/single-event, Retry/restart/reset remain safe.
- Safe areas/warm canvas, large-system-text CTA clearance and all earlier native/signed-release acceptance remain pending. The browser result is not Redmi acceptance.

No code blocker remains. Next: repeat these native acceptance checks on the pushed Draft head; keep #75 unmerged. Location work remains deferred.

## 2026-10-14 — Native motion timing correction on the same Draft PR

Resumed existing branch `codex/gezek-production-onboarding` / Draft PR #75 at matching local/remote `22fc38e7559668621386103bbbc0624d59a2500e`. Tracked tree was clean apart from the preserved untracked Verilog directory. Fetched main remains `782723c9b2d6aff17363a3c8f2532efcde107f55`. Earlier audit, reports and captures are preserved.

**Confirmed residual cause:** keyed construction fixed the zero-position flash, but the outgoing scene disappeared while the incoming scene was fully off-screen. The lifecycle then scheduled an extra RAF before starting a 500 ms forward / 440 ms Back animation with `Easing.inOut(Easing.ease)`. The slow early progress kept actual foreground content outside the viewport and looked frozen. This is a presentation correction; no recommendation or loading behavior is changed. The source and provided recording agree with the user-reported residual symptom; no native CPU trace or JS event timestamps were available in the recording.

The original recording `/Users/kerem/Downloads/Screen Recording 2026-10-14 at 12.51.10.mov` was inspected read-only with AVFoundation: 48.067 s, nominal 59.896 fps, 816×1738. Consecutive samples show the prior Group scene at 24.983 s, background-only frames at 25.000–25.083 s, incoming edge at 25.100 s and clearer Duration content at 25.167 s. These are recording timestamps, not press→commit measurements. Source hash/metadata and an intentional diagnostic contact strip are under `evidence/onboarding/motion-native-inspection/`. The movie was not modified or committed. This prior-head recording is not new-build native acceptance.

| Policy | Prior head | Current correction |
|---|---|---|
| Forward | 500 ms | 280 ms (cap 320 ms) |
| Back | 440 ms | 240 ms (cap 280 ms) |
| Easing | `Easing.inOut(Easing.ease)` | `Easing.out(Easing.cubic)` |
| Initial position | Keyed pre-commit ±width | Preserved |
| Staging/start | Layout commit, then another RAF, then Animated's frame | The committed layout is the staging boundary; start timing there, Animated owns the next frame |
| Driver | Native | Native, unchanged |
| Focus/cancellation | Surviving completion plus two focus frames, guarded cleanup | Preserved; no pending extra start-frame callback remains |
| Reduced Motion | Zero translation, no slide | Preserved, including mid-slide settle and no replay |

The user-approved runtime policy supersedes only the earlier imported motion timing. Artwork geometry/opacity, screen composition, directions, selected drafts, scroll reset, accessibility, 4800 ms Preparing/Ready and completion guards are unchanged. No timeout, dependency or loading-screen extension was introduced. `App.tsx`, `src/onboarding.ts`, Home, recommendations, location behavior, catalog, Firebase, schema, package/lockfile and release configuration are unchanged from the prior head. Gezek-plan distance display remains explicitly deferred to the next separate PR.

### Motion measurements — diagnostic browser evidence

The final paired run uses the exact prior Host and lifecycle extracted read-only with `git show 22fc38e:...`, and the corrected sources. Both run sequentially after other checks finish, with identical adapters and real fonts. Press time is the captured DOM click that precedes the actual React onPress update, rather than the start of a Playwright command. Staged commit is a layout probe before animation start. First visible movement requires >1 px translation change and a foreground heading/control intersecting the fixed viewport; settled is |translateX| <0.1 px. Frame counts are unique observed RAF timestamp batches, not GPU/display refresh counts; skipped refreshes cannot be inferred. Native callback/paint timing still needs Redmi verification.

RN Web does not provide the Android native animation driver: its ordinary fallback schedules React renders, and initially added a third observed frame. The generated onboarding fixture therefore mirrors native-driver direct view-property updates from the actual Animated.Value. It retains RN Web's actual clock, easing, duration and completion/cancellation callbacks. The fixture also models physical-window clipping so off-screen content cannot expand a mobile layout viewport, samples both direct property changes and post-RAF DOM state, and counts a timestamp once regardless of RAF callback order. These are explicitly diagnostic platform adapters, not native performance proof. They are gated to the generated onboarding fixture; production exposes no browser hooks/globals.

The installed React Native native frame configuration evaluates 60 Hz samples: the first positive forward sample changes from 0.391% to 16.629% of travel, and Back from 0.515% to 19.934%. The new first positive sample clears the unchanged content inset; the old sample did not. Both durations and the actual requested native-driver flag are asserted in the component trace. A faster curve alone with an extra staging RAF still failed the two-batch cold-entry probe; using the committed layout as staging removed that additional start delay while preserving the off-screen initial commit.

| Viewport | Case | Press→commit ms before → after | Commit→visible ms before → after | Visible→settled ms before → after | Observed RAF batches before → after |
|---|---|---|---|---|---|
| 393×852 | cold-forward | 11.3 → 11.3 | 134.4 → 32.2 | 399.9 → 247.6 | 9 → 1 |
| 393×852 | warm-forward | 8.5 → 9.4 | 101.8 → 15.7 | 399.7 → 251.1 | 7 → 2 |
| 393×852 | warm-back | 6.2 → 9.0 | 88.2 → 16.7 | 366.1 → 216.6 | 6 → 2 |
| 412×915 | cold-forward | 10.6 → 11.0 | 115.6 → 30.5 | 416.7 → 236.2 | 7 → 1 |
| 412×915 | warm-forward | 8.5 → 11.6 | 100.8 → 15.0 | 399.9 → 249.9 | 7 → 2 |
| 412×915 | warm-back | 5.3 → 9.1 | 90.1 → 16.8 | 366.3 → 216.4 | 6 → 2 |

These are single instrumented samples per case, including browser/profiler overhead. No native smoothness, Redmi FPS or general rendering-speed claim is made. Full before/after records are `evidence/onboarding/motion-before/transition-results.json` and `motion-after/transition-results.json`.

### Verification, inventory and delivery

All requested final runtime checks passed: `git diff --check`, `npm run typecheck`, `npm test` (111 domain/release +147 TypeScript =258, including 19 onboarding), `npm run check:accessibility`, `npm run check:performance` (5000 calls, p95 9.121 ms against 25 ms), `npm run check:assets`, and `npx expo export --platform android --output-dir /private/tmp/gezek-onboarding-motion-android-export`. Command exit codes and logs are in `evidence/onboarding/motion-verification/`. No dependency/lock changes; no local npm ci repeat was needed.

The existing onboarding/browser suite passed 10 scenario groups at 393×852 and 412×915, including full flow, draft Back preservation, hardware Back, large/long/short layouts, Preparing/Ready, Retry, restart, deletion/reset and single persistence write/completion event per legitimate session. New transition measurements/assertions passed both viewports: pre-start ±width, forward ≤320 ms and Back ≤280 ms (configured and observed timing), visible entry within ≤2 observed batches, correct directions, rapid Continue/Back plus hardware Back interruption, settled surviving scene, surviving-only focus, no reduced-motion slide and mid-animation reduction without replay. New tests also retain the cancelled-callback and failed-surviving-timing guards.

Exact edited files: `src/components/gezek/OnboardingHost.tsx`, `src/onboardingTransition.ts`, `tests/onboarding.test.ts`, `tests/onboarding-transition-browser.cjs`, `scripts/buildDetailBrowserFixture.cjs`, `docs/STATUS.md`, this report and `docs/ONBOARDING_CHANGED_FILES.txt`. Intentional evidence additions are the motion native-inspection, before, after, full-regression and verification directories. The complete PR inventory lists every path. Generated Swift/browser source, exports and intermediate failed traces remain in `/private/tmp` and are not committed; original artifacts are preserved.

Final fixture build: `GEZEK_ONBOARDING_FIXTURE=true GEZEK_BROWSER_MODULES=/private/tmp/gezek-artwork-web-deps/node_modules GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-onboarding-browser node scripts/buildDetailBrowserFixture.cjs`. Run `node tests/onboarding-transition-browser.cjs` with the same modules and `GEZEK_BROWSER_EVIDENCE=docs/evidence/onboarding/motion-after`; run the existing `node tests/onboarding-browser.cjs` with evidence `motion-full-regression`. Baseline build sets `GEZEK_ONBOARDING_SOURCE` and `GEZEK_ONBOARDING_TRANSITION_SOURCE` to the exact read-only prior-head files, uses a separate output/server at 8779, and the test sets `GEZEK_TRANSITION_BASELINE=true`, `GEZEK_BROWSER_URL=http://127.0.0.1:8779`, evidence `motion-before`.

Normal commit/push and a description update target only existing Draft PR #75. No force push, new branch/PR or merge; #57 and Verilog remain untouched. Exact final SHA and exact-head CI are reported in the delivery message/live PR rather than embedded into their own commit.

### Remaining Redmi checks for this correction

- Cold forward, warm forward and warm Back: no centered flash, no extended background-only pause; movement should be obvious on the first animated native frame after staging.
- Confirm the 280/240 ms cubic ease-out feel on the actual Redmi/Android Studio build; inspect actual display frames (including high-refresh settings) for the requested two-frame entry behavior.
- Rapid Continue/Back and hardware Back, plus a mid-animation OS Reduced Motion change: surviving scene settles at zero, old callbacks cannot replay or steal TalkBack focus.
- Draft selections/scroll reset and surviving-only focus; Reduced Motion remains spatially instant with no replay when disabled.
- Preparing→Ready, CTA, single completion, Retry/restart/reset, safe areas and actual large-system-text remain safe. Signed-release acceptance stays separate.

No code blocker remains. Next: repeat native acceptance on the pushed head and keep #75 unmerged. The deferred Gezek-plan distance work is not part of this correction.
