# Home integration stabilization — 2026-10-06

Scope: the Redmi Note 14 observations on existing Draft PR #67, branch `codex/gezek-ui-foundation`. Starting head was `b494ee748cc9aeab8d830e63e3358af21a0128be`; fetched `origin/main` was `46c41156255da7656a7cc0023fd721539dcaf45b`. This is integration and rendering work, not device acceptance or a redesign of adjacent screens.

## Confirmed fault and correction

`App.tsx` dispatched Experience recommendations directly to `openExperienceMap` under the Home CTA **Planı incele**. That skipped inspection entirely. Home now passes the selected Experience ID and its first linked Place ID to the existing plan view nested in `PlaceDetails`. It never resolves plans by title, recommendation index or another plan sharing the Place. Missing public Place linkage fails closed with an unavailable message.

The existing view shows the selected plan's title, description, stops, notes and actions. Maps opens only from **Haritada aç / Rotayı haritada aç**, using that plan's points. Returning closes the direct Home entry and retains the underlying Home. Dismissing a direct-entry plan closes the view and keeps Home's existing undo. The original Place → related plan navigation remains intact.

Live Figma has plan detail source `165:370` and Final Review copy `288:1575` in file `yTdAWr92ETyurlQQHNNqpi`. No temporary CTA or new design is necessary because a native internal view already exists. Its visual reconciliation with Figma belongs to the details PR. No styles or content structure of that view were changed here.

## Map audit and unresolved observation

`googleMapsUrlForExperiencePoints` uses the supplied points in their stored order: one point produces a coordinate search; multiple points produce first-point origin, last-point destination and intermediate waypoints, with walking mode. It does not substitute the user's location, an unrelated Place or a title search.

All **52 bundled Experiences / 71 points** were audited against their linked Place IDs, names and coordinates. Every linkage matched, and all generated URL coordinates preserved the exact point order. No map helper or catalog record was changed. Regression tests cover all current bundled plans and distinct plan IDs sharing a Place/title.

Actual App flow checks through temporary React Native Web tooling verified `xp-arslanhane-alaaddin-selcuklu` (`aslanhane-camii` → `alaaddin-camii`) and `xp-goksu-loop` (`goksu-parki`), including rotation and switching filters. Linking was recorded rather than sent to Google Maps. Inspection emitted no external URL; the separate map action emitted the selected plan's URL.

The reported unrelated Google Maps destination is **not reproduced or claimed fixed**. The device's selected Experience, displayed destination and active catalog snapshot are still needed to distinguish a remote-data difference, native Maps interpretation or another integration issue. Existing catalog precision was not independently resurveyed. Changing public catalog coordinates to conceal the observation is outside this pass.

## Deferred Onboarding and details work

Home **Düzenle** continues to the existing mood → interests → budget → group → duration flow. Its handler does not clear preference state. The actual App harness started with Sakin / Doğa + Sanat / Ücretsiz / 2 kişi / 1–2 saat, verified every selected field, completed the flow and returned to Home with the same persisted values and `onboardingCompleted: true`. Native storage and process restart remain device checks.

The Figma Onboarding/edit-preferences implementation is a next-screen dependency. Saved, Settings, detail visuals and Ankara 101 were not redesigned. Recommendation eligibility, dismissal, scoring, ranking, explanations, diversity, rotation, saved independence, catalog semantics, IDs/relationships, Firebase, persistence schema and release configuration are unchanged.

## Measured rendering findings

Recommendation calculation was already memoized in App; saving or an unrelated parent update did not recalculate it. Home callbacks and static component props were recreated, allowing the whole Home and SVG subtrees to render again. Stable callbacks and memoized Home, atmosphere, cards, discovery, artwork and brand components now avoid that work. Asset paths, geometry, layout, filters and rendering styles remain unchanged. SVG XML parsing already had its own memoization; no claim of repeated XML parsing is made.

Local diagnostic: actual Home and assets through React Native Web development, Chrome at 412 × 915, 4× CPU throttle. Same catalog/preferences and action sequence before/after; 20 unrelated parent updates, 20 save toggles, 40 filter changes. Counts exclude initial mount. This is a single diagnostic run, not native frame timing or a release speed guarantee.

