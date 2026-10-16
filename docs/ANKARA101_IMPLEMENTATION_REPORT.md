# Production Ankara 101 implementation

Implementation delivery: 2026-10-17, Europe/Istanbul. Visual approval: 2026-10-16. **VISUAL_APPROVED; implementation verification recorded below; physical Redmi and signed-release acceptance remain pending.** Keep the single pull request Draft and unmerged.

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

Home design, recommendation eligibility/ranking/scoring/weights/seeds/snapshots, onboarding, existing Detail design, Saved typography/layout, catalog facts, Firebase and persistence schemas, release configuration, branding/logo/icon/splash/store artwork are unchanged. `collection-ankara-classics`, all existing per-guide saved IDs and Insider/route IDs remain resolvable. The Insider entry component and its existing reader are retained. The only shared bottom-navigation change is an optional background color used by Ankara 101; existing callers keep their original style.

## Verification and canonical evidence

The final post-motif runtime and tests are validated independently of historical results. See `docs/evidence/ankara101/validation/commands.json` for genuine commands, exits, durations and canonical logs; `browser-commands.json`, `browser-results.json` and `edge-browser-results.json` for interaction assertions. The final counts and per-guide measurements are recorded in the generated comparison ledger below. No absent/skipped command is called a pass.

Bare `check:assets:android` requires an inspectable export directory, and bare `check:build` requires an EAS profile. Earlier argument-less invocations failed with those explicit usage messages; the final verification uses the supported export-directory argument and `--profile=preview`. `npm run check` is absent and is not run. No production profile, release configuration or external environment was changed to satisfy checks.

The Android export checker additionally verifies exact bytes for all 12 PNGs and 19 static fonts, all 57 local SVG registry records, and twelve stable-ID/media-key mappings in the actual Android JS graph. Browser service adapters are test-only; no real Firebase writes, source browsing, device testing or production acceptance is claimed.

Canonical guide panels contain the exact Figma host, actual App top and actual App footer at normal text; large-text panels contain actual top/footer at 180%. Full-body comparisons stitch consecutive real scroll captures beside the exact full Figma master. Panel labels distinguish these composites from a single device viewport. Superseded raw tiles, repeated Saved captures, failed-run screenshots and old verification logs are excluded from the commit. No approved production PNG was edited or recompressed.

## Final post-motif results

All final commands below ran again after the Settings-origin fix, 180% masthead correction and final catalog/footer guards. The cover title now reads the stable-ID presentation registry. Castle emphasis applies only to its exact expected prefix, preserving changed current-catalog summaries. Footer tabs select their named destinations: Ankara 101 from a direct Saved reader opens the index, while Back/Close still restore Saved. These branches are exercised in the seven edge checks. No historical 200/201 result is used. `npm test`: **314 tests passed (111 CJS + 203 TypeScript), zero failed/skipped**; eight focused Ankara 101 tests exercise resolution, session returns, persistence compatibility, exact assets/instances and font policy. Browser: **73 main + 7 edge checks passed**, zero page errors. The two browser commands have their genuine zero exits recorded separately. Normal full-body heights match the twelve approved geometry records; 180% and sixteen-paragraph content expand naturally (the long-content body is 10,463px).

The 180% masthead now places the badge on a separate natural-flow row to prevent title/badge overlap; normal approved composition is unchanged. Long Turkish words can wrap across lines under browser text scaling. Physical Android shaping, OS text scale and TalkBack still need the checklist below.

