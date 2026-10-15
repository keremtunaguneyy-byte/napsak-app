# Production Saved / Kaydedilenler — implementation and verification

## Acceptance reconciliation — 15 October 2026

Re-fetched and re-audited before the authorized merge: local/remote/PR head `d1b611c38eb665f35711ce546264a5661fa5529f`; base/fetched main `056ad19faf63107766408867972a76521c7ec134`. PR #77 was open Draft, MERGEABLE/CLEAN, with exactly the expected 60 files, successful exact-head App Quality and Security Rules, zero reviews and zero review threads (no additional thread page). No unexpected code/design changes, tracked local changes or conflicts were found. The sole untracked directory remains `src/firebase/BA_4bit.sv/` and is preserved.

User-reported exact-head Redmi acceptance: mixed list; saving Ankara 101/editorial content; independent opening/Unsave; final removal → Empty; recommendation Detail and editorial Android Back → Saved; restart persistence; normal layout and fixed-navigation clearance. This is user device evidence, not a new agent-run test or signed-release evidence.

Explicitly deferred native checks: (1) expired Event row, absent from the active catalog; (2) real Android OS large-text mode; (3) TalkBack announcing row body and “Kaydı kaldır” as separate actions. Signed-release acceptance remains separately unverified. The simple/artwork-free Ankara 101 Saved row is deferred to Ankara 101 production visual closure, with no arbitrary artwork added to #77.

This reconciliation changes only `docs/START_HERE.md`, `docs/STATUS.md`, `docs/DECISIONS.md` and this report. `git diff --check` and staged diff validation apply; no runtime code changed, so local code/browser/export checks are not rerun for this documentation-only commit. New exact-head GitHub CI is required before merge and will be reported with the actual commit/run identities. The user now authorizes marking #77 ready and a normal merge commit, conditional on passing CI and a final clean merge/review audit. This supersedes the original Draft/no-merge instruction below for #77 only. Home filter changes belong exclusively to the next PR. Final merge SHA is verified from Git/GitHub after merge, not predicted here.

User authorization: attached “GEZEK — PRODUCTION SAVED / KAYDEDİLENLER IMPLEMENTATION”, 15 October 2026. Normal commit, non-force push and one Draft PR targeting main are authorized; merge is explicitly excluded.

## Repository audit