| Action | Home renders before → after | SVG renders before → after | React commit p50 / p95 ms before → after | Recommendation computes before → after |
| --- | --- | --- | --- | --- |
| 20 unrelated parent updates | 20 → 0 | 500 → 0 | 28.3 / 36.5 → 0.0 / 0.6 | 0 → 0 |
| 20 save toggles | 20 → 20 | 500 → 0 | 8.7 / 27.2 → 12.0 / 14.5 | 0 → 0 |
| 40 filter changes | 40 → 40 | 970 → 250 | 36.8 / 60.6 → 27.7 / 47.4 | 40 → 40 |

The save median increased in this run despite fewer SVG renders; timing varies, so the strongest evidence is the removed render work. Filtering still requires a new eligible recommendation batch. Neither memoization nor profiling changes its inputs or outputs. The desktop recommendation benchmark had p95 7.459 → 7.385 ms across 5,000 calls, with unchanged checksum 23,624 and a 25 ms p95 budget.

Opt-in native development diagnostics: start with `EXPO_PUBLIC_GEZEK_HOME_PROFILING=1 npx expo start --clear`, then inspect `globalThis.__GEZEK_HOME_PROFILE__` in the JS debugger. It contains Home/asset render counters, recommendation computation count and at most 200 React commit/compute timing samples. Default and non-development builds disable it. No preferences, coordinates, titles or IDs are collected or transmitted. React render/compute measurements do not capture native drawing or scroll frames; use the native performance tools for those.

## Validation and acceptance

Final working tree validation:

- `npm ci`: passed after removing a Finder `.DS_Store` file that prevented npm's initial directory cleanup. No package or lockfile changes.
- `git diff --check` and `npm run typecheck`: passed.
- `npm test`: 111 + 69 = **180 passed**, including seven Home presentation/navigation/map regressions (three new).
- `npm run check:accessibility`: passed, six files / 17 minimum-target style contracts. This source check does not establish TalkBack behavior.
- `CI=1 npx expo export --platform android --output-dir /tmp/gezek-home-stabilization-android-export`: passed; Android Hermes bundle exported.
- `npm run check:performance`: passed; 5,000 calls, p95 7.385 ms, checksum 23,624.
- Temporary actual-App browser integration: three selected-plan inspection/explicit-map checks, save/unsave, populated preference completion and enabled profiling hooks passed; zero browser render exceptions.

Regression tests are in `tests/gezek-home-presentation.test.ts`. The temporary full-App harness uses the real App/Home/PlaceDetails and recommendation code with fonts, storage, location and linking services stubbed; it is not Android, Firebase or production evidence. No connected Firebase/rules, catalog/stress or signed-release acceptance checks were run: their implementation/data/configuration are unchanged, and this pass is Home integration. GitHub CI for the pushed head remains a separate result.

Changed files: `App.tsx`; `src/homeNavigation.ts`; `src/components/PlaceDetails.tsx`; `src/components/gezek/GezekHome.tsx`, `GezekArtwork.tsx`, `GezekBrandMark.tsx`, `homePerformance.ts`; `tests/gezek-home-presentation.test.ts`; and `docs/HOME_STABILIZATION_REPORT.md`, `PRODUCTION_HOME_DESIGN_CONTRACT.md`, `PERFORMANCE_RUNBOOK.md`, `START_HERE.md`, `STATUS.md`.

Required Redmi Note 14 follow-up:

1. Tap main and alternative plan CTAs before/after rotation and filtering. Verify displayed plan title/stops; inspection must stay internal. Check explicit Maps destinations against those stops, including a single-point plan and a route.
2. Check Android hardware Back, close, plan save/unsave, direct-plan dismiss and Home undo; confirm Home scroll position survives inspection.
3. Edit populated preferences, complete the existing flow, return to Home and restart the app to verify real persistence.
4. Compare repeated filter taps, save toggles and long scrolling with the previous head. Record JS/React durations separately from native frames, GPU/SVG/shadow cost and Expo Go overhead. Smooth Redmi scrolling is not established by the web profile or export.
5. Confirm native SVG appearance, safe areas, larger text and TalkBack navigation. Signed-release device acceptance remains separate.

PR #67 must stay Draft and unmerged. No new PR, force push, production operation or release blocker closure is included.
