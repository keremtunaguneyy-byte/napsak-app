# Gezek Detail Flow — PR 1 contract

Approved by the user on 2026-10-08 through `Gezek_Detail_Flow_PR1_Implementation_Handoff_2026-10-08.md`. This supersedes historical Detail Flow approval-pending notes. Live repository state remains authoritative for implementation and Git status.

## Design authority

[Figma approved section](https://www.figma.com/design/yTdAWr92ETyurlQQHNNqpi/Gezek-Beta-UI-v1-Design-Closure?node-id=927-1769): `Production Detail Flows / Approved v1` (`927:1769`), page `288:2`.

Plan family `931:2412`: Default `931:1871`, Saved `931:1937`, Loading `931:2001`, Unavailable `931:2034`, Dismissed `931:2067`, Long Turkish Title `931:2099`, Large Text `931:2162`, Long Scroll `931:2225`, No External `931:2289`, Footer Clearance `931:2347`.

Place family `932:2874`: Default `932:2301`, Saved `932:2371`, Loading `932:2438`, Unavailable `932:2471`, Dismissed `932:2504`, Long Turkish Title `932:2536`, Large Text `932:2603`, Long Scroll `932:2670`, No External `932:2739`, Footer Clearance `932:2805`.

Shared components: Nav `928:1766`, Save `928:1779`, Dismiss/Restore `928:1801`, External `928:1840`, Snackbar `928:1847`, Header `930:1766`, Hero `930:1829`, Metadata/Reason `930:1850`, Content `930:1877`, Status `930:1894`, Footer `930:1924`, Host `930:1998`.

Inspected live high-fidelity context and screenshots for Plan/Place defaults, plus saved, loading, unavailable, dismissed, large text, footer-clearance and snackbar context. Figma sample content is not runtime data: for example, `xp-kugulu-segmenler` has catalog duration 75–105 minutes, and the sample Kakule Kahve is absent from the current catalog. Runtime uses catalog facts and current production ID artwork mappings. No Figma nodes were modified.

## User-approved component override — 2026-10-09

The user's Redmi correction request supersedes the Figma heart glyphs in Save `928:1779` (outlined asset `928:1768`, selected asset `928:1771`). Detail Plan/Place now use conventional 22×22 bookmark geometry: outlined navy `#102452`, selected filled cobalt `#3F65FC`. Existing 44×44 targets and selected/busy/disabled semantics are preserved. Local SVGs, XML registry and SHA manifest record this override explicitly. **Later Figma component synchronization remains pending**; this request does not authorize editing Figma or claim these replacement glyphs were exported from it.

Technical Experience ID chips are removed without substitute copy. Other controls and product surfaces retain their existing design contracts.

## Approved behavior

One shared modal host above the mounted Home/Saved origin. Entry snapshot records screen, filter, recommendation seed, scroll and invoking control. Routes use exact `kind + id`; Plan resolves directly from the catalog, not from a ranked related-plan list. Nested history records each parent scroll and invoking stop/related-plan key. Selecting a route already in history truncates to its existing `kind + id` frame, preserving its scroll, focus and reasons. A genuinely different related Plan remains nested; repeated Plan–Place cycles never append duplicate frames. Back (including Android Modal `onRequestClose`) pops history before leaving the origin; Close exits the entire host. Detail navigation does not rotate recommendations or change filter/seed. External actions retain the detail stack and restore invoking-control focus on return.

Stable Experience IDs are routing/lookup keys only and must never appear in visible metadata. Plan uses real title, ordered `points[].placeId`, duration/budget, description, note, availability note and supplied recommendation reasons. Stops open their exact Place IDs; no invented per-stop durations/subtitles. Place uses real category/district/price/address/note, distance only with actual user coordinates, existing related-plan recommendations and a related-empty state. No live opening/crowd claims. Maps uses verified structured coordinates; sources appear only when present. Artwork uses the existing `stable ID → artwork_key → Hero` resolver and local manifests; no title inference or unlicensed media.

Save/dismiss is exclusive. Dismiss removes saved and adds dismissed atomically. Saving dismissed content is rejected. Restore and Undo return to unsaved. Older overlapping local v5/legacy records are normalized with dismissal winning, matching the existing remote payload contract. Storage keys, migration precedence, Firebase fields/rules, owner-bound queue and synchronization behavior remain unchanged.

One eight-second undo timer represents only the latest dismissal. New dismissal resets it; Undo consumes it once; Restore consumes a matching notice. At exactly eight seconds Undo becomes unavailable; presentation fades out and moves downward 6 px over 180 ms using native Animated, then is removed. Reduced motion removes it immediately. Expiry never restores persisted content. The exit timer is presentation-only; it does not extend the approved undo window. New dismissal resets both timers and stops the previous animation. Navigation/filter change/rotation/Close/unmount clear it. Both Home and Detail use this lifecycle.

Minimum controls 44×44; header/title focus entry, nested invoking-control focus return and feasible origin focus return; decorative artwork excluded from TalkBack; selected/busy/disabled states; wrapping text and growing surfaces. Footer is fixed, with content clearance `max(112, measured footer height + 16)` including safe-area inset. Large text can stack footer actions. Modal transitions are instant, including reduced motion.

## Scope preserved

PR 1 implements Plan/Place and their Home/Saved entry only. Event/Idea routes and detail UI, Saved visual migration, onboarding/edit, Ankara 101, Settings, Home design, logo/icon/splash/store assets remain outside scope. Shared save/dismiss exclusivity applies consistently to existing content IDs. Recommendation eligibility, weights, ranking, reasons, diversity, rotation, catalogs/relationships, dependencies, Firebase and release configuration remain unchanged.

## Acceptance boundary

Repository tests and React Native Web harness evidence are recorded in `DETAIL_FLOW_PR1_IMPLEMENTATION_REPORT.md`. They do not establish Redmi, native TalkBack, OS process-restart, signed-release or production acceptance. Keep the PR Draft and unmerged pending CI/device review. PR 2 is not authorized by this work.
