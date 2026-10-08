# Home Redmi acceptance correction — 8 October 2026

Branch: `codex/gezek-ui-foundation`. Existing PR #67 remains Draft and unmerged.
Implementation starts at `83b85b575b299515af8bac461029b53b29098da2`; verified
`origin/main` is `46c41156255da7656a7cc0023fd721539dcaf45b`.

## Root causes and changes

The Home `SafeAreaView` applied the top inset outside the scrolling artwork.
That top region therefore painted `#FAF9F5`, creating the cream status-bar strip.
Home now draws from screen y=0, applies the live safe top inset to content padding
(`22 + inset`), and subtracts that same inset from the artwork origin. Right,
left and bottom safe edges remain. Status-bar icons stay dark. Loading and
hydration screens paint the same header behind transparent safe content.
No Android release configuration or native splash configuration was changed.

Both authoritative Figma nodes, `824:2880` (393×852) and `823:2042`, have a
warm-yellow bridge absent from the old local header export. The replacement is
the exact `824:2881` SVG export, saved as `assets/gezek/home-organic-header.svg`
and embedded in `gezekAssets.ts`: 393×402; ellipse center (222.5,207), radii
(205.5,237), fill `#FFF0B5`, opacity 0.58, Gaussian blur stdDeviation 14
(Figma blur radius 28). It appears first, beneath the lavender and mint fields,
cobalt route and yellow node. The canvas remains the approved `#FAF9F5`;
the yellow field is local atmosphere rather than a replacement canvas color.
The remaining body fields retain their existing geometry and blur offsets.

Landscape previously constrained both content and background to a 720px page.
The background now spans the available viewport; an inner 680px content limit
preserves the previous 720px page minus its two 20px gutters. Controls retain
their accepted width. No detail UI was edited.

## Filter measurements and optimization

Measured before editing the renderer: actual Home, embedded catalog and fixed
preferences in React Native Web/Chrome development mode, 393×852, 4× CPU
throttling, four warmup switches then 40 switches through all four filters.
The same instrumentation and fixture ran after the final layout change.
Raw samples and browser checks: `HOME_DEVICE_CORRECTION_MEASUREMENTS.json`.

| Metric | Before p50 / p95 | After p50 / p95 |
|---|---:|---:|
| React commit, ms | 54.9 / 68.4 | 45.1 / 59.4 |
| Switch through two animation-frame callbacks, ms | 78.5 / 98.9 | 66.1 / 89.1 |
| Production SVG parse time, ms | 8.2 / 11.2 | 0 / 0 |
| Recommendation compute, ms | 3.2 / 16.9 | 2.1 / 19.8 |
| Home renders per switch | 1 / 1 | 1 / 1 |
| Asset renders per switch | 23 / 23 | 23 / 23 |

The 40 switches previously performed 680 SVG parses (321.4ms total); warm
switches now perform zero. `SvgCss` memoizes XML only for the lifetime of each
mounted component, so filter changes remounting cards repeatedly parse the same
artwork/actions. `ProductionSvg` now caches parsed ASTs by immutable registry
path, retaining the exact same `parse(xml, inlineStyles)` middleware and original
geometry. The cache can contain only the 432 registered assets; it does not
eagerly parse them. First use still pays parsing cost. Registry contents/mappings
are unchanged. Opt-in development render diagnostics now include production SVGs.

This browser evidence supports removing repeat parsing. It does **not** establish
native Redmi pause duration, native frame/FPS performance, startup flash absence,
or release-device acceptance. Remaining React/native SVG drawing costs require
the Redmi retest; no speculative recommendation or scheduling changes were made.

## Verification

| Command / check | Result |
|---|---|
| `git diff --check` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass: 111 + 71 = 182 tests |
| `npm run check:accessibility` | Pass: 7 source files, 16 target styles |
| `npm run check:performance` | Pass: 5,000 calls; p95 7.327ms, 25ms budget; checksum 23624 |
| `CI=1 npx expo export --platform android` | Pass: Android Hermes bundle 6.7MB |
| Browser regression | Pass: 8 viewport/filter cases, 2 long-title cases, save/unsave/dismiss/undo isolation, actual App detail/explicit Maps/scroll return; no page errors |
| Background/orientation browser probe | Pass: y=0, width 393→852→393, content top padding 46px with stubbed 24px inset, fixed navigation, settings return |
| Asset registry regression | Pass within npm test: 384 records, 125 artwork families / 375 responsive SVGs, 46 contextual icons; exact files/checksums |
| `npm run check:events` (extra baseline check) | **Fail**, exit 1 on both branch and exported origin/main; byte-identical output |

