# Production first-run onboarding implementation

Updated 2026-10-14. Branch: `codex/gezek-production-onboarding`. This report describes repository implementation and local/browser/export evidence, not production or signed-release acceptance.

## Original implementation baseline and continuation

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
| Motion | Legacy UI | Native 280 ms forward /240 ms Back cubic ease-out; keyed off-screen commit; isolated finite route/progress after surviving settle; Reduced Motion suppresses motion without changing preparation/completion semantics |
| Contracts | Existing domain/catalog/Firebase/v5/editor | Preserved; protected-file comparison and regression coverage prove compatibility |

## Implementation and persistence boundaries

`src/onboarding.ts` owns deterministic order, draft transitions, readiness validation and existing-snapshot construction. It reuses `PreferenceDraft`/`PersistedPreferences`; it introduces no second preference model or schema. `OnboardingHost` owns visual presentation only. `App.tsx` owns hydration, the 4800 ms preparation timer, one awaited local transaction and completion publication. New unfinished drafts are intentionally RAM-only; no new resume storage is invented. Saved and dismissed arrays are retained unchanged in the final snapshot. Existing remote synchronization follows successful local completion through its unchanged queue contract.

Busy is set synchronously before awaiting storage. Failed storage releases it; successful storage leaves it latched while Ready departs. The existing data-deletion reset releases the latch and advances an in-memory session generation. A retained old Ready closure is harmless before and after that reset. The browser completion hook is injected only into the generated `/private/tmp` test bundle by the fixture builder; production App/host/controller expose no browser test globals.

64 exact local nonempty Figma exports plus a hash/geometry manifest are bundled. SVG source strings/root geometry match the files. Native rendering trims the exact exported cubic route using its measured length; it does not redraw the route or alter source bytes. Preparing uses the exact transparent 52×52 PNG at the Figma 26×26 rendered size. Existing PR #74 Interest controls are shared where geometry matches; other onboarding tile/row geometry stays scoped. Final logo, app icon, splash and store artwork remain unresolved and out of scope.

## Final presentation corrections — existing Draft PR #75

Verified actual repository `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`, remote `keremtunaguneyy-byte/napsak-app`, branch `codex/gezek-production-onboarding`, initial local/remote/PR head `5e00a20dcdb6ce072fcec10ea5e068d588ba1fe7`, fetched main `782723c9b2d6aff17363a3c8f2532efcde107f55`. Initial tracked diff was empty; only unrelated `src/firebase/BA_4bit.sv/` was untracked. No branch recreation, merge, rebase, amend, force push, Undo or PR #57 modification.

The user reports that cadence/FPS on Redmi and Android Studio at the preceding head materially improved and is acceptable. This is user-reported device acceptance, not a new agent native-FPS measurement or signed-release result. Only Ready orientation and route onset change here; the accepted isolation/slide architecture remains intact.

### A. Ready orientation — root cause and fix

The approved `3fdf5.svg` is upright: `M7 13.3L11.1 17.2L19 8.9`, 26×26, unchanged bytes/hash/geometry. The preceding Spinner switched its children from PNG to check inside the **same Animated.View**, with a native rotation graph and passive-effect cleanup. A static zero style did not give the check independent host ownership. Baseline DOM identity diagnostics at both widths confirm the animated host remained connected for Ready; an explicitly simulated delayed property write against that host also reached the check. This confirms the shared-host/stale-transform mechanism; the simulation is not a native renderer trace of the reported occasional reversal.

Preparing now renders `Spinner key="preparing"`; Ready renders `ReadyCheck key="ready"`. ReadyCheck is a plain View, explicitly `rotate:'0deg'`, and owns no animated rotation value/connection. Spinner's existing 100/4450 ms native sequence is unchanged, but layout-effect cleanup stops it when the old host is removed, before Ready's layout commit. Normal and Reduced Motion regressions confirm a distinct host, identity matrix, exact approved SVG path and immunity to a delayed write against the departed spinner. The normal spinner still has a nonidentity rotating matrix; no spinner loop/listener remains in Ready. The SVG is not edited or replaced.

### B. Route onset — root cause and fix

At the prior head, the isolated leaf clock started only after slide settle, then `elapsed - 460` postponed route progression again on questions and Preparing (`100` on Welcome). This confirms the additive presentation delay: approximately 280 ms slide plus 460 ms offset plus a render opportunity, rather than slow recommendation/data work.

