# Production Ankara 101 implementation

Implementation delivery: 2026-10-17, Europe/Istanbul. Visual approval: 2026-10-16. **VISUAL_APPROVED; focused Redmi checklist accepted by the user at `0751414c33a978a0148e9851ed0fc2fb74f907e8`; TalkBack, real OS large text/reduced motion and signed-release acceptance remain deferred.** Keep the single pull request Draft and unmerged.


## Focused Redmi acceptance and twelve-guide-only discovery

The user reports completion of the full focused Redmi checklist on exact head `0751414c33a978a0148e9851ed0fc2fb74f907e8`. Accepted: all twelve readable cards; approved image plus opaque editorial-panel composition; long titles; acceptable cold/warm Reader entry; correct Guide routing; Android hardware Back; Reader scrolling/footer clearance; Save/Unsave/Saved-origin return; stable Home after return; and removal of the previous visual overflow defect. This is user-reported physical Redmi acceptance, not an invented timing/FPS measurement. The earlier emulator configuration-recreation ANR and earlier pending-Redmi statements below belong to the prior checkpoint; they do not negate or expand this focused acceptance.

The user then approved removing visible Insider discovery. The production index now ends after the twelfth approved Guide (`guide-tunali-kugulu`). The “REHBERLERDEN SONRA · YEREL ROTALAR” heading, “Bir Ankaralı Gibi” promotional card, wrapper/border/padding and index-only card styles are removed. The Index no longer accepts trailing children, so no empty legacy section remains. The approved Guide/card/cover styles and **48px final navigation clearance** are unchanged. No replacement is added.

Legacy compatibility is retained: stable ID `insider-kugulu-ayranci`, its underlying `insiderRoutes` record, media, resolver, Reader, map action, persisted IDs and existing handlers are unchanged. A pre-existing Saved item still opens that Reader; Back and hardware Back restore Saved scroll/focus, and both Reader/row Unsave persist across restart. No migration or saved-record deletion runs. The legacy header previously had Back and Save but no explicit Close; an optional 44px Close action now calls the same existing origin-aware return handler. No production Guide Reader/content, image warming/loading, Home/recommendations, general catalog facts, Firebase/persistence schema, Saved contract, onboarding/preferences/Detail or release configuration changed.

Current local results: **316 npm tests**, **18 focused Ankara/Saved tests**, **73 main + 7 edge + 48 media + 12 legacy/index browser checks**, typecheck, accessibility, assets, catalog parity and Android Expo export all pass. Browser coverage spans 393×852 / 412×915, normal / simulated 180% text. It checks exact twelve IDs/order, absence of the complete Insider subtree/text, last child identity, precisely the original 48px end padding and final-card clearance, all existing Guide routes/cards/loading, pre-existing Saved Insider Back/Close/hardware Back with scroll/focus, and Reader/row Unsave/restart without losing other Guides. `npm run check` is absent; dependencies/lockfile did not change and npm ci was not rerun. Current commands/exits/logs and accepted-baseline parity (48 Reader viewport cases and 44 card geometry cases unchanged) plus eight fresh visually inspected captures are under [twelve-guide-index evidence](evidence/ankara101/twelve-guide-index/README.md). [Exact change inventory](ANKARA101_DISCOVERY_CHANGED_FILES.txt); [complete PR inventory](ANKARA101_CHANGED_FILES.txt).

Current physical scope: the accepted twelve-guide behavior above remains accepted at `0751414`. Only the final discovery removal and legacy header Close need the minimal recheck below on the new pushed SHA. Real TalkBack, actual OS large text/reduced motion and signed-release acceptance remain deferred; browser text scaling is not those acceptances. Keep existing Draft PR #79 unmerged; exact-head CI and final SHA are reported in the live PR/delivery after normal push. Protected untracked `src/firebase/BA_4bit.sv/` is untouched. Earlier implementation/results sections below describe the accepted historical checkpoint; their visible Insider continuation and pending-Redmi wording are superseded by this section.

## 2026-10-17 index/media correction on Draft #79

