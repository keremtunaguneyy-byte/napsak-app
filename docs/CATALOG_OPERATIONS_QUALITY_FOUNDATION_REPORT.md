# Catalog operations quality foundation

On 18 November 2026, all nine embedded Ankara Events had passed their start time and exceeded the seven-day verification window. A user selecting Events could receive zero results across all 25 measured budget and interest combinations. The clearest evergreen gap was the short, free Experience selection. Both Kahve and Etkinlik produced zero results.

The feature branch started from freshly fetched `origin/main` at `c4ec5892401bab9f53fe8b1fe78f09939762de97`. The selected worktree was clean and detached at that SHA, the canonical checkout was on the same main, and GitHub returned zero open PRs. The protected paths were excluded from the canonical status check. Changes are confined to Node tooling, tests and documentation.

## Reproduce the evidence

From the repository root, with locked dependencies installed, run

```sh
npm run audit:catalog-operations -- 2026-11-18T00:00:00+03:00
```

The clock argument is mandatory. The default output directory contains the two reviewed files. Pass a second argument such as `/tmp/gezek-catalog-review` to explore a different instant without overwriting them. Schema 2 writes both files before returning exit 1 for an ambiguous Saved destination or a failed approved Guide contract. Other data findings are reported in the outputs. The separate Event-health command enforces its own operational thresholds.

Read the [measured gaps and inventory](evidence/catalog-operations-quality/summary.md) first. The [canonical JSON](evidence/catalog-operations-quality/audit.json) gives the full per-kind distributions, underfilled preference combinations, identity leads, all Event dates, and cache and media results.

## How to interpret the measurements

| Area | Population and method | Limits |
|---|---|---|
| Lifecycle | Each embedded item is checked with its production row validator. Place and Experience eligibility use the central policy with validated links. For Events the start instant must be strictly in the future. Ideas use the valid global inventory. Guide eligibility is null and editorial resolution is measured separately. | Counts describe the unpersonalized embedded inventory. Stale verification remains an operations issue. End times are optional and can have their own errors. The reference clock requires a valid zoned ISO instant. Event supply uses the production date parser for explicitly zoned occurrence strings. The JSON separately flags noncanonical dates and ambiguous or invalid starts. |
| Geography | Turkish-normalized catalog district labels are counted across the full slice. The existing coordinate audit checks the Ankara rectangle, every ordered point, exact Place coordinates, city and first anchor. The additional checks cover repeated stops anywhere in the array and identical Place coordinates. | District labels can include neighborhoods or editorial areas such as Beytepe or Merkez. The repository has no authoritative administrative crosswalk. Event and Idea district fields are unmodeled. The ordering authority is the points array. External geocoding and walking feasibility require separate evidence. |
| Taxonomy | Schema-valid records contribute to category, mood, interest, price, duration and declared group counts. Interest cells count distinct records. Experience tags combine primary and secondary interests. The JSON labels the five columns of every intersection matrix. | Inventory includes expired and inactive records. Dimensions use recorded values, including exact price levels and disjoint bands of maximum duration. Legacy Ideas have no structured duration. Guide reading time and inferred Place group fit are outside activity-duration and explicit-group metrics. |
| Preference supply | 200 calls to public `recommendAll` use the default policy, seed 71, a five-item limit, one selected interest, all five budget choices, no history/location/mood/group filter, and the explicit clock. Experience also crosses all five duration choices. Every empty or partial cell is retained, grouped across budgets with the same result count. | Paid budget choices are soft signals. Event interests influence order. Idea discovery can fill a batch with unselected interests. Batch size measures supply under these inputs. Human usefulness, demand, repeat visits and variation across seeds require different evidence. |
| Identity | All five kinds share a public ID collision check. Saved has a second check over the effective public catalog, approved and other supplied Guides, the classics collection and the legacy route inventory. It queries the production resolver for the winning destination of each collision. Titles use the production Turkish identity normalizer. A near pair needs different normalized titles, at least three common distinct tokens and intersection/union of at least 0.75. Cross-kind pairs are included. | A short title, spelling variation or shared venue can escape or trigger a heuristic. A Guide and Place can legitimately share a title. Shared coordinates or sources warrant human review before any editorial action. |
| Evidence quality | The 251 source-bearing records contribute record verification dates. URL references include linked Experience sources and optional Place provenance. HTTPS syntax, hostname, credentials, duplicate references, host counts and verification dates are checked offline. Fragments are omitted from URL identity and queries are retained. | Ideas have no evidence field. First-hand provenance can omit its URL. A homepage is a specificity review lead. The audit cannot establish availability, accuracy, cancellation, price, attribution or rights from a URL. Experience source dates are derived from linked Places. |
| Freshness | Age begins at midnight in Ankara on the stated date. Event health reuses the production seven-day threshold. Other bands describe evidence age. The >90-day count for reservation-bearing Experiences identifies a human verification queue. | The 90-day band introduces no expiry rule. A recent Place source alone cannot confirm reservation terms or an entire multi-stop plan. |
| Artwork | Hero, Square and Compact exercise the production resolver for each recommendation record. An artwork key whose second path segment equals the item ID denotes item-specific art. Other artwork uses families. Neutral and verified media are separate outcomes. Resolved SVGs and icons are checked against bundled XML and source files. Approved Guide IDs and media keys come from the same presentation registry as the production reader. The audit parses the exported Metro binding object with the TypeScript AST and verifies the referenced file against the per-Guide editorial master path and SHA-256 in the approved asset manifest. | Coverage counts inventory records including expired Events. Historical Event mappings are retained for compatibility. Visual approval, native decoding and rights review are separate. |
| Compatibility | Embedded metadata is read from the local repository adapter. Runtime validation, all raw city owners, version grammar, comparator results and a write/read through the real cache functions use local data and in-memory storage. | The tests exercise the embedded contract. Remote payloads, installed device caches, client rollout and production rollback were outside this task. |