RouteMotion now uses `easeOut(elapsed / duration)` from the surviving settle boundary. Its existing trim travel durations remain Welcome 900 ms, questions 680 ms, Preparing 660 ms. Their finite clocks omit the redundant onset offset. The inspected design/project contract does not require a separate delay **after settlement**; the user's explicit correction applies the same boundary to all route leaves. Ready keeps the already-complete end trim, without restarting a route clock. Spinner/shimmer cycle timing and the 4800 ms Preparing/Ready controller remain unchanged.

Keyed ±width construction, native-driver 280/240 ms cubic ease-out, immutable staging/end ASTs, memoized finite leaves, Back/drafts, scroll/focus, Reduced Motion and cancellation remain intact. There is no parent JS clock, slide-time decorative listener, arbitrary timeout, opacity mask, new dependency or geometry change.

### Before/after measurements — browser diagnostics only

First progression means the first layout-committed SVG trim greater than its static staged value, measured from the actual surviving slide completion callback. Real DOM click, scene commit, slide start/end, route commit, focus and leaf lifecycle probes live only in the generated fixture. RN Web direct-slide-property/window adapters and real Animated clocks/callbacks remain unchanged. The count window includes initial render/footer measurement but excludes the post-settle publication.

| Viewport / case | Settle→first route progression ms before → after | Scene / Background / Route renders before → after | Slide listener updates / AST recompositions |
|---|---|---|---|
| 393×852 cold-forward | 483.7 → 17.2 | 2/1/1 → 2/1/1 | 0 / 0 before and after |
| 393×852 warm-forward | 468.3 → 18.0 | 2/1/1 → 2/1/1 | 0 / 0 before and after |
| 393×852 warm-back | 467.1 → 17.6 | 2/1/1 → 2/1/1 | 0 / 0 before and after |
| 412×915 cold-forward | 483.3 → 17.8 | 2/1/1 → 2/1/1 | 0 / 0 before and after |
| 412×915 warm-forward | 483.7 → 18.3 | 2/1/1 → 2/1/1 | 0 / 0 before and after |
| 412×915 warm-back | 484.8 → 17.0 | 2/1/1 → 2/1/1 | 0 / 0 before and after |

Every measured first route progression is ≤50 ms after settle, including additional Preparing cases at both viewports. All surviving non-reduced commits remain ±viewport width; motion begins in the correct direction, with visible entry within two observed RAF batches and forward/Back within the existing diagnostic caps. Quiet question scenes have no parent/background clock; finite leaf work becomes zero after finishing. Full timing timestamps and JS interval proxies are in [transition-results.json](evidence/onboarding/final/transition-results.json). These browser samples do **not** prove native FPS, GPU cadence or release-device performance.

### Final verification

| Command | Final result |
|---|---|
| `git diff --check` | PASS, exit 0 |
| `npm run typecheck` | PASS, exit 0 |
| `npm test` | PASS, exit 0 |
| `npm run check:accessibility` | PASS, exit 0 |
| `npm run check:performance` | PASS, exit 0 |
| `npm run check:assets` | PASS, exit 0 |
| `npx expo export --platform android --output-dir /private/tmp/gezek-ready-final-android-export` | PASS, exit 0 |

`npm test`: 111 domain/release +152 TypeScript =263 passed, including 24 onboarding tests. Focused components: 24/24. Browser/fixture CJS syntax checks pass. Recommendation benchmark: 5000 calls, p95 7.275 ms against 25 ms; checksum 22308. No aggregate `npm run check` script exists (package scripts explicitly inspected). `npm ci` passed earlier in this task; dependencies, package declarations, lockfile and installation state are unchanged, so it is not repeated. Its original log remains available in the historical Git snapshot. Android export is a bundle check, not native acceptance.

Existing onboarding/browser suite: 10 scenario groups, both 393×852 and 412×915, zero page errors. Expanded transition suite passes normal/reduced Ready ownership/orientation, spinner rotation/layout cleanup, ≤50 ms route onset, bounded renders/no slide listener/recomposition, first off-screen commit, Back/hardware/rapid interruption, obsolete callbacks, surviving-only focus, quiet finite clocks, live Reduced Motion, all Preparing stages, Ready, once-only completion and departed-callback rejection. Existing full flow also verifies zero/one/last/multiple Interests, Back drafts, footer/scroll reset, large/long/short/safe-area layouts, Retry/failure, restart Home, real data reset, legacy empty-array bypass and independent PR #74 editor behavior.