Continued the existing checkout `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`, branch `codex/gezek-production-ankara101`, from `7c5e362e764a5817bc189b9aa78688e498b67618`. The interrupted changes in `src/ankara101Media.ts`, `src/components/gezek/Ankara101Media.tsx` and `src/components/gezek/Ankara101ReaderHost.tsx` were inspected and completed in place. No new branch/worktree/PR, reset, restore, stash, clean, force-push or merge. Untracked `src/firebase/BA_4bit.sv/` was never opened, modified or staged.

**Root cause:** installed React Native `Image.android.js` prepends a static source's intrinsic width/height (1536×1024). Absolute edges did not override those dimensions; the index media wrapper was not clipped and its adjacent text panel was transparent. The native image therefore painted behind the text. The previous RN Web fixture did not model this Android default, so its index visual PASS was insufficient and is superseded by the correction evidence.

The approved index master `1345:23708` and hosts `1345:23875` / `1345:24166` were read through the Figma design-to-code workflow. Each nonfeatured card now owns a **112px nonshrinking clipped media region**, an adjacent **opaque guide-specific palette panel**, natural-height copy with 14px horizontal/12px vertical padding and 7px gaps, 184px minimum height, 28px bottom-right corner, approved title families and a 44×44 arrow. Each child Image explicitly fills its owner with `width/height: 100%`, overriding native source dimensions. Center-cover crops, approved masters, title assignments and stable-ID mapping remain intact. Long words can wrap under 180% text; no scaling disable or height cap was introduced.

`Ankara101Media.tsx` is shared by index and Reader. Index text and focus targets remain mounted; only the cover plus at most four nearby thumbnail Image views are enabled (80px lookahead), and hidden index images are disabled. A single selected hero may warm at its own slot dimensions before navigation, with a **200ms maximum input hold**. Timeout/error opens the exact Reader with its palette/motif placeholder; onLoad reveals the image atomically, with Android fade disabled (`fadeDuration=0`) and no geometry change or motion. Three recent media-key hints avoid repeated holds; they are strings, not an application bitmap cache or a guarantee of native cache retention. The native image pipeline owns caching/downsampling (`resizeMethod=resize`); no claim is made that disk prefetch decodes images. The Reader may render that Guide's hero/interlude, never twelve Guide masters together. Tokens, cleared timers and origin/Detail-overlay/unmount cleanup reject stale completion. Even warm entry may briefly show the designed placeholder.

**Historical Insider audit at `0751414`:** only one production index was rendered. `LegacyInsiderEntry` retains its unique route/Saved responsibility and current reader; no identity, saved record or migration was deleted. It follows all twelve guides under “REHBERLERDEN SONRA · YEREL ROTALAR”. Its existing JPEG is also bounded inside its media wrapper. The grey Tools control is an `android.widget.ImageView` outside the Gezek accessibility root; application code does not remove it.

**Historical acceptance/evidence before the final user Redmi report:** the user already accepted correct Guide selection, physical Android Back, Reader/end scrolling, Save/Unsave, Saved routing and Home/persistence continuity in the supplied device/emulator report. These are user-reported functional observations, not new physical Redmi visual acceptance. Fresh tests below preserve those behaviors. New native evidence is an Expo Go emulator at logical 393×852, normal OS text: bounded cards, separate Insider continuation, selected-size cold/repeat hero and hardware Back. Recorded placeholder→loaded state gaps were 236.00ms first selected-size entry and 207.31ms repeat; screenrecord encodes changed frames, so these are observed state intervals, not exact tap latency or FPS benchmarks. The selected thumbnail was already visible. See `native-observations.json` and the labeled native panels.

Additional emulator width/OS-font recreation attempts captured loading screens and an Expo Go focus-input ANR (5041ms timeout); they are **not passes** and their raw frames are excluded. The underlying cause of that configuration-recreation ANR is not established. Expo Go recovered after a process restart without clearing app data. Size/density/font were restored to physical 1080×2400 / 420 / 1.0. The complete 393/412 normal/180% matrix is browser evidence; native OS large text and the full physical Redmi matrix remain pending. No change to Home, recommendations, catalogs, Firebase/persistence/release, PNG/SVG/font bytes or licenses was made in this correction.