Severity tiers order measured signals. Tier 1 includes broken catalog, date or reference contracts. Tier 2 includes empty scenarios and missing Guide media. Tier 3 includes partial supply, mapping gaps and editorial source leads. Within each tier, descending affected share comes first, then area and metric label. The denominator belongs to each row. Frequency in this grid has no implied traffic weight.

## Findings and follow-up backlog

1. **Event freshness.** 0/9 Events are upcoming and 9/9 have stale verification. Eight have no end time, which the schema permits. Follow the Event operations runbook to verify occurrences, dates, venues and source pages. A human should decide which records to retire or replace and review staged artwork before publishing.
2. **Catalog expansion.** 35/52 Experiences start in Altındağ or Çankaya. Only 5/52 have a maximum duration of 60 minutes. Only 1/52 is both free and tagged Kahve across all durations. Of 125 Experience scenarios, 2 were empty and 35 partial. Free Kahve also yielded 0/5 Places and free Lezzet yielded 4/5. Review the district × interest data alongside independently sourced candidates. Evidence must support the time, price and activity before adding a record.
3. **Source verification.** 141/251 source-bearing records had only host-root links. Of 12 plans with a recommended or required reservation, 11 had record evidence over 90 days old. Of 363 valid URL occurrences, 64 distinct URLs appeared on multiple records. Review the three identical-coordinate Place groups, the Guide/Place title collision and the two near-title pairs alongside source identity. The audit found zero duplicate stable IDs among 391 records.
4. **Media and artwork.** 1,137/1,137 recommendation record/layout calls resolved to bundled artwork, and 12/12 Guides had a local media binding. Thirteen historical Event mappings point outside the current inventory. Retain compatibility and review the mapping for each proposed Event replacement.
5. **Staging, publication and rollback.** Version `2026-10-12.1` passed the schema-v3 parser and the v3 cache round-trip. A compatible cache can win on equal or newer version. Remote refresh requires a strictly newer compatible version. The seed script upserts per collection in batches and writes metadata after the collections. Interrupted publication can leave partially updated documents, and omitted remote IDs survive an upsert. A lower version alone cannot roll back clients with newer caches. Design a staged manifest, explicit retirement policy, approval step and forward-version rollback rehearsal before choosing a publishing architecture.

All 52 routes and 71 ordered stops passed the coordinate and link checks. The measurements support editorial investigation. Decisions about geographic remapping, new content, deletion or publication remain with the reviewer.

## Adversarial review corrections

The previous reviewed head was `072f7bbc5555ef8cf94df658397ce7ba1c4d7f4c`. The independent review reproduced two false passes and two surviving test mutations. The corrections are confined to offline tooling and tests.

