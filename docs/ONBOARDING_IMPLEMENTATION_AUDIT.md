# Production new-user onboarding — pre-implementation audit

2026-10-13. Implementation has not started; the interest-selection guard needs a product decision.

## Verified Git baseline

- Existing repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`.
- Origin: `https://github.com/keremtunaguneyy-byte/napsak-app.git`.
- Initial branch: `main`; HEAD and fetched `origin/main`: `782723c9b2d6aff17363a3c8f2532efcde107f55`, exactly the requested baseline.
- Initial tracked worktree clean; sole untracked entry: `src/firebase/BA_4bit.sv/`. It was not read, modified, moved, staged or deleted.
- PR #74 verified MERGED, accepted head `ee857c645444fa5d40b0708e921525ce59818208`, merge commit `782723c9b2d6aff17363a3c8f2532efcde107f55`.
- Only open PR returned by GitHub: #57, `codex/experience-primary-precedence`; inspected read-only.
- New branch created from fetched origin/main: `codex/gezek-production-onboarding`.

## Sources inspected

Project entry point, status, product specification, decisions, design specification and PR #74 preference/Event contract and report; live App routing, hydration, autosave, completion, data deletion, recommendation inputs, Preference Editor controller and controls, v5 persistence and backend serialization boundary, accessibility checks and browser fixture/tests.

Figma file `yTdAWr92ETyurlQQHNNqpi`: approved section `31:3`; Welcome `31:4`, Mood `31:29`, Interests `31:86`, Budget `31:153`, Group `31:217`, Time `31:273`, Preparing `31:336`, Ready `389:1179`; selected card variants `30:214` and `30:232`. Design context and screenshots inspected; motion contexts fetched for all seven principal steps. Prototype guards, Back links, preparation timer and Ready destination were read directly with the Figma Plugin API. Final Review Board `288:3` and its section inventory were read; its onboarding subsection still needs detailed comparison before implementation.

Figma design-to-code, figma-use and figma-implement-motion skills loaded. Requested Gezek visual-system skill was found at `/Users/kerem/Downloads/Gezek_Command_Center_Implementation_Package_2026-10-07/gezek-visual-system/SKILL.md`; its brand-rules reference was read. User additionally authorized live Figma plus existing Gezek components/tokens.

## Before / intended after

| Concern | Current code | Intended implementation |
|---|---|---|
| Flow | Welcome → Mood → Interests → Budget → Group → Duration → Home | Same questions/order; approved Preparing/Ready state before Home |
| Visuals | Legacy inline App onboarding, emoji choices | Small native onboarding host, Gezek tokens, local exact approved artwork, central BrandLogo |
| Interests | Empty selection can continue | **Pending decision:** Figma requires at least one; runtime accepts empty |
| Drafts | Selection setters update the live preference state; autosave writes each step | Session-local drafts; one coherent final successful local preference commit |
| Completion | Flag and Home transition precede successful persistence | Completion flag published only after successful local write; one Home transition |
| Restart | Incomplete session returns to Welcome, previously autosaved choices hydrate | Welcome; preserve established safe restart behavior without persisting new unfinished drafts |
| Returning user | Completed + valid mood opens Home | Existing compatible return behavior; no onboarding replay |
| Home Düzenle | Separate PR #74 Preference Editor | Preserved |
| Home Baştan başla | `reset` sends completed user to Mood and clears live choices | Must reconcile with explicit requirement that returning users never enter first-run onboarding; use independent Preference Editor entry without altering its controller |
| Back | Some explicit previous-step links; no onboarding hardware Back handling | Deterministic Back reducer, prior draft retained, Android Back follows same navigation |
| Budget | Stored/presented Ücretsiz | Present Bedava, store existing Ücretsiz |
| Duration copy | Runtime maximum duration, first-stop arrival/homeward travel excluded | Preserve this approved meaning; reconcile travel-inclusive Figma copy explicitly |
| Preparing | Absent | Live Figma active → ready; success/failure tied to real persistence, same semantics under reduced motion |
| Accessibility/layout | Legacy growing scroll content, no anchored onboarding footer | Anchored CTA with measured clearance, safe areas, focus, selected/disabled/busy semantics, scalable text and decorative-tree exclusion |

## Concrete product-contract blocker

Live Figma Interests primary CTA `161:537` uses a conditional `GREATER_THAN` guard on selection count (`VariableID:376:831 > 0`) before navigating to Budget `31:153`; otherwise it sets the prototype error flag. Existing `App.tsx` Interests CTA has no disabled/required guard, its copy says “Kararsızsan hepsini bize bırak”, and the recommendation model accepts `interests: []`.

Making one interest mandatory removes an existing valid first-run preference path. This is a behavior decision, not a visual mismatch. Per the user's stop condition and AGENTS scope discipline, do not silently choose it. User was asked to choose: preserve optional interests, or approve minimum one interest for first run. No preference schema or recommendation engine change is needed for either choice.

## Validation and delivery status

Git inventory/fetch, PR inspection and read-only source/Figma audits completed. No implementation validation commands, browser captures or Android exports have run because implementation is waiting on the above decision. Historical PR #74 tests are not evidence for this branch.

No commit, push or PR created. No merge. Native Redmi, Android Back/system areas, TalkBack focus/order, actual system large text, OS reduced motion and signed-release evidence remain future acceptance work.

## Resolved after the historical audit

The audit above is preserved as the actual pre-implementation checkpoint. The user explicitly approved minimum one Interest for **first-run onboarding only**, disabled Continue without invented validation errors, unlimited multiple selections and Back preservation. This intentionally reconciles the approved production Figma requirement with the permissive legacy onboarding UI; the domain retains empty-array compatibility for existing data and PR #74 validation remains unchanged.

Final Review Board onboarding section `288:7`/`288:10`, Ready `389:1179` and shimmer `507:37` were subsequently inspected. The final implementation, exact before/after matrix, changed-file inventory, verification and remaining native acceptance are in [ONBOARDING_IMPLEMENTATION_REPORT.md](ONBOARDING_IMPLEMENTATION_REPORT.md). Earlier browser captures remain recoverable in [the pre-cleanup Git snapshot](https://github.com/keremtunaguneyy-byte/napsak-app/tree/5e00a20dcdb6ce072fcec10ea5e068d588ba1fe7/docs/evidence/onboarding); the canonical final suite results are [here](evidence/onboarding/final/browser-results.json).