Fresh canonical evidence replaces previous generated panels rather than retaining duplicate runs: 48 Reader top/footer comparisons, 12 full bodies beside exact Figma masters, four full index card grids, index hosts, Insider states, cold placeholder/loaded and two selected native panels. All twelve full-body comparisons and normal/large title/footer panels were visually inspected. The [per-guide ledger](ankara101/final-guide-comparison.json), [media checks](evidence/ankara101/media-browser-results.json), [complete PR inventory](ANKARA101_CHANGED_FILES.txt) and [correction inventory](ANKARA101_CORRECTION_CHANGED_FILES.txt) identify exact nodes, results and files. Temporary recordings, 3,061 original diagnostic video frames, raw test captures, loading/ANR screenshots and superseded logs are not committed.

## Repository and ownership

- Existing repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`; no clone or additional worktree was created.
- Initial branch/HEAD: `main`, `48620e587be373d9e53490aa9ea37dfd6d24ad67`.
- Initial `git status --short`: only `?? src/firebase/BA_4bit.sv/`.
- Origin: `https://github.com/keremtunaguneyy-byte/napsak-app.git`, fetch and push.
- Fetch independently verified `origin/main` at the same SHA. GitHub returned no open PRs and confirmed #78 merged at that merge commit. Existing Ankara branches were historical content/editorial branches; none had an open PR owning this scope.
- Branch: `codex/gezek-production-ankara101`, created from that fetched `origin/main` and continued in the same worktree throughout. No reset, clean, stash, destructive rewrite or force push.
- Untracked Verilog directory was never added, moved, modified or deleted. No unrelated user files were included.
- The delivery response/PR records the normal commit, push, Draft URL and exact-head CI result. No merge or production operation is authorized or performed.

## Authority and reconciliations

The user's implementation request governs execution. Handoff coordination prompts were treated as design/context documents, not authority to start other chats, replay authoring scripts, change production, or promote unrelated open product decisions.

The actual ZIP was `/Users/kerem/Downloads/Gezek_Ankara101_Implementation_Handoff_v1_2026-10-16.zip` (the mentioned `(1)` suffix was absent). It was path/symlink checked and extracted outside the repository at `/private/tmp/gezek-ankara101-handoff`; ZIP CRC passed. Its computed SHA-256 is `1ad052923ec44cb93e1c0bbe70d6397931c85ebb0963cf3d24c0e86901b4e49f`. There was no separately supplied expected ZIP digest; all 26 internal asset-manifest digests were independently verified before copying.

Figma file `yTdAWr92ETyurlQQHNNqpi`, page `288:2`, production section `1337:21533`, index master `1345:23708`, index hosts `1345:23875`/`1345:24166`, Castle master `1313:21222` and hosts `1345:24044`/`1345:24335` are authoritative. Each remaining exact master/393/412 node is recorded in the presentation registry and per-guide comparison ledger. High-fidelity design context and screenshots were obtained through `figma-design-to-code`; further read-only `figma-use` inspections/exports resolved exact instance properties. Figma was not redesigned or modified.

Historical `REVIEW_CANDIDATE_NOT_APPROVED`, `candidate_unapproved` and older visual-bible statements are retained in provenance, reconciled by `00_READ_ME_FIRST_TR.md`, `visual-approval-and-fonts.json`, current live nodes and the user's explicit visual approval. They do not imply implementation/device acceptance.

The live cover uses **DM Serif Display Regular/Italic**, omitted by the packaged font list. The user expressly approved adding it, confined to “Ankara”, slogan, Castle cover title and “İçindekiler”. Font roles, source versions, axes, licenses and checksums are in `assets/ankara101/fonts/README.md` and `provenance.json`. The existing application's Plus Jakarta Sans files remain the body/control source. Cormorant Garamond and Source Sans 3 were not used as substitutes in the new surfaces; their existing Insider and other-screen usage is retained.

Figma resizing retains vector stroke weights. Scaling the 180px motif master to 54/132px incorrectly thinned native strokes. The final implementation uses 22 exact, read-only Figma SVG instance exports at their natural root sizes, preserving the original 14 approved SVG masters byte-for-byte. The 260px background instances extend 100px outside the clipped lane, so their exact exports are the visible **160×260** portion: they render at x=0 without scaling or a second crop/opacity multiplier. Full source IDs, measurements and checksums are in `docs/ankara101/figma-motif-instance-exports.json`. Decorations follow the logical interlude as content grows.