Exact current event failure:

```text
Etkinlik katalog sağlığı: GÜNCELLEME GEREKİYOR
Toplam: 14
Yaklaşan: 2
Süresi geçmiş: 12
Katalog ufku: 8.74 gün
Eski doğrulama: 14
Sorunlar: stale_verification, insufficient_upcoming_events
```

The entire verification suite is **not fully green**. The user approved the
pre-existing event failure exception. Event catalog, freshness dates and
validation have no diff against origin/main. Recommendation scoring/ranking,
data, persistence, Firebase contracts and release configuration are unchanged.
No fresh native Redmi or signed-release test was available in this workspace.
The six requested checks were run; unrelated production/release operations were
not run. GitHub CI is verified separately on the pushed commit and reported in
the PR and final response.

## Changed files

- `App.tsx`: Home safe-area/content layout and loading background.
- `src/components/gezek/GezekHome.tsx`: artwork inset and viewport/content width separation.
- `src/components/gezek/ProductionArtwork.tsx`: immutable SVG parse cache and opt-in render counting.
- `src/components/gezek/gezekAssets.ts`: authoritative header XML.
- `assets/gezek/home-organic-header.svg`: exact Figma export.
- `types/native-modules.d.ts`: safe-area hook declaration.
- `docs/PRODUCTION_HOME_DESIGN_CONTRACT.md`: corrected header authority.
- This report and `HOME_DEVICE_CORRECTION_MEASUREMENTS.json`: acceptance evidence.

## Deferred detail flows

Experience/plan, Place, Event and Idea detail flows remain visually legacy.
Idea still uses its native Alert. All four belong to the next dedicated Detail
Flow design/implementation PR. PR #67 does not redesign or modernize them.

## Exact Redmi retest checklist

Record commit/build type, Redmi model, Android/MIUI version and screen recording.
Development results must be labeled as development evidence.

1. Cold launch and launch again with stored preferences. Check loading→Home and
   foreground return: no cream/white status-bar strip or white transition flash;
   background continues behind dark status-bar icons; logo/settings stay below
   the notch/status-bar inset. Native OS splash behavior remains unverified.
2. At portrait scroll position zero, compare with Figma 824:2880 and 823:2042:
   warm-yellow field below lavender/mint, then cobalt route/yellow node, then UI.
   Account for actual safe inset and dynamic preference/location notices.
3. Repeat Gezek→Mekân→Etkinlik→Fikir→Gezek ten times. Record first/cold switches
   separately from warmed switches; record tap→visible updated card durations
   and any visible pause. With `EXPO_PUBLIC_GEZEK_HOME_PROFILING=1` in a local
   development run, compare `globalThis.__GEZEK_HOME_PROFILE__` Home/asset renders
   and commit/compute samples. Do not label React commits as frame timings.
4. On each filter, verify correct artwork/category mapping, one main plus four
   alternatives when eligible; card-body opens the existing corresponding flow.
   Independently save/unsave and dismiss; neither opens detail. Undo restores.
5. Scroll Home, open existing plan/place/event detail and return. Verify scroll
   position, filter and preferences. Open Idea and dismiss its existing Alert.
   Record legacy visual design as deferred, not a correction failure.
6. From applicable existing detail flows, explicitly open Maps; verify correct
   destination/ordered route and return. Opening a card must not launch Maps.
7. Rotate portrait→landscape→portrait at top and while scrolled, including while
   returning from detail/settings/saved. Check background fills available width,
   safe controls, dark Home status icons, fixed bottom nav and no white flash.
8. Restart with stored preferences and verify all accepted preference/filter/save
   behavior. Capture any remaining pause/flash with build identity before deciding
   another optimization. Keep #67 Draft until Redmi acceptance is reviewed.

Commit/push are authorized for this coherent correction. Push normally to the
existing branch; never merge or mark #67 ready in this pass. The recommended next
step is the above Redmi retest, followed by the dedicated Detail Flow PR.
