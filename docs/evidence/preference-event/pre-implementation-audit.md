# Gezek Preference Editor / Event empty-state pre-implementation audit

Date: 2026-10-13 (Europe/Istanbul).

## Repository and Git

- Verified clone: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`.
- Verified remote: `https://github.com/keremtunaguneyy-byte/napsak-app.git`.
- Initial branch: `codex/gezek-event-artwork-automation`.
- Initial HEAD: `91a68f7bb6d0923dc4d71de8a8c60ef9e07fc326`.
- Starting local origin/main: `c4272ea011fb67952aac00a8e133c717510ff693`.
- Fetched origin/main: `a04c385f3854eb47a979208b54d7cb44b592053a`, exactly the requested baseline.
- Local main fast-forwarded to fetched origin/main before creating the requested branch.
- Final branch: `codex/gezek-preference-editor-event-empty-states`.
- Final HEAD: `a04c385f3854eb47a979208b54d7cb44b592053a`.
- Initial and final `git status --short`: `?? src/firebase/BA_4bit.sv/`.
- Exact changed-file list: none. Audit artifacts exist only in `/private/tmp`.
- Existing open PR discovered: #57, Preserve Experience primary-interest precedence. Untouched.
- New commit: none. Push: none. Draft PR: none. New PR CI: not applicable.

## Concrete contract conflict requiring a product decision

The current runtime has no Event date selector or date-filter state. `GezekHome.tsx` renders the content selector followed by location/undo controls and recommendations. `recommendAll(filter: 'event')` applies future-start eligibility, dismissal and the free-budget hard gate; it does not filter by Today/Tomorrow/Weekend.

`docs/PRODUCTION_HOME_DESIGN_CONTRACT.md:9` explicitly says category mockup chip rows are decorative and are not new recommendation/filter requirements. The new request assumes an existing Event date context, while Figma `974:4327` displays Today/Tomorrow/Weekend with Today selected. A functional implementation therefore needs a decision about whether those chips become real constraints in this PR and whether `no_current_catalog` is global or date-scoped. No such decision was inferred or implemented.

Exact reproducible scenario if those chips become functional:

- Now: 2026-10-13 12:00 Europe/Istanbul.
- Catalog: nine verified upcoming production Event records; earliest starts 2026-10-16 20:00 +03:00.
- Mood: Sakin; interests: Doğa + Sanat; budget: Fark etmez; group: 2 kişi; duration: 1–2 saat; dismissed: []; seed: 17.
- Today window: 2026-10-13 00:00 to 2026-10-14 00:00 +03:00: zero records.
- Tomorrow window: 2026-10-14 00:00 to 2026-10-15 00:00 +03:00: zero records.
- Conventional upcoming Saturday/Sunday window: 2026-10-17 00:00 to 2026-10-19 00:00 +03:00: zero records. This is an audit scenario, not an approved weekend definition.
- No load failure or loading, no dismissals, and no budget-caused exclusion. Global current catalog is nonempty. Under a strictly global `no_current_catalog` definition, none of the approved reasons matches these date-scoped empty arrays.
- Even changing budget cannot populate these selected date windows. Paid results must not leak into a free-budget view to imitate the Figma populated prototype.

Recommended decision: explicitly retain the existing unfiltered Event behavior in this PR, or approve functional date ranges plus a date-scoped meaning/copy for the informational empty state. If the state must mean globally empty inventory, provide an approved date-no-match design instead.

## Inspection findings

- Home Edit currently enters the existing mood/onboarding step (`App.tsx:466`); this was inspected, not changed.
- Preferences retain v5 storage schema and internal `Ücretsiz` compatibility value. Home already renders that value as Bedava.
- Existing saved/dismissed reducer is exclusive; restoration returns an item unsaved. Event-only restoration must use only eligible Event IDs and preserve all other interactions.
- Home keeps filter, recommendationRun/seed, previousBatch and origin scroll refs in App state. No Event date state exists to preserve.
- Embedded catalog is immediately usable. `loadBestCatalog` chooses safe cache/embedded fallback and returns remoteError without invalidating the fallback. `initializeDataBackbone` returns only its snapshot. No total-load failure or retry state was implemented.
- No new recommendation eligibility/scoring, artwork, catalog facts, persistence/Firebase schema or onboarding behavior was introduced.

## Live Figma inspection

Read design context for `974:4267` (sparse section metadata), `288:1879` (preference overview plus screenshot), `974:4327` (approved Event budget-empty screen plus screenshot), `288:2439` (budget edit sheet plus screenshot), and `974:6407` (connection ledger). Also requested the section screenshot. Remaining authoritative nodes were not used for implementation because implementation stopped at the contract conflict. No assets or Figma nodes were modified.

## Verification performed

- Repository discovery, Git status/branch/HEAD/remote checks: passed.
- `git fetch origin`: passed after sandbox escalation; initial restricted attempt could not write FETCH_HEAD.
- GitHub open-PR read: succeeded; only #57 returned.
- `node --import tsx /private/tmp/gezek-preference-event-audit.ts`: passed.
- Matrix covers 12,800 valid preference combinations per scope: 4 moods × 32 interest subsets × 5 budgets × 4 groups × 5 durations. Four scopes give 51,200 combinations on the unchanged production catalog.
- Every budget × every subset of the nine production Event dismissals checked for each scope: 10,240 cases total.
- 163,840 calls to the real recommendation entry point checked; no paid leakage under free budget; previous-batch fallback preserved nonempty supply.
- Current unfiltered Event matrix: 2,560 budget_no_match and 10,240 populated combinations. It has no unexplained zero-result combination in this production catalog.
- Proposed date windows: each has 12,800 unmapped results under the global-catalog interpretation, demonstrating the contract ambiguity. These date states are not reachable in the current production runtime.
- `git diff --check`: passed; no tracked changes.
- Checked package scripts: `npm run check` is absent; no script was invented.

## Verification not run

`npm ci`, `npm run typecheck`, `npm test`, `npm run test:catalog`, `npm run check:events`, `npm run check:accessibility`, `npm run test:stress`, `npm run check:performance`, `npm run check:recommendations`, `npm run check:assets`, and Android Expo export were not run: no implementation was made after the contract conflict. This audit does not claim the requested complete preference/catalog, resolver, editor, retry, focus or visual regression suite has been implemented or passed.

Browser evidence paths: none; no new screen was implemented or captured. Live Figma renders are design references, not implementation screenshots.

Native Redmi/TalkBack, Android Back/Close, budget Apply/Cancel focus return, retry/restore focus, large-text/footer clearance and reduced-motion validation all remain pending after implementation. No native, release-device or production verification is claimed.

## Audit artifacts

- Executable audit: `/private/tmp/gezek-preference-event-audit.ts`.
- Structured counts and scope data: `/private/tmp/gezek-preference-event-audit.json`.
- This report: `/private/tmp/gezek-preference-event-audit.md`.
