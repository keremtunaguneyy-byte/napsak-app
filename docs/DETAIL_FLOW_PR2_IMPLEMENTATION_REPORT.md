# Gezek Detail Flow PR 2 — Event, Idea and Saved routing

User authorization: pasted “GEZEK — DETAIL FLOW PR 2: EVENT + IDEA + SAVED ROUTING”, 2026-10-10. Authorizes normal commit, non-force push and one Draft PR; no merge or Onboarding. This supersedes historical PR 1 notes saying Event/Idea and PR 2 are unauthorized.

Repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`, origin `keremtunaguneyy-byte/napsak-app`. Initial status: clean `main`; HEAD and fetched origin/main both `30b96c059f242ec91d886e9480afb2491c31ab4a`. Required baseline ancestry passed. Branch: `codex/gezek-detail-event-idea`, created from fetched origin/main. No unrelated dirty/untracked files existed. Final commit/PR/CI identity is recorded by Git/GitHub and the delivery response; no self-referential commit hash is embedded here.

## Implementation and authority

Live Figma file `yTdAWr92ETyurlQQHNNqpi`, approved section `927:1769`: high-fidelity context/screenshots inspected for Event Default `933:2733`, Unavailable `933:2903`, No External `933:3172`; Idea Default `933:12422`, Dismissed `933:12597`, Large Text `933:12682`. Shared native host, existing tokens, local control assets and production ID artwork registry are reused. Figma sample title, district, dates and artwork are not catalog records: runtime uses the actual selected ID and its mapped Hero, with no fabricated district or mockup metadata. Source labels follow the user's explicit copy override: `Bilet bilgisine git` for catalog ticket-provider label (currently Bubilet), otherwise `Etkinlik bilgisine git`. No Figma edits or new media assets.

All Home recommendation card bodies now inspect internally with exact `kind + id + reasons`; neither Event inspection nor Idea inspection calls Linking or a native content Alert. Saved catalog entries all expose internal inspection through the same host, including URL-free Ideas. Only Event/Idea direct external entry controls were replaced; Plan/Place Saved actions and Saved styles remain unchanged.

Event content uses title, Istanbul-timezone structured start/end date/time, venue, note, price note, reason and source label. No district exists in the Event catalog, so none is invented. Past or invalid scheduled time uses the approved unavailable panel with disabled save/dismiss and separate exact source access. No end time means “başlangıç zamanı geçti”, avoiding an invented end instant. A dismissed resolved Event still exposes Restore. Event Maps reads only valid explicit coordinates or an exact city-matched publicly resolvable Place ID; current records provide neither, so they show no Maps. No venue/title lookup, search or calendar.

Idea content uses title, note, category, actual price and group-size metadata, reasons and optional exact actionLabel/actionUrl. No steps, durations, requirements, instructions or plan conversion are generated; durations already written in catalog notes are retained as catalog text. URL-free Ideas remain valid detail screens. A single external action is centered; text wraps, scroll/footer clearance is measured and large-font surfaces can grow. Bookmark Default/Disabled remain outline, Saved filled; Busy now renders the required spinner rather than the static glyph (shared control correction).

History, Back/Close, mounted Home/Saved context, invoking-control focus, external-return focus, seed/filter/scroll snapshot, atomic save/dismiss persistence, Restore, eight-second Undo cutoff, 180 ms exit and reduced-motion behavior are reused. No recommendation engine/eligibility/ranking/explanation/rotation, catalog data/IDs/relationships, artwork mappings, Firebase schema/rules/sync, persistence schema, release configuration, Home design, Onboarding, Ankara 101 or filter performance changes.

## Validation

| Command | Result |
| --- | --- |
| `git fetch origin` | Passed with elevated network/Git access after sandbox denied FETCH_HEAD write. Required baseline exact match. |
| `git merge-base --is-ancestor 30b96c059f242ec91d886e9480afb2491c31ab4a origin/main` | Passed, exit 0. |
| `git diff --check` | Passed, exit 0. |
| `npm ci` | Passed, exit 0; 1,183 packages, lockfile unchanged. Existing audit: 64 vulnerabilities (24 moderate, 38 high, 2 critical); dependency remediation excluded. |
| `npm run typecheck` | Passed, exit 0, including final production changes. |
| `npm test` | Passed, exit 0: 111 compiled tests + 88 TypeScript tests = 199. |
| `node --import tsx --test tests/detail-flow.test.ts` | Passed, 16 targeted tests; also included in final npm test. |
| `npm run check:accessibility` | Passed, exit 0; source contract, not TalkBack evidence. |
| `npm run check:performance` | Passed, exit 0; 5,000 calls, p95 9.504 ms < 25 ms, checksum 23,624. Local JS only. |
| `npm run test:stress` | Passed, exit 0; 2,560 recommendation scenarios, 640 Experience scenarios / 192 rotation checks; zero reported mismatch/duplicate/diversity issues. |
| `npm run test:catalog` | Passed, exit 0; 1 city, 178 Places, 52 Experiences, 14 Events, 140 Ideas, 12 guides. |
| `npm run check` | Not run: script absent, as verified in package.json; user requested only if present. |
| `CI=1 npx expo export --platform android --output-dir /tmp/gezek-detail-pr2-android-final` | Passed, exit 0; final Android Hermes bundle exported. Earlier export also passed. |
| `npm run check:events` | Expected baseline exit 1: 2 upcoming / 12 expired, 14 stale, `stale_verification, insufficient_upcoming_events, short_catalog_horizon`. |
| `git archive origin/main` to `/tmp/gezek-pr2-baseline`, linked existing node_modules, `npm run check:events`; `cmp` against branch output | Same exit 1; output byte-for-byte identical (`cmp` exit 0). Catalog unchanged. |
| `GEZEK_BROWSER_MODULES=/tmp/gezek-native-preview/node_modules GEZEK_BROWSER_OUTPUT=/tmp/gezek-detail-pr2-browser node scripts/buildDetailBrowserFixture.cjs` | Passed; optional external RN Web tooling, no dependencies added to repository. |
| `GEZEK_BROWSER_MODULES=/tmp/gezek-native-preview/node_modules GEZEK_BROWSER_OUTPUT=/tmp/gezek-detail-pr2-browser node tests/detail-event-idea-browser.cjs` | Passed, 44 checks, zero page errors at 393×852 and 412×915. |
| `GEZEK_BROWSER_MODULES=/tmp/gezek-native-preview/node_modules GEZEK_BROWSER_URL=http://127.0.0.1:8773 GEZEK_BROWSER_OUTPUT=/tmp/gezek-detail-pr2-browser node tests/detail-browser-regressions.cjs` | Passed, 44 checks, zero page errors; accepted Plan/Place cycles, Back/Close, metadata, bookmark states and Undo animation/reset/cleanup/reduced motion. |