Fraunces static optical sizes follow each approved role size, with `WONK=1`/`SOFT=0`. Upstream default `opsz=9` changed the Gordion standfirst wrapping; role-size instances corrected it. Bricolage always retains the explicitly approved `wdth=100`, `opsz=14`. Live paint reads confirmed the Castle stone-layer strokes have opacity 0.24, matching the unchanged packaged SVG. Some Figma host raster previews show stronger variable-bound strokes; the implementation preserves the approved exact source paint rather than altering the master to mimic that rasterization difference. Native/browser text shaping and antialiasing are not represented as pixel-identical to Figma.

## Implementation

- `Ankara101Index`: approved magazine masthead, Castle lead story with independent bookmark, all twelve exact-ID entries, existing production bottom navigation, settings returning to the same index viewport, and the unchanged Insider entry as a distinct continuation after guide contents.
- `Ankara101ReaderHost`: one exact Guide session, Back/Close, native scrolling, current saved state, bounded source action, safe unavailable state and fixed production navigation. No entire-screen image or giant SVG is used.
- Presentation/configuration: `src/design/ankara101Presentation.json`, keyed by stable Guide ID. Native shared blocks retain guide-specific title fonts, palettes, hero geometries, corners, margins, headings, stop placement, image/vector interludes and semantic motifs.
- Deterministic resolution: `Guide ID → presentation → mediaKey → static local require`. Visible titles never select assets. The current catalog supplies all prose, metadata, stop order, practical notes and exact source URLs; no packaged snapshot overwrites it.
- All twelve PNG masters remain unchanged 1536×1024 `ai_editorial` atmosphere images. Disclosure stays in the approved footer. Provenance, prompts, historical ledger and original 26-record manifest remain internal documentation; cards carry no audit labels.
- Back and Android Back restore the precise index or direct Saved origin. A Saved collection opens the index; a nested reader's Back returns to that index, while Close returns to the Saved collection row. Unsave never removes the reader's exit path. Existing persistence/Firebase handlers and stable IDs are reused.
- Hidden-index scroll events cannot overwrite the stored visible viewport. Index and Saved focus return to the originating card/row, with existing Saved fallback after removal. Source open/return leaves the exact reader and scroll intact; source failure uses the existing alert.
- Font gate is scoped to Ankara 101, has Retry/Back and a ten-second timeout, and never renders an incorrect settled fallback or automatically swaps typography after a timed-out attempt.
- 393px reading lane, centered at 412 with 9.5px gutters; header spans the device. Native safe areas are applied through existing integration once. Content heights flow naturally, controls meet 44px targets, and final source/disclosure clear fixed navigation. Decorative SVGs/images are excluded from accessibility. No new motion is introduced.

## Preserved behavior and scope

Home design, recommendation eligibility/ranking/scoring/weights/seeds/snapshots, onboarding, existing Detail design, Saved typography/layout, catalog facts, Firebase and persistence schemas, release configuration, branding/logo/icon/splash/store artwork are unchanged. `collection-ankara-classics`, all existing per-guide saved IDs and Insider/route IDs remain resolvable. The existing Insider Reader/data remain; its index entry was removed by the later approved discovery decision above. The only shared bottom-navigation change is an optional background color used by Ankara 101; existing callers keep their original style.

## Verification and canonical evidence

The final post-motif runtime and tests are validated independently of historical results. See `docs/evidence/ankara101/validation/commands.json` for genuine commands, exits, durations and canonical logs; `browser-commands.json`, `browser-results.json` and `edge-browser-results.json` for interaction assertions. The final counts and per-guide measurements are recorded in the generated comparison ledger below. No absent/skipped command is called a pass.

Bare `check:assets:android` requires an inspectable export directory, and bare `check:build` requires an EAS profile. Earlier argument-less invocations failed with those explicit usage messages; the final verification uses the supported export-directory argument and `--profile=preview`. `npm run check` is absent and is not run. No production profile, release configuration or external environment was changed to satisfy checks.

The Android export checker additionally verifies exact bytes for all 12 PNGs and 19 static fonts, all 57 local SVG registry records, and twelve stable-ID/media-key mappings in the actual Android JS graph. Browser service adapters are test-only; no production Firebase writes, real source browsing or physical-device acceptance is claimed. Selected native emulator evidence is identified separately below.