Verified path: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`; remote repository `keremtunaguneyy-byte/napsak-app`. Initial branch `main`; HEAD and fetched `origin/main` both `056ad19faf63107766408867972a76521c7ec134`. GitHub confirms PR #76 merged with that merge commit. Initial tracked tree was clean; the sole untracked directory was `src/firebase/BA_4bit.sv/`. It remains untouched, unstaged and excluded from the commit; SHA-256 comparison of both existing Verilog files passes. No reset, clean, stash, rebase, amend or force push was used. The only open PR at audit was #57, `codex/experience-primary-precedence`; it was not modified.

Local and remote branches were inspected before implementation. No local or remote `codex/gezek-production-saved` existed. That branch was created directly from fetched `origin/main`. `evidence/production-saved/initial-branches.txt` records the branch inventory immediately after creation; its new branch entry is not an additional pre-existing branch. Commit/PR identity and exact-head CI are reported in the delivery response and GitHub rather than embedding a self-referential final SHA here.

## Live design authority and assets

[Figma Production Saved / Approved v1](https://www.figma.com/design/yTdAWr92ETyurlQQHNNqpi?node-id=1026-5886), section `1026:5886`, is the authority. The complete section hierarchy, component descriptions/variant ledger, responsive frames, text and prototype destinations were read without modifying Figma. Sparse section metadata was followed by high-fidelity component/screen context and screenshots. Historical Saved frames were not implementation sources.

Consumed families: Compact Unsave `1027:5902` (Saved/Pressed/Busy/Disabled `5886/5890/5894/5898`); Status/Metadata `1027:5913` (Default/Expired, Normal/Large); Content Row `1027:6132` (Plan `5914/6023`, Place `5933/6042`, Event upcoming `5951/6060`, expired `5977/6086`, Idea `6004/6113`); Editorial Row `1027:6194` (Guide `6133/6167`, collection `6149/6176`, route `6158/6185`); Empty `1027:6195`; List `1028:6702`, all ten state variants; Shell `1028:7306`, four size/text variants `6703/6853/7006/7153`.

Responsive/state reference frames `1032:7173` through `1032:11112`, including actual LargeText `1032:8344` and `1032:10431`, and long-list-end QA `1037:18977` were inspected. Prototype Plan/Place/Event/expired Event/Idea anchors `1036:9119/9193/9274/9349/9389`, existing editorial reader contracts `1036:9461/9475/9489`, and Home destination `1036:9503` confirm the routing boundary. Protected Detail families, Home masters, Bottom Navigation `4:92` / Item `4:91` were reused, never recreated or changed in Figma.

Existing production tokens, Plus Jakarta Sans, BrandLogo, local header SVG, bookmark SVG, chevron and stable-ID Compact artwork resolver are reused. Saved applies the approved header's 0.32 opacity. No new SVG/image assets, photography, title-derived artwork mappings, production URLs or catalog facts were introduced. BrandLogo receives an optional font-scaling flag only for the fixed Saved brand mark; its other callers keep the existing default. Shared bottom-navigation visuals remain existing production visuals; the raw Saved accessibility count is removed everywhere.

## Runtime behavior

- All seven entry shapes resolve in one mixed newest-first list: Experience, Place, Event, Idea, Guide section, `collection-ankara-classics`, Insider route. Re-save moves an item to the top. Unknown/deleted/unresolvable IDs are omitted, remain unchanged in storage and produce no tombstone. Zero resolved rows produces Empty even if persisted IDs remain.
- No visual or accessibility Saved count exists; the internal append-order Saved array is unchanged. Guide collection chapter metadata is catalog-backed and is not a Saved count.
- Each row has one opening body and a sibling independent 44×44 Unsave action. Removing a row never opens it. Next row receives focus, or the previous row for removal at the end; final removal focuses the Empty heading. List-end padding is 24 px above the existing fixed navigation. Growing text has no line limit; recommendation rows stack Compact art above copy at large font scale.
- Row metadata uses the actual record. Saved Plan duration is the approved compact minute-range presentation of unchanged catalog minutes. Existing distance/Maps/source/long-note presentation is available through the existing Detail Host instead of being duplicated in Saved rows. Home and Detail distance behavior is unchanged.
- Upcoming Events show their structured Istanbul date/time and venue. A currently running Event uses the neutral Event label. Expired Events remain Saved and explicitly say “Başlangıç zamanı geçti”; invalid time explicitly says information is unavailable. Both use the existing Event unavailable Detail behavior; there are no live availability claims or fabricated offline/loading states.
- Recommendation body opens the existing `kind + id` Detail Host. Saved snapshots its own scroll, while Home keeps its existing snapshot path. Root Back/Close returns to Saved; nested Plan → Place Back returns to Plan; Close leaves the entire host. Filter, seed and recommendation identities stay unchanged.
- Guide IDs open their exact existing chapter. Collection opens the existing Klasikler reader. Route resolves its exact ID before opening the existing Insider reader/map/save controls. Reader Back (including its secondary Back action) and Android hardware Back return to Saved, preserving the calling ID and viewport. An open contents panel consumes one hardware Back before leaving the reader. No Preparing/onboarding route is involved. Existing first chapter's display title remains “Kale’den Ulus’a: Şehrin ilk katmanı”; Saved correctly uses the catalog title. Ankara 101 visuals are outside this PR.
- Saved remains mounted behind editorial readers. Hidden scroll events cannot overwrite its snapshot. Return synchronizes the restored offset even when native/web does not emit a new scroll event for an unchanged offset; focus then reapplies that viewport. This addresses a repeated-reader large-text regression found during browser validation.
- Unsave flows through the existing reducer and persistence effect. Save/dismiss exclusivity, dismiss-removes-save and restore-unsaved behavior, persistence v5, Firebase contracts, migration and remote synchronization are unchanged.

Page-title-first focus/reading order, visible row order, kind/status labels, hidden decorative artwork, independent labeled actions and selected bottom-tab semantics are implemented. Existing Detail Host modal accessibility and design remain intact. Native TalkBack behavior is pending; browser accessibility-tree adapters are not native evidence. Transitions added here are instant, including reduced motion.

## Verification

Final command results are recorded below. Historical runs and superseded pre-fix exports do not validate the delivered tree.

| Command | Result |
| --- | --- |
| `git fetch origin`; `git status --short`; `git branch --show-current`; `git rev-parse HEAD`; `git rev-parse origin/main`; `git branch -avv`; `git remote -v` | Passed; baseline above, branch inventory inspected. |
| `gh pr list --state open --json number,title,headRefName,baseRefName,url`; `gh pr view 76 --json number,state,mergedAt,mergeCommit` | Passed; #76 merged, #57 only open at audit. |
| `npm ci` | Passed, 1,183 packages; lockfile unchanged. Existing audit reports 64 vulnerabilities (24 moderate, 38 high, 2 critical); no dependency remediation in this scope. Initial sandbox-network attempt failed; authorized network retry passed. |
| `git diff --check` | Passed. |
| `npm run typecheck` | Passed. |
| `npm test` | Passed: 111 compiled + 187 TypeScript tests = 298; includes 8 new Saved tests. |
| `node --import tsx --test tests/detail-flow.test.ts tests/saved.test.ts` | Passed, 24 focused tests; also included in full suite. |
| `npm run test:catalog` | Passed: 1 city, 178 Places, 52 Experiences, 9 Events, 140 Ideas, 12 Guides. |
| `npm run check:events` | Passed: 9 upcoming, 0 expired/stale; healthy current catalog. Expired UI is tested with an in-memory fixture only. |
| `npm run check:accessibility` | Passed: 13 source files. Source contract, not TalkBack acceptance. |
| `npm run test:stress` | Passed: 2,560 general + 640 Experience scenarios; zero duplicates, mismatches/diversity failures. |
| `npm run check:performance` | Passed: 5,000 calls, p95 7.955 ms under 25 ms; checksum 22,308. Local JavaScript measurement only. |
| `npm run check:recommendations` | Passed: 15 deterministic scenarios; zero objective invariant failures. |
| `npm run check:assets` | Passed: 392 content records, 125 artwork families, 375 responsive variants, 46 contextual icons, 11 UI exports. |
| `npm run check` | Not run: no such script exists. |
| `npm run test:rules`; `npm run check:release` | Not run: no rules/Firebase/release change; this task does not close release-readiness gates. |
| `GEZEK_SAVED_FIXTURE=true GEZEK_BROWSER_MODULES=/private/tmp/gezek-artwork-web-deps/node_modules GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-saved-browser node scripts/buildDetailBrowserFixture.cjs` | Passed; external RN Web tooling, no repository dependency changes. |
| `GEZEK_BROWSER_MODULES=/private/tmp/gezek-artwork-web-deps/node_modules GEZEK_BROWSER_OUTPUT=/private/tmp/gezek-saved-browser node tests/saved-browser.cjs` | Passed: 36 scenario groups, zero page errors; both requested sizes × normal/1.8 text. Visually inspected mixed, empty, expired, long-title, one-item and long-list/Unsave outputs. |
| `CI=1 npx expo export --platform android --output-dir /private/tmp/gezek-saved-android-final-verified` | Passed: final Android Hermes bundle exported. |
| `CI=1 npx expo export --platform android --no-bytecode --output-dir /private/tmp/gezek-saved-android-readable`; `npm run check:assets:android -- /private/tmp/gezek-saved-android-readable` | Passed: 9 Events, 27 layout references, 12 unique assets; exact bundled SVG XML verified. Initial invocation incorrectly used `--export-dir`; corrected to the script's positional directory contract. |
| `git diff --cached --check` | Passed after explicitly staging only this task’s 60 files, excluding the unrelated Verilog directory. |
| `shasum -a 256 -c /tmp/gezek-saved-protected-sha.txt` | Passed: both pre-existing Verilog files unchanged. |

Browser fixture runs the actual App/Saved/Detail components, real embedded catalog, reducer and navigation. It stubs backend, local service entry points, location, Linking, fonts/status/safe-area APIs. Browser localStorage reload evidence is paired with real serialization/restart unit coverage; it does not establish Android process-restart persistence. Large text is a 1.8 scale/fontScale simulation. Both 393×852 and 412×915 run normal/large text; real dates and IDs remain runtime sources. Long titles and expired times exist only in controlled test memory. Safe-inset defaults are zero for direct Figma comparison, with native inset behavior retained in production.

Initial regression attempts exposed stale source-test selectors after extraction, incorrect Detail accessible-name selectors, and a browser adapter that did not translate native decorative-hidden props. Those fixtures were corrected. A real hidden-Saved scroll-snapshot regression was fixed and rechecked. Complete final evidence and visual review are listed in `evidence/production-saved/results.json` and the screenshot files beside it; no earlier failed run is presented as final validation.

## Scope, inventory and pending native acceptance

Exact inventory: [SAVED_CHANGED_FILES.txt](SAVED_CHANGED_FILES.txt). No recommendation eligibility/scoring/diversity/rotation, duration selection, Bedava gate, location/preflight, catalog/IDs/relationships, artwork mapping, Firebase/persistence schema, Home design, onboarding, Preference Editor, Event empty-state design, Detail Host design or release configuration changed. No production operation, signed release or merge occurred.

Current device acceptance and deferred checks are recorded in the reconciliation section above. The original implementation-stage checklist is superseded by that user-reported acceptance; do not infer untested TalkBack, OS large-text, expired Event or signed-release results from browser evidence.

Recommended next step: after passing CI on the documentation update and a clean merge/review recheck, execute the user's authorized normal merge workflow for #77. Begin the separate Home filter PR only after fetched main and fast-forwarded local main match. No runtime behavior changed in the acceptance update.
