# Gezek — Production Home design contract

Updated 2026-10-08 from the approved 2026-10-07 command-center package and live Figma. This supersedes the 2026-10-06 category fallback contract. Implementation remains on `codex/gezek-ui-foundation`, existing Draft PR #67. This is not Redmi or release acceptance.

## Authority

[Figma file](https://www.figma.com/design/yTdAWr92ETyurlQQHNNqpi): production library `807:2`; integrated section `823:2041`; Gezek `823:2042`, Mekân `823:2388`, Etkinlik `823:2797`, Fikir `823:3274`; viewport `824:2880` (393 × 852). Page 02 is historical reference. The package's node ledger records the authoritative artwork component sets. All four Home screens and the device viewport were inspected through live design context and screenshots.

The package is visual authority; repository catalog and recommendation contracts remain behavioral authority. Some Figma sample copy differs from real catalog titles/content. Runtime uses actual stable IDs, titles, metadata and reasons, never screenshot sample text or synthetic events. Decorative chip rows in category mockups are not new recommendation/filter requirements; current category switching and preference editing remain the approved functional controls.

8 October Redmi correction: organic header authority is the exact SVG export of `824:2881` in acceptance frame `824:2880`, corroborated by `823:2043` in the full Gezek Home. `assets/gezek/home-organic-header.svg` retains the 393×402 root, including the first warm-yellow bridge ellipse (`#FFF0B5`, opacity .58, blur radius 28), beneath the organic fields and route/node. The older local header omitted this layer. Home artwork starts behind the status bar at y=0 while content retains live safe insets; landscape artwork spans the viewport independently of the accepted content-width limit. Measurements, device retest steps and all four deferred legacy detail flows are tracked in `HOME_DEVICE_CORRECTION_REPORT.md`.

## Asset foundation

`assets/gezek/production/` contains artwork, contextual icons, manifests, the original node ledger, export verification and SHA-256 checksums. `scripts/buildGezekAssets.ts` validates paths, unique stable identities, unique family/icon keys, responsive dimensions and completed proof exports, then emits a metadata index and XML registry. XML is bundled locally; there are no temporary Figma URLs, network asset fetches or added SVG-transformer dependencies. The renderer caches SVG ASTs by immutable registry path with `parse(xml, inlineStyles)` from `react-native-svg` / `react-native-svg/css`, then renders `SvgAst`. This preserves the same CSS middleware used by `SvgCss` and avoids repeat parsing across card remounts.

All 384 package records map by `kind:id` to `artwork_key` and `icon_key`. Many records intentionally share a semantic family. Artwork resolution: verified bundled licensed photo/official art with source, evidence and focal point → stable-ID item-specific Experience artwork → explicit semantic key/stable-ID semantic mapping → neutral pastel with `BrandLogo`. The verified-media registry is empty; no unlicensed photos or Maps imagery were introduced. Unknown IDs safely use neutral artwork unless given a valid semantic key. Titles never participate in resolution.

Hero is 329 × 100, Square 112 × 112, Compact 89 × 72. Each layout has its own composition; wrappers scale uniformly without changing root geometry or blindly cropping Hero. Verified media uses cover geometry and the recorded focal point. Contextual icons retain their 32 × 32 roots and scale uniformly in metadata.

The 12 proof families were exported from their exact component sets and all three variants on 2026-10-08. Their previews were replaced by authoritative exports. The final acoustic family was also exported and verified against `810:102` (`810:71`, `810:82`, `810:92`). The verification manifest records all 39 artwork variant IDs. Other 112 families retain package SVGs. Quick-action states and discovery artwork were exported from Page 07 (`750:434`, `750:451`, `758:896`).

## Native Home

One main result and up to four real alternatives; no algorithm changes. Hero occupies the main card, Square the alternatives. The full card body opens the existing action/detail destination. Independent 44 × 44 save and dismiss targets use exact Figma default/pressed/saved/loading/dismissed artwork. Targets are sibling Pressables; quick actions stop propagation. Dismiss pending/completed state follows the actual callback; changing the main stable ID remounts its transient state. Existing undo behavior is retained.

The selected category is excluded from the three-card discovery row. The bottom navigation remains outside the ScrollView inside the viewport. Plus Jakarta Sans and approved colors/type/radii remain centralized. Real text wraps and cards grow for long content. Main artwork scales uniformly with available width; alternatives remain square. Root, hydration and Home backgrounds use the canvas color, with dark Home status-bar content. Android system-area flash still requires native observation.

`BrandLogo` centralizes the temporary lowercase wordmark and yellow dot; the old `GezekBrandMark` export is a compatibility alias. Header, fallback and error-state brand appearances route through that component. No exploration node `890:2825`, final icon, splash or store artwork is shipped. Other screen layouts and Ankara 101 editorial design remain separate.

Internal plan entry, explicit Maps action and the mounted Home return path are preserved. Browser checks using the actual App and stubbed native services verified selected point order and scroll restoration. Event/Idea external actions keep their existing behavior.

## Evidence and remaining acceptance

See `COMMAND_CENTER_IMPLEMENTATION_REPORT.md` for separate command results, exact changed-file inventory, export evidence and remaining blockers. Browser checks cover four filters at 393 × 852 and 412 × 915, long Turkish titles, action isolation, detail/Maps and scroll return. They are React Native Web evidence, not native Android, TalkBack, signed-release or production evidence.

Redmi 14 acceptance remains pending: Android Back, cold start/system-area flash, save/dismiss/undo, native scroll/rotation, large fonts/TalkBack and process-restart persistence. Release baseline still has eight blockers. Event health fails identically on origin/main and this branch on stale verification and insufficient upcoming inventory; the user approved a documented publication exception. This UI task preserves the catalog. PR #67 remains Draft and unmerged; PR #57 is outside scope.
