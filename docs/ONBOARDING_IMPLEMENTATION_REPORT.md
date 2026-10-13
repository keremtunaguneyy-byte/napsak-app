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