| Review finding | Cause, correction and evidence |
|---|---|
| F1 · Saved | The five catalog families omitted two destinations sharing the same persisted string keyspace. The audit now mirrors the publicly resolvable inputs from App.tsx in production order and calls `resolveSavedEntries` to identify the selected record. Within a content/Guide/route map the last duplicate wins. Across maps the lookup order is catalog, Guide, classics, route. Kind-qualified artwork keys and city metadata are separate namespaces. Both schema-valid reserved-ID mutations return `saved_destination_collision` with ID, titles, families and selected record. Current result is 0 collisions across 393 destinations. |
| F2 · Guides | A regex matched comments and the catalog under test supplied the denominator. The audit now starts from `PRODUCTION_GUIDE_IDS` and `GUIDE_PRESENTATIONS`, checks literal bindings in the exported registry, and reads the approved master manifest. Each expected ID records catalog presence, media key, binding, status, fallback and issue codes. Extra catalog IDs and binding keys are listed separately. All 12 approved IDs resolve to their explicit masters. |
| F3 · Event threshold visibility | The priority table only included expired and stale counts. Markdown now includes every production Event health issue and its actual/required threshold when available. Five free Events one day ahead fill all 25 batches while still showing `short_catalog_horizon`. |
| F4 · Clock and route tests | The old clock fixture was already expired and the route fixture changed several fields together. A fixed 2040 wall clock and two injected instants 1 ms apart require Event supply to change from 25 full to 25 empty. The isolated route test alters only stop 2 latitude with the first anchor intact. |
| F5 · Timestamp parity | A private fractional-second limit discarded valid zoned inputs before ranking. Zoned occurrences now use the production parser for supply, with separate syntax diagnostics. The clock fixture uses four fractional digits. Zone-free starts remain ambiguous across hosts and are reported as invalid or unzoned. |
| F6 · Route labels | Matching coordinates can belong to different Places. Each stop label is checked against the linked Place name and aliases with the production identity normalizer. A label mismatch is an editorial review lead. Fully consistent but incorrect editorial intent still requires human review. |
| F7 · Malformed evidence | Nested source collection assumed each entry had URL/date properties. Malformed lists or entries now produce keyed diagnostics while independent measurements complete. Module construction errors before the embedded snapshot exists are outside this audit boundary. |
| F8 · Snapshot pin | A harmless copy edit invalidated a full-catalog hash. Import immutability and all four default recommendation batches are compared before/after auditing. Evidence regeneration and the Git diff against main provide separate release-specific parity checks. The digest recorded on the reviewed base was `66cd7b2fbeab3592d2f8dc8720aaea5732b9d9cc2b8940cf2521ea444d9515da`. |
| E1 · External evidence | Live source correctness, device image decoding, real installed caches and editorial intent require separate human or device verification. |

Guide issue codes distinguish `guide_catalog_missing`, `guide_media_binding_missing`, `guide_media_unresolved` and `guide_media_alternate_asset`. An intact binding reports `guide_media_explicit`. A present Guide without its verified explicit master also reports `guide_media_fallback`. This flag identifies a placeholder or unapproved substitute at audit time. Actual decode and fallback behavior on a device require native acceptance.

### Mutation proof

The following deliberate changes ran in a disposable copy. Each data mutation wrote diagnostic evidence and exited 1. Each code mutation failed the named focused regression test. After restoration, the CLI returned 0 and both files matched the reviewed outputs.

| Mutation | Observed result |
|---|---|
| Two schema-valid Ideas take the classics and legacy route IDs | Both effective keys failed, with each Idea selected by the real Saved resolver. |
| Drop the Ankara Kalesi Guide | 11/12 explicit complete, exact missing ID reported. |
| Comment out its explicit media binding | 11/12 complete, missing binding and fallback reported. Deleting the property also fails the fixture. Equivalent quote styles pass. |
| Point its binding to an absent asset | 11/12 complete, unresolved media reported. Substituting another Guide’s real master separately failed as alternate artwork. |
| Omit the supplied clock or replace it with wall time | Both variants failed the public Event supply test. |
| Restrict coordinate equality to stop index zero | The isolated stop 2 test failed. |
| Change the inclusive duplicate threshold from ≥3/4 to >3/4 or weaken it to ≥2/3 | Both variants failed the stable-ID/title test at their respective boundaries. |

## Validation