Compact [verification-results.json](evidence/onboarding/final/verification-results.json), [browser-results.json](evidence/onboarding/final/browser-results.json), [contracts.json](evidence/onboarding/final/contracts.json) and transition results record current pass states. App/controller/completion lifecycle, recommendations/domain, Home/location, catalog, Preference Editor, Firebase/persistence/schema, dependencies/release, all asset bytes and artwork geometry are unchanged from the previous head. Production App/host/controller expose no browser test globals. The preserved audit remains [ONBOARDING_IMPLEMENTATION_AUDIT.md](ONBOARDING_IMPLEMENTATION_AUDIT.md).

### Canonical evidence and cleanup inventory

Removed exactly **249** superseded, tracked PR-created evidence paths. Kept one final evidence set of **40** files: **35 PNG captures and 5 compact JSON files**. Of the captures, 18 are in `final/393x852/`, 15 in `final/412x915/`, and two auxiliary short/safe-area captures in `final/393x667-safe-areas/`. Duplicate multi-selection/Back, long-copy budget and early normal Preparing captures are omitted; their assertions remain in the suites. Both main viewports retain normal and Reduced Motion Ready/Preparing, all question states, disabled/one/multiple Interests/Back and first Home; large-text/long-copy/safe-area coverage remains.

Final captures were visually inspected for upright Ready checks in both modes/viewports, disabled/one/multiple Interests and Back, Preparing, first Home and large-text Ready/CTA clearance. Of 31 static counterparts compared to the previous head, 29 are pixel-identical; the two Mood captures each differ at a single pixel. Source geometry/assets remain byte-identical.

Exact removed and retained paths: [cleanup-manifest.json](evidence/onboarding/final/cleanup-manifest.json). The entire superseded evidence and previous report remain recoverable from [the 5e00a20 Git snapshot](https://github.com/keremtunaguneyy-byte/napsak-app/tree/5e00a20dcdb6ce072fcec10ea5e068d588ba1fe7/docs/evidence/onboarding) and [historical implementation report](https://github.com/keremtunaguneyy-byte/napsak-app/blob/5e00a20dcdb6ce072fcec10ea5e068d588ba1fe7/docs/ONBOARDING_IMPLEMENTATION_REPORT.md). Only verified tracked files absent from the base main were deleted, individually; production/source assets, tests, current docs and unrelated files were retained. Raw logs, generated fixtures and Android exports stay in `/private/tmp`. Every current documentation link targets the canonical set or an explicit historical Git snapshot.

Exact final PR inventory: [ONBOARDING_CHANGED_FILES.txt](ONBOARDING_CHANGED_FILES.txt). Changed existing implementation/test/doc files this correction: `src/components/gezek/OnboardingHost.tsx`, `scripts/buildDetailBrowserFixture.cjs`, `tests/onboarding.test.ts`, `tests/onboarding-browser.cjs`, `tests/onboarding-transition-browser.cjs`, this report, `docs/ONBOARDING_IMPLEMENTATION_AUDIT.md` (only obsolete evidence reference), `docs/STATUS.md`, and `docs/ONBOARDING_CHANGED_FILES.txt`. Evidence additions/removals are enumerated by the manifests. Git delivery uses a normal commit/push and only updates existing Draft #75; exact new SHA and exact-head CI are recorded in the delivery response/live PR instead of self-embedding a commit's identity.

### Short Redmi retest checklist

- Ready's approved check stays upright on first appearance and after waiting, in normal/Reduced Motion and Retry/reset; no departing spinner transform reaches it.
- Cold/warm forward and Back: route starts promptly at slide settlement, keeps approved end geometry, and does not regress the accepted native cadence or first-position staging.
- Rapid Continue/hardware Back and live Reduced Motion preserve selected drafts, scroll/focus and stale-callback rejection.
- Preparing→Ready timing, large-text/safe-area CTA clearance, once-only completion, Retry/restart and legitimate reset remain safe.

Stop after updating existing Draft PR #75. No merge or additional PR. Gezek-plan distance remains explicitly deferred.
