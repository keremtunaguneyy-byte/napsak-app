# Twelve-guide-only index and legacy Saved compatibility

Fresh actual App/RN Web captures after the approved Insider presentation removal. All eight PNGs were visually inspected. Each pair covers 393×852 / 412×915 with normal / simulated 180% text:

- `index-end-…`: the twelfth Guide ends the index; original 48px navigation clearance; no Insider heading/card/empty section or separator.
- `legacy-saved-reader-…`: a seeded **pre-existing** stable `insider-kugulu-ayranci` Saved record opens its retained Reader/media, with Back/Save/Close. The fixture never creates or migrates production data.
- `legacy-browser-results.json`: 12 passing checks: four configurations of index identity/absence/end clearance, Saved Back/Close/hardware Back with scroll/focus, Reader/row Unsave and restart persistence.
- `baseline-parity.json`: all 48 Guide Reader viewport/content-height/clearance cases and 44 nonfeatured card size/palette/clip cases match accepted `0751414` evidence; only scroll coordinates are excluded.
- `validation/commands.json` and logs: final local commands and genuine exits. Root ledgers separately record 73 main + 7 edge + 48 media browser checks; `browser-commands.json` records all four zero exits.

Reproduce with the existing Ankara fixture builder, localhost server and `tests/ankara101-legacy-browser.cjs`, plus the three existing Ankara suites. `GEZEK_BROWSER_MODULES` selects external browser dependencies; `GEZEK_ANKARA101_EVIDENCE` selects temporary raw output. No dependency/lockfile changes.

The user accepted the full focused Redmi checklist at `0751414c33a978a0148e9851ed0fc2fb74f907e8`. These new captures are browser evidence of the subsequent narrow change; the final-SHA minimal Redmi recheck is still needed. TalkBack, actual OS text/reduced motion and signed-release acceptance remain deferred. The four obsolete visible-Insider continuation screenshots were removed; older native panels in the parent folder are explicitly historical accepted-baseline evidence.