| Command or check | Result |
|---|---|
| `npm ci` | The reviewed head already had a locked install on Node 22.18.0. The correction reused it after `npm ls --depth=0` passed. No manifest or lockfile changed in the correction. |
| `npm run audit:catalog-operations -- 2026-11-18T00:00:00+03:00` | Five CLI processes matched both artifacts across UTC twice, Europe/Istanbul, America/Los_Angeles and Pacific/Kiritimati, with simulated wall clocks in 2000 and 2040. SHA-256: JSON `579dfb11e612d82914418fd07b0aa53a93e547da81d8bec0b9eda9ea28dc0755`, Markdown `755b9395df7651b3e57a0e3980be04548558257096b5468cda36c6bb0f536920`. |
| `npm run typecheck` | Passed. |
| `node --import tsx --test tests/catalog-operations.test.ts` | 14/14 passed, including independent-process CLI regeneration, effective Saved collisions, Guide bindings, clock boundaries, non-first stop identity and malformed evidence. |
| `node --import tsx --test --test-name-pattern='stable IDs' tests/catalog-operations.test.ts` | Changing the inclusive near-title boundary to exclusive made its test fail. Restoring the original code turned it green. |
| Existing coordinate audit CLI with `--write` in a temporary directory | 52/52 passed. Both historical standalone outputs matched tracked bytes. |
| `npm test` | 394/394 passed across the two test runs (111 and 283). |
| `npm run test:catalog` | Local embedded parity passed across five content kinds and one city. |
| `npm run check:events` | Exit 1 in a fresh archive of fetched main and on the corrected feature tree. Identical counts and codes, `stale_verification` and `no_upcoming_events`. |
| `npm run check:accessibility` and `npm run check:assets` | Passed. Source contract covered 16 files. Asset check covered 392 mapped IDs, 125 families and 375 variants. |
| `npm run test:stress` | Passed 2,560 Place and 640 Experience scenarios. |
| `npm run check:performance` | Passed, p95 7.483 ms against the 25 ms budget, 5,000 iterations. |
| `npm run check:recommendations` | Golden recommendation quality baseline passed, 15 scenarios. |
| `npm run check:build -- --profile=preview`, `npm run check:observability`, `npm run check:release` | Passed. Release check confirmed the existing eight open blockers. |
| `npx expo export --platform android --no-bytecode --output-dir dist-artwork`, `npm run check:assets:android -- dist-artwork`, `npx expo export --platform android --output-dir dist` | Both Android exports passed. All 27 Event layout references resolved to the expected 12 unique bundled SVGs. |
| `git diff --check` and `git diff --cached --check` | Passed before commit. The staged inventory was checked against the list below. |

Physical-device testing and connected Firebase operations were outside this offline tooling change. The Draft PR provides the exact-head GitHub App Quality and Security Rules results.

## Changed-file inventory

The PR contains 18 files relative to main. The correction changes 13 of those relative to `072f7bb`. The five carried forward from the previous head are `package.json`, `docs/START_HERE.md`, `docs/STATUS.md`, `scripts/catalogOperations/compatibility.ts` and `scripts/catalogOperations/coverage.ts`.

| Path | Purpose |
|---|---|
| `package.json` | Register the CLI and include focused tests in the ordinary suite. |
| `scripts/auditCatalogOperations.ts` | Validate the explicit clock, load the local repository and write evidence. |
| `scripts/auditExperienceStartCoordinates.ts` | Keep imports read-only and verify every stop label against its linked Place name or aliases. |
| `scripts/catalogOperations/artwork.ts` | Count actual resolver outcomes and verify local asset references. |
| `scripts/catalogOperations/compatibility.ts` | Measure schema, metadata, city ownership, cache and version behavior. |
| `scripts/catalogOperations/coverage.ts` | Measure taxonomy intersections and actual underfilled preference selections. |
| `scripts/catalogOperations/guideMedia.ts` | Reconcile approved IDs, actual Metro bindings and per-Guide master checksums. |
| `scripts/catalogOperations/savedDestinations.ts` | Detect effective Saved collisions and identify the production resolver’s winner. |
| `scripts/catalogOperations/health.ts` | Measure lifecycle, Event dates and geographic integrity. |
| `scripts/catalogOperations/records.ts` | Adapt five catalog kinds and implement ordered identity, date and duplicate checks. |
| `scripts/catalogOperations/report.ts` | Assemble the evidence, order gaps and render Markdown. |
| `scripts/catalogOperations/sources.ts` | Measure URL quality, reuse and verification age. |
| `tests/catalog-operations.test.ts` | Exercise deterministic output, baseline parity and negative fixtures. |
| `docs/evidence/catalog-operations-quality/audit.json` | Canonical machine-readable evidence. |
| `docs/evidence/catalog-operations-quality/summary.md` | Generated human-readable results. |
| `docs/CATALOG_OPERATIONS_QUALITY_FOUNDATION_REPORT.md` | Method, findings, validation and follow-up backlog. |
| `docs/START_HERE.md` | Project-memory entry point for operating the audit. |
| `docs/STATUS.md` | Record the measured state and the open Event issue. |