Browser service adapters stub storage/backend/location/Linking, status bar and safe-area services. All test data is confined to fixtures; current real catalog supplies Home/Saved records. Structured Place mapping fixture adds a Place ID only in memory. Large text uses a 1.8 Text/fontScale shim, not an Android OS setting. Selected screenshots visually inspected; local mapped Hero SVGs render nonempty and decorative; no technical IDs/filenames are visible. Saved Idea dismissal removes saved status in the actual App persisted snapshot; Undo/Restore return unsaved and consume notices. Event and Idea exact external URLs and active-app focus return pass. Home return preserves filter, card identity, scroll and unchanged recommendation-batch events. Router tests cover seed snapshot, duplicate titles and exact kinds/IDs. Plan/Place regression suite covers nested focus/history and controlled-clock eight-second/180 ms behavior.

Initial browser attempts encountered sandbox Chrome launch restrictions and two incorrect test selectors (preference button matched instead of tab); corrected test selectors and elevated local Chrome execution passed. One repeat launch approval review timed out; the allowed retry passed. These are harness/execution issues, not product results.

## Remaining acceptance and delivery

No native/device, TalkBack, OS process restart, signed-release or live production validation was performed. Firebase Rules tests were not run because no rules/schema/backend implementation changed. Release checks are outside this detail-flow change. Existing Event freshness and Home native filter delay remain unresolved. No production systems were modified.

Redmi acceptance checklist:

- Home Event and both URL/URL-free Idea → detail; inspection opens no external app; explicit action opens exact catalog destination and returns to the same detail.
- Saved Event/Idea → Back and Close return to Saved with scroll/focus; Plan/Place nested Back and root Close still work. Home filter/seed/scroll remain stable.
- Upcoming, expired, missing/loading, dismissed and no-external states; current Events have no Maps. Long Turkish titles, OS large text and last content clearing fixed footer; safe areas/status bar.
- Outline/filled/busy/disabled bookmark; save/dismiss exclusivity; Saved removal, Restore, Undo before eight seconds, expiry persistence, new dismissal reset and reduced motion.
- Native hardware Back, TalkBack entry/return focus and decorative-artwork exclusion; state across process restart.

Normal commit and non-force push are authorized; one Draft PR, no merge. Wait for CI and report actual results. Next step is Redmi/TalkBack acceptance, then user review; stop this branch after Draft delivery and do not start Onboarding.

## Changed files

- `App.tsx`
- `src/detailFlow.ts`
- `src/components/gezek/DetailHost.tsx`
- `scripts/buildDetailBrowserFixture.cjs`
- `tests/detail-flow.test.ts`
- `tests/detail-event-idea-browser.cjs`
- `tests/detail-browser-regressions.cjs`
- `docs/START_HERE.md`
- `docs/STATUS.md`
- `docs/DECISIONS.md`
- `docs/DETAIL_FLOW_PR2_IMPLEMENTATION_REPORT.md`
- `docs/evidence/detail-pr2/event-idea-results.json`
- `docs/evidence/detail-pr2/redmi-regression-results.json`
- `docs/evidence/detail-pr2/event-default-393.png`
- `docs/evidence/detail-pr2/event-default-412.png`
- `docs/evidence/detail-pr2/idea-default-393.png`
- `docs/evidence/detail-pr2/idea-default-412.png`
- `docs/evidence/detail-pr2/event-long-393.png`
- `docs/evidence/detail-pr2/idea-long-412.png`
