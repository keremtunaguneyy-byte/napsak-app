# Reviewed Event artwork contract

The structured inventory `assets/gezek/production/figma-asset-manifest.json` is authoritative for content identity/classification. Its `source_csv` is historical provenance: that CSV and the original Python generator are absent from this repository. `scripts/buildGezekAssets.ts` is the maintained local generator. Figma export manifests/ledgers remain authoritative for approved SVG bytes; the historical production plan is not a current-catalog inventory.

## Ingestion

Official source → staged Event record → reviewed Event subtype/classification → manifest generation and validation → human approval → published Event → deterministic runtime resolution.

A staged record is not publishable merely because it has a subtype. A reviewer records exact stable `id`, `kind=event`, `visual_subtype`, `icon_component_key` (the inventory's icon_key field), `photo_family`, `classification_basis` and `reviewed_at` in the JSON inventory. Preserve exact catalog title as editorial reference only. Choose from `event-artwork-taxonomy.json`'s twelve approved families. This vocabulary reuses existing inventory photo families; unused families use the production plan's `official-art-or-semantic-fallback`. These labels are metadata, not permission to fetch imagery.

`artwork_key` may be supplied as an approved matching family variant; otherwise generation derives `event/<visual_subtype>/v01`. Currently each Event family has one approved variant. Adding a variant requires its own artwork approval and all three layouts in `asset-export-manifest.json`. No visual content is generated during resolution.

Run `npm run assets:generate`, `npm run check:assets`, `npm test`, and catalog checks before human publication approval. The generator rejects missing classifications for any current embedded Event, unknown subtypes, subtype/key mismatch, missing icon/photo metadata, duplicate identities, missing assets and invalid responsive dimensions. Historical Event mappings remain available for backward compatibility; they do not waive the review requirement for published current Events. Tests pin the nine reviewed current facts; a later authorized catalog refresh must deliberately update that audit fixture.

## Resolution

Verified licensed bundled photo or approved official Event art with source/evidence/focal point → stable-ID reviewed approved artwork mapping → its semantic family asset for requested layout → neutral Gezek fallback when unresolved. The verified media registry is currently empty.

The inventory's `artwork_key` can point to an approved variant within the reviewed family; it supplies the deterministic asset for Hero (329×100), Square (112×112), and Compact (89×72). Current records all use semantic artwork. Runtime receives only stable identity and the generated registry; it never reads titles/descriptions, classifies a record, or accepts an unknown Event's unreviewed artwork hint. Item-specific Event art must be registered/reviewed, or approved official art must enter the verified media registry. An unknown ID safely remains neutral until reviewed inventory generation ships with the app.

The final acoustic export remains `event/concert-classical-acoustic/v01`, authoritative Figma set `810:102`, variant nodes `810:71`, `810:82`, `810:92`. Never replace those SVGs with an older export. No Firebase schema migration, domain metadata expansion, catalog facts change, recommendation change or UI layout change is required.

## Human classification and missing assets

Title/description keywords may inform editorial preparation only. Record every assisted classification in `classification_basis`; never add a runtime title classifier. The current reconciliation uses existing reviewed catalog descriptions; the historical AMADEUS keyword refinement is retained and explicitly recorded. See `EVENT_ARTWORK_IMPLEMENTATION_REPORT.md` for all nine bases and before/after resolution.

If a family or layout is absent, leave the item on documented neutral fallback and report the exact missing asset. Do not rename, duplicate, invent or fetch an unrelated illustration to fill the gap. Publication is blocked until the human approves a suitable existing mapping or the fallback exception.