Canonical guide panels contain the exact Figma host, actual App top and actual App footer at normal text; large-text panels contain actual top/footer at 180%. Full-body comparisons stitch consecutive real scroll captures beside the exact full Figma master. Panel labels distinguish these composites from a single device viewport. Superseded raw tiles, repeated Saved captures, failed-run screenshots and old verification logs are excluded from the commit. No approved production PNG was edited or recompressed.

## Final correction verification

Current application tree: **316 npm tests passed (111 CJS + 205 TypeScript), zero failed/skipped**; ten focused Ankara 101 tests include the new bounded warming/cancellation and viewport selection tests. Browser suites: **73 main + 7 edge + 48 media checks**, zero page errors, including all twelve entries/readers, exact source actions, Back/Close/Android Back, Saved/scroll/focus/Unsave/restart, Home state, legacy collection, separate Insider, failed/held fonts, changed/unavailable content, long prose, source failure, selected cold/warm decode, navigation, Saved→Detail overlay and unmount races. The Android source-size default is modeled in the browser adapter. Test-only services never contact production.

All commands below ran on the corrected implementation; historical 200/201/314 results are not final validation. The complete command and browser matrix was repeated after the final Saved→Detail overlay cancellation guard. Later changes are evidence/documentation only. No dependency/lockfile changed, so `npm ci` was **not rerun**, per the continuation instruction; its old log has been removed from current canonical results. `npm run check` is absent.

| Command | Genuine result |
|---|---|
| `git diff --check` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 316 tests |
| `node --import tsx --test tests/ankara101-reader.test.ts` | PASS, 10 focused tests |
| `npm run test:catalog` | PASS |
| `npm run check:assets` | PASS |
| `npm run check:accessibility` | PASS |
| `npm run check:build` | Usage failure: supported EAS profile required |
| `npm run check:build -- --profile=preview` | PASS |
| `npm run check:events` | PASS |
| `npm run test:stress` | PASS |
| `npm run check:performance` | PASS |
| `npm run check:recommendations` | PASS |
| `CI=1 npx expo export --platform android --output-dir /private/tmp/gezek-ankara101-correction-final-android` | PASS |
| `CI=1 npx expo export --platform android --no-bytecode --output-dir /private/tmp/gezek-ankara101-correction-final-android-readable` | PASS |
| `npm run check:assets:android -- /private/tmp/gezek-ankara101-correction-final-android-readable` | PASS |
| `node --import tsx scripts/checkAnkara101Export.ts /private/tmp/gezek-ankara101-correction-final-android-readable` | PASS: 12 exact PNGs, 19 fonts, 57 SVG records |
| `node tests/ankara101-browser.cjs` | PASS, 73 checks |
| `node tests/ankara101-edge-browser.cjs` | PASS, 7 checks |
| `node tests/ankara101-media-browser.cjs` | PASS, 48 checks |
| `npm ci` | NOT RERUN: no dependency/lockfile changes |
| `npm run check` | ABSENT; not run |
| `git diff --cached --check` | PASS, staged correction immediately before normal commit |

The partial code initially failed typecheck because RN 0.86 removed `absoluteFillObject`; it was corrected to the existing `absoluteFill` convention before final runs. An initial media test counted placeholders as Image views; its selector was corrected to count native Image views. These superseded attempts are not represented as passing runs. No unresolved automated failure remains. Exact-head GitHub CI and the pushed SHA are recorded in the live Draft PR/delivery after completion; old `7c5e362` CI is historical.

## Per-guide Figma comparison

Every row covers title typography, palette/background, exact image/focal crop, motif, native header, metadata, chapter/stop treatment, complete body, source action and fixed-navigation clearance. The [full comparison ledger](ankara101/final-guide-comparison.json) records each field, exact source URLs, four viewport/text measurements, corrected mismatches and rendering limits. PASS means faithful native translation checked in the browser fixture; physical acceptance remains pending.

