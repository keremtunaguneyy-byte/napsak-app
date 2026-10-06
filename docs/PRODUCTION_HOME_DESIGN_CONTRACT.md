# Gezek — Production Home design contract

Current Home contract, verified against live Figma on 2026-10-06. Implementation lives on `codex/gezek-ui-foundation` in existing Draft PR #67. This supersedes the 2026-10-01 Home PNG/artwork authority and the imported bundle's first-pass layout; those remain historical records. It is not device acceptance or release approval.

## Authority

[Figma file](https://www.figma.com/design/yTdAWr92ETyurlQQHNNqpi) is authoritative for Home visuals. Repository contracts remain authoritative for recommendation, catalog, persistence, and navigation behavior.

Source order: current Final Review/final Home nodes → current Components → approved application behavior/data contracts → live `origin/main` → functional bundle `75b2aeb` → historical PR #67 visuals/documentation.

| Source | Verified node / use |
| --- | --- |
| 06 Final Review board | `288:3`; cover explicitly describes approved screen copies for consistency review |
| Home on review board | `288:888`, consistent with source Home |
| Home — Default | `7:2`, 393 × 852 |
| Home — LongScroll | `7:129`, 393 × 1436; vertical alternatives |
| Home — LongTurkishTitle | `7:245`, wrapping titles; outer frame 420 wide, inner layout 393 |
| 02 Components | `3:2`; main card `5:41`, alternative `5:55`, selector `157:694`, bottom navigation `4:91` |
| State components | Loading `90:243`, empty `90:281`, error/location/exhausted `106:378` |
| 05 Onboarding | `31:2`; inspected for newer authority, not implemented in this task |

All nodes still existed when inspected. No clearly newer approved Home authority was found. Connected prototype states on Onboarding are behavior references, not a replacement visual approval. Wordmark/application icon remain provisional; `GezekBrandMark` is the single replaceable wordmark component.

## Native layout

`App.tsx` keeps safe-area handling, scroll ownership, state and handlers. `GezekHome.tsx` renders live preferences, equal `Gezek / Mekân / Etkinlik / Fikir` tabs, one main result and up to four real alternatives, refresh, discovery, and contextual utilities. Bottom navigation remains outside the scroller.

| Native component | Figma / responsibility |
| --- | --- |
| `GezekBrandMark`, `HomeAtmosphere` | Header and layered background in `7:2`; provisional mark stays replaceable |
| `MainCard`, `Alternative` | `5:41`, `5:55`; actual recommendation title/meta/reason and existing action callbacks |
| `CategoryIcon`, `Discovery` | `157:694` and Home discovery; selected tones plus current arch/ticket/K0 artwork |
| `RecommendationVisual` | Exact media slots; verified ID photo registry then approved illustrated/neutral fallback |
| `GezekHomeLoading`, `EmptyCard`, `HomeBoundary` | Loading, zero-result/exhausted and render-error components; real state only |
| `GezekBottomNavigation` | `4:91`; existing Home/Saved/Ankara 101 destinations |

- Canvas `#FAF9F5`, navy `#102452`, cobalt `#3F65FC`, yellow `#FFC21A`, mint `#DFF3E8`, lavender `#ECE9FF`, coral `#FFE2D9`, muted `#6F7890`, border `#E2E8F0`.
- Plus Jakarta Sans regular/medium/semibold/bold/extrabold; Home title 25/30, section 17/22, main title 16/21, body 11/16, labels 11/15, supporting 9/13, action 13/18, navigation 9/12.
- Screen inset 20, Home top inset 22, section/card gaps 12. Selector and navigation 74 high; main media 124 high; alternative media 112 square. Image radius 16, preference 18, main card 24, alternative/action 22.
- Main action and save share a row. Dismiss, undo, settings and other actions have at least 44 px touch targets. Titles, preference summary, metadata and reasons wrap instead of truncating.
- Discovery uses the current arch, ticket and K0 match artwork. Header, atmospheric accents, lower route, UI icons and state graphics are local Figma SVG exports in `gezekAssets.ts`; their path geometry, colors and root dimensions are retained. A wrapper applies uniform scaling. The loading radar is the exact bundled 68 × 68 Figma raster and is not enlarged.

## Photography and provisional fallback

**Closed-beta provisional no-photo fallback — product-approved on 2026-10-06; dedicated Figma component still pending.**

No separately approved no-photo node exists. Neither bundled Home photograph had verifiable source/license evidence, so both were removed. No unlicensed, scraped or remote stock image is used. `gezekHomePresentation.ts` has an empty verified bundled-photo registry keyed by stable ID, with required source credit and license evidence. A verified bundled photograph takes priority when entered there; title heuristics are prohibited.

| Content | Fallback |
| --- | --- |
| Mekân | Arch artwork, mint panel |
| Etkinlik | Ticket artwork, coral panel |
| Fikir | K0 match artwork, lavender panel |
| Gezek/Plan | Reliable declared dominant category: Kahve/Lezzet → arch, Etkinlik → ticket; otherwise neutral Gezek pastel panel |

The declared Experience category must also occur in its primary interests before selecting associated artwork. Other categories do not have an approved semantic match, so use neutral. Image-slot dimensions, radius and surrounding layout stay as above. Artwork is centered at its original clean dimensions, preserves aspect ratio, and is never stretched or cropped with cover. All recommendation artwork is decorative because the adjacent title supplies its meaning. Neutral panels use the provisional Gezek wordmark.

## Behavior and state boundaries

Eligibility-before-ranking, dismissed-before-scoring, 1+4 selection, rotation, explanations, saved-status independence, IDs, city/place relationships and all catalog data are unchanged. Home only presents the existing results. Save/unsave, dismiss/undo, preferences/context confirmation, location permission/denial, settings, hidden results, reset, Saved and Ankara 101 retain the existing handlers. Plan map routing, place details and external Event/Idea actions keep their current behavior.

Empty/exhausted states use actual result counts; no synthetic alternatives or future events are inserted. Embedded/local results stay usable offline. The app has no authoritative connectivity signal, so a Figma offline banner is not fabricated and catalog access is not blocked on networking. Startup loading is tied to actual hydration/font readiness, with indeterminate semantics rather than a fake percentage. A scoped Home render error boundary uses the current error artwork and existing operational error capture.

## Reconciliation and acceptance limits

Earlier fixed 2×2 alternatives, old Fikir SVG, title-matched photos, oversized type, bottom count badge and stacked main save action have been superseded. Historical Source Sans 3/Cormorant Garamond screens and Ankara 101 remain separate. No onboarding redesign, new illustration style, production operation or release configuration change is included.

Necessary differences from static Figma: the dismiss hit target adds height; all actual preferences including group size remain visible; four real alternatives extend the page; long text and larger system fonts can grow cards; location/undo/context/hidden/reset utilities appear when needed. Lower route artwork follows the discovery section rather than a fixed screenshot coordinate. These preserve functional and accessibility contracts.

Temporary React Native Web previews at 412 × 915 exercise the actual native components and bundled fonts/assets. They can compare hierarchy, wrapping, colors and icons, but do not establish Android SVG/filter rendering, safe-area or TalkBack behavior. Redmi 14 / Expo Go visual and interaction acceptance is pending. No pixel-perfect, signed-device or production verification is claimed. PR #67 must remain Draft and unmerged until the requested device review and remaining approvals.