| Final command | Genuine result |
|---|---|
| `npm ci` | PASS (exit 0) |
| `git diff --check` | PASS (exit 0) |
| `npm run typecheck` | PASS (exit 0) |
| `npm test` | PASS (exit 0) |
| `npm run test:catalog` | PASS (exit 0) |
| `npm run check:assets` | PASS (exit 0) |
| `npm run check:build -- --profile=preview` | PASS (exit 0) |
| `npm run check:accessibility` | PASS (exit 0) |
| `npm run check:events` | PASS (exit 0) |
| `npm run test:stress` | PASS (exit 0) |
| `npm run check:performance` | PASS (exit 0) |
| `npm run check:recommendations` | PASS (exit 0) |
| `CI=1 npx expo export --platform android --output-dir /private/tmp/gezek-ankara101-final-android` | PASS (exit 0) |
| `CI=1 npx expo export --platform android --no-bytecode --output-dir /private/tmp/gezek-ankara101-final-android-readable` | PASS (exit 0) |
| `npm run check:assets:android -- /private/tmp/gezek-ankara101-final-android-readable` | PASS (exit 0) |
| `node --import tsx scripts/checkAnkara101Export.ts /private/tmp/gezek-ankara101-final-android-readable` | PASS (exit 0) |
| `npm run check` | ABSENT; not run |
| `git diff --cached --check` | PASS (exit 0), immediately before normal commit |

Earlier transient failures were corrected before these runs: a redundant narrowed Settings comparison failed TypeScript; a newly exercised Settings return lost index scroll; and 180% masthead text touched the badge. Superseded runs are excluded from canonical evidence. Staging also exposed upstream license trailing whitespace/CRLF and an empty final log line; only textual whitespace was normalized, with upstream/local license hashes retained. Canonical log formatting trims trailing whitespace without changing command output wording or exit status. There is no unresolved implementation/test failure recorded here. Exact-head GitHub CI is reported in the delivery/PR once it completes.

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

## Physical Redmi acceptance — still pending

Use the final PR implementation SHA on Redmi Note 14 and record actual app/build identity, Android version, device configuration, font scale, system bars, date/time and observer in accordance with `DEVICE_ACCEPTANCE_RUNBOOK.md`. Expo Go/development evidence must remain separate from signed-release evidence.

1. Cold-launch fonts on first Ankara 101 entry, revisit and offline entry: no permanent blank screen, wrong settled face or visible typography swap; test loading failure/retry where practical.
2. At applicable 393×852 and 412×915 configurations inspect the index and every Guide: title/weight/italic, colors, hero crop/corners, exact motif stroke weight, metadata, chapters/stops, body, practical note, source and last-content clearance.
3. Open each card body and explicit arrow. Confirm one exact reader, no anchor article or title-based asset fallback. Check invalid/unavailable fallback and a safe exit.
4. Scroll index, open a Guide, use Back, Close and physical Android Back; retain viewport/focus. Open Settings from a scrolled index and return with visible Back and physical Back. Test all bottom-navigation actions and system status/navigation bars without double insets.
5. Save/unsave each Guide; open from Saved; Back/Close/physical Back restore Saved scroll/focus. Unsave while reading, return safely, restart and verify persistence. Test legacy collection → index → reader Back versus Close and retained Insider discovery/reader/map.
6. Open each exact official source URL and return from the real browser; keep the same Guide/scroll. Test unavailable external handler/network failure without navigation loss.
7. Enable **actual Android OS large text**, not a browser scale query. Inspect all guide titles, long prose, stop rows, buttons and bottom labels; scroll to every final source. Record clipping/overlap or unreachable actions.
8. With **real TalkBack**, verify title → introduction → chapters/stops/prose → note/source reading order; separate Open and Bookmark controls; saved/busy/disabled labels; decorative graphics absent; focus restored after Back, Close, external return and unsave.
9. With **OS reduced motion**, confirm no added decorative animation and stable scrolling/navigation. Revisit Home and verify the same filter batch/order, preferences and seeds remain intact.
10. Signed release: repeat the applicable native matrix on the correctly identified signed build, separately recording runtime identity, connectivity/offline behavior and release gates. Do not close release blockers using browser or development-build evidence.

Recommended next step: review the Draft and canonical evidence, then perform this exact-head physical acceptance. Merge requires a separate user decision after required evidence and CI.