| Stable Guide ID / complete comparison | Exact 393 / 412 node | Title family / composition | Body px | 393 / 412 | 180% |
|---|---|---|---:|---|---|
| [guide-ankara-kalesi](evidence/ankara101/guide-ankara-kalesi-full-comparison.png) | `1345:24044` / `1345:24335` | Bricolage Grotesque / castle | 1732 | PASS / PASS | PASS |
| [guide-hamamonu](evidence/ankara101/guide-hamamonu-full-comparison.png) | `1340:30954` / `1340:31059` | Fraunces / walk | 1666 | PASS / PASS | PASS |
| [guide-anadolu-medeniyetleri](evidence/ankara101/guide-anadolu-medeniyetleri-full-comparison.png) | `1342:30932` / `1342:31015` | Instrument Serif / vault | 1530 | PASS / PASS | PASS |
| [guide-cumhuriyet-muzesi](evidence/ankara101/guide-cumhuriyet-muzesi-full-comparison.png) | `1342:31191` / `1342:31289` | Bricolage Grotesque / archive | 1666 | PASS / PASS | PASS |
| [guide-etnografya-muzesi](evidence/ankara101/guide-etnografya-muzesi-full-comparison.png) | `1342:31461` / `1342:31541` | Fraunces / material | 1515 | PASS / PASS | PASS |
| [guide-resim-heykel](evidence/ankara101/guide-resim-heykel-full-comparison.png) | `1342:31703` / `1342:31789` | Bricolage Grotesque / gallery | 1525 | PASS / PASS | PASS |
| [guide-aslanhane](evidence/ankara101/guide-aslanhane-full-comparison.png) | `1342:31968` / `1342:32066` | Instrument Serif / vault | 1664 | PASS / PASS | PASS |
| [guide-ulus-kultur-hatti](evidence/ankara101/guide-ulus-kultur-hatti-full-comparison.png) | `1342:32288` / `1342:32412` | Bricolage Grotesque / transit | 1722 | PASS / PASS | PASS |
| [guide-gordion](evidence/ankara101/guide-gordion-full-comparison.png) | `1342:32626` / `1342:32721` | Fraunces / horizon | 1641 | PASS / PASS | PASS |
| [guide-eymir](evidence/ankara101/guide-eymir-full-comparison.png) | `1342:32916` / `1342:33021` | Bricolage Grotesque / shore | 1687 | PASS / PASS | PASS |
| [guide-mogan](evidence/ankara101/guide-mogan-full-comparison.png) | `1342:33200` / `1342:33280` | Instrument Serif / horizon | 1504 | PASS / PASS | PASS |
| [guide-tunali-kugulu](evidence/ankara101/guide-tunali-kugulu-full-comparison.png) | `1342:33453` / `1342:33551` | Bricolage Grotesque / city | 1651 | PASS / PASS | PASS |

Index comparisons: [393 normal](evidence/ankara101/index-393-1.png), [412 normal](evidence/ankara101/index-412-1.png), [393 at 180%](evidence/ankara101/index-393-1.8.png), [412 at 180%](evidence/ankara101/index-412-1.8.png). Each Guide also has normal and 180% top/footer panels at both widths beside the relevant normal Figma host. Saved/font-failure/missing-content/long-content evidence is in the same canonical directory. These are actual App/RN Web captures with test-only service adapters, not emulator or physical Redmi acceptance.

The [exact changed-file inventory](ANKARA101_CHANGED_FILES.txt) is generated from the staged delivery and includes itself. The unrelated untracked Verilog directory is excluded. Package/license and canonical evidence files are included; raw captures, intermediate Figma downloads and failed/superseded logs are excluded.

## Final minimal Redmi recheck and deferred acceptance

Use the new pushed implementation SHA, not the accepted baseline SHA, for this narrow recheck:

1. Scroll Ankara 101 to the bottom: the twelfth Tunalı–Kuğulu Guide is the final item; no Insider heading/card, separator, empty section or extra gap remains; its action clears bottom navigation and still opens the correct Guide.
2. With an already-saved `insider-kugulu-ayranci` record, open from Saved; check Back, new Close and hardware Back return to Saved. Unsave once and confirm safe return and absence after restart. Do not fabricate or migrate production records to run this check.

The full focused twelve-guide Redmi checklist is already accepted at `0751414c33a978a0148e9851ed0fc2fb74f907e8`; this presentation-only change does not require repeating it wholesale. Deferred separately: real TalkBack reading order/actions/focus, actual OS large-text flow, actual OS reduced-motion behavior, and correctly identified signed-release device acceptance. No signed-release or deferred native acceptance is claimed. Merge still requires a separate user decision; Draft #79 remains unmerged.
