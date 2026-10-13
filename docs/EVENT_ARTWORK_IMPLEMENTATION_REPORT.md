# Event artwork implementation report — 2026-10-13

## Audit and delivery

Repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`.
Initial branch `codex/gezek-recommendation-correctness-phase-1`, HEAD `f1d616f228773057353f22ab01e9bbe4f0bc8f23`. Initial tracked tree clean; only untracked `src/firebase/BA_4bit.sv/`. Fetch updated origin/main from `a37d1fc2cfe23ec06164c8165877345d804339c1` to the required `c4272ea011fb67952aac00a8e133c717510ff693`. Branch `codex/gezek-event-artwork-automation` created directly from that verified origin/main. Open PR audit: #57 “Preserve Experience primary-interest precedence”, branch `codex/experience-primary-precedence`, unrelated and untouched.

The unrelated `src/firebase/BA_4bit.sv/rtl/BA_4bit.sv` and `src/firebase/BA_4bit.sv/rtl/tbBA_4bit.sv` were not moved, modified, staged or deleted. Normal commit/push and one Draft PR are authorized by the pasted implementation request. No merge or force-push. Final commit/PR URL and exact-head CI are recorded in the completion response; this report precedes its own commit. Final expected status is only the same unrelated untracked directory.

## Root cause and implementation

The approved inventory retained the previous fourteen Event IDs; the refreshed nine-event catalog retained only AMADEUS's mapped ID. Eight current IDs had no inventory entries and resolved to neutral. Added eight reviewed inventory entries and enriched AMADEUS's existing review; retained historical mappings for compatibility. Total inventory is 392, families 125, responsive assets 375, contextual icons 46. No new artwork, SVG replacement, Figma change, photography, scraping or unlicensed imagery.

`event-artwork-taxonomy.json` defines the twelve approved subtype/icon/photo families. The generator accepts reviewed classification, derives an omitted stable family key as `event/<subtype>/v01`, validates current catalog coverage, subtype/key compatibility, icons, dimensions and all responsive files, then emits metadata. Unknown/incomplete classification fails generation; unknown Event IDs fail safely to neutral at runtime, including those carrying unreviewed valid artwork hints. Media with source/license/focal evidence still wins. Reviewed stable-ID artwork resolution never reads visible titles or descriptions. No growing React component switch was added.

The existing approved semantic family supplies the Hero/Square/Compact variants. Current Events have no separate item-specific or licensed official artwork; the media registry remains empty. Item-specific approved variants are registered through reviewed inventory; official artwork requires verified media evidence. Other kinds preserve their previous resolution behavior and identical inventory mappings.

The original inventory CSV and Python generator are absent; the repository's JSON inventory and TypeScript generator are the maintained source. Historical production plan usage counts are not refreshed-catalog authority. The [ingestion contract](EVENT_ARTWORK_CONTRACT.md) documents official source → staged record → reviewed subtype → generation/validation → human approval → publication → deterministic runtime mapping. GitHub App Quality now checks generated assets and exact Android SVG coverage.

## Nine-current-Event reconciliation

Paths below are relative to `assets/gezek/production/`. Before: AMADEUS artwork; all other eight neutral in every layout. After: all nine artwork in all three layouts, zero neutral fallback blockers.

| Stable Event ID | Exact title | visual_subtype | artwork_key | Hero path | Square path | Compact path | Classification basis | Fallback before → after |
|---|---|---|---|---|---|---|---|---|
| event-amadeus-congresium-2026-10-16 | AMADEUS - Veda Turnesi | theatre-play | event/theatre-play/v01 | svg/artwork/event/theatre-play/v01/hero.svg | svg/artwork/event/theatre-play/v01/square.svg | svg/artwork/event/theatre-play/v01/compact.svg | Reviewed note: Peter Shaffer theatre play; existing keyword-refined AMADEUS classification retained. | artwork → artwork |
| event-cso-iki-keman-bir-miras-2026-10-16 | Cumhurbaşkanlığı Senfoni Orkestrası — İki Keman Bir Miras | concert-classical-acoustic | event/concert-classical-acoustic/v01 | svg/artwork/event/concert-classical-acoustic/v01/hero.svg | svg/artwork/event/concert-classical-acoustic/v01/square.svg | svg/artwork/event/concert-classical-acoustic/v01/compact.svg | Reviewed note: Suna Kan memorial orchestral concert with two violin soloists. | neutral → artwork |
| event-sempre-mozart-ankara-dob-2026-10-23 | Sempre Mozart — Ankara DOB | concert-classical-acoustic | event/concert-classical-acoustic/v01 | svg/artwork/event/concert-classical-acoustic/v01/hero.svg | svg/artwork/event/concert-classical-acoustic/v01/square.svg | svg/artwork/event/concert-classical-acoustic/v01/compact.svg | Reviewed note: Mozart selections with soprano, baritone and piano. | neutral → artwork |
| event-magic-bubbles-csoada-2026-10-24 | Magic Bubbles | family-show | event/family-show/v01 | svg/artwork/event/family-show/v01/hero.svg | svg/artwork/event/family-show/v01/square.svg | svg/artwork/event/family-show/v01/compact.svg | Reviewed note: bubble family show; not inferred from ticket URL music category. | neutral → artwork |
| event-falda-carmen-xl-ataturk-sanat-2026-10-31 | Falda CARMEN Çıktı XL Müzikali | theatre-play | event/theatre-play/v01 | svg/artwork/event/theatre-play/v01/hero.svg | svg/artwork/event/theatre-play/v01/square.svg | svg/artwork/event/theatre-play/v01/compact.svg | Reviewed note: staged musical combining flamenco, opera and theatre. | neutral → artwork |
| event-bir-aile-provasi-ataturk-sanat-2026-11-01 | Bir Aile Provası: Yaşayın Gitsin | theatre-play | event/theatre-play/v01 | svg/artwork/event/theatre-play/v01/hero.svg | svg/artwork/event/theatre-play/v01/square.svg | svg/artwork/event/theatre-play/v01/compact.svg | Reviewed note: BKM theatre play about family relationships. | neutral → artwork |
| event-ankara-kadin-orkestrasi-csoada-2026-11-02 | Ankara Kadın Orkestrası Konseri | concert-live | event/concert-live/v01 | svg/artwork/event/concert-live/v01/hero.svg | svg/artwork/event/concert-live/v01/square.svg | svg/artwork/event/concert-live/v01/compact.svg | Reviewed note: concert; orchestral instrumentation/repertoire not specified, so broad live concert family. | neutral → artwork |
| event-satonun-altinda-ataturk-sanat-2026-11-07 | Şatonun Altında | theatre-play | event/theatre-play/v01 | svg/artwork/event/theatre-play/v01/hero.svg | svg/artwork/event/theatre-play/v01/square.svg | svg/artwork/event/theatre-play/v01/compact.svg | Reviewed note: physical theatre reinterpretation of Macbeth. | neutral → artwork |
| event-ataturke-saygi-csoada-tarihi-2026-11-10 | Gazi Mustafa Kemal Atatürk’ü Anıyoruz — Atatürk’e Saygı Konseri | concert-classical-acoustic | event/concert-classical-acoustic/v01 | svg/artwork/event/concert-classical-acoustic/v01/hero.svg | svg/artwork/event/concert-classical-acoustic/v01/square.svg | svg/artwork/event/concert-classical-acoustic/v01/compact.svg | Reviewed note: Ankara State Classical Turkish Music Choir performing repertoire. | neutral → artwork |

All nine classifications are keyword-assisted editorial review of the exact title and existing catalog note, recorded above and in inventory; there is no automated title classifier. AMADEUS preserves the earlier `keyword-refined` theatre choice. Falda CARMEN is staged musical theatre; Magic Bubbles is a family show despite its ticket URL category. Ankara Kadın Orkestrası uses broad concert-live because the note does not establish classical instrumentation/repertoire. This is an explicit conservative editorial basis, not a factual catalog change.

## Preserved behavior and automated evidence

Event source file is byte-identical to audited main. Domain/catalog facts, IDs, city/place relationships, recommendation eligibility/ranking/free-budget/dismissal/rotation/reasons, Firebase/Rules, persistence, Home/Detail/Onboarding/Preference layouts, logo/icon/splash and release configuration have zero diff against origin/main. Non-Event inventory digest is pinned to audited main. Full golden recommendation JSON digest `098ae0e27173866454765c13f31dac50aca8f9dbafff4c9518f03e9d52ec1676` was independently computed from archived origin/main and pinned in regression tests, including ordering/reasons.

Acoustic paths are unchanged under `svg/artwork/event/concert-classical-acoustic/v01/`; authoritative ledger set `810:102` and all three exact original SVG SHA-256 values are pinned. Existing export verification/checksums/XML tests cover every bundled SVG.

| Verification | Result |
|---|---|
| `git diff --check` | PASS, final staged tree also checked before commit |
| `npm ci` | PASS with network permission; sandbox attempt failed DNS. Lockfile unchanged; npm reported existing 64 vulnerabilities (24 moderate, 38 high, 2 critical). No dependency upgrades in scope. |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 111 domain/release + 115 TypeScript = 226 tests, zero failures |
| `npm run test:catalog` | PASS: 9 Events; catalog 2026-10-12.1 |
| `npm run check:events` | PASS: 9 upcoming, 0 expired, 0 stale, horizon 28.38 days |
| `npm run check:accessibility` | PASS: source contract; not TalkBack acceptance |
| `npm run test:stress` | PASS: 2,560 Place and 640 Experience scenarios; no invariant/rotation failures |
| `npm run check:performance` | PASS: 5,000 iterations, p95 7.269 ms < 25 ms; checksum 22,308 |
| `npm run check:recommendations` | PASS: 15 scenarios; 0 empty / 1 partial / 14 full, 610 candidates / 72 first results, zero invariants/replay/leakage failures; checksum 1,440 |
| `npm run assets:generate` | PASS: 392 mappings / 125 families / 375 variants / 46 icons / 11 UI assets |
| `npm run check:assets` | PASS: byte-for-byte generated index, XML registry and checksums match; regression also reruns generator and compares raw buffers |
| Android Expo readable export | PASS: `CI=1 npx expo export --platform android --no-bytecode --output-dir /tmp/gezek-artwork-android-readable` |
| `npm run check:assets:android -- /tmp/gezek-artwork-android-readable` | PASS: all 9 IDs, 27 layout references / 12 unique SVGs, full exact XML in Android Metro JS. SVGs are inline data, not separate raster assets. |
| Android Expo Hermes export | PASS: `CI=1 npx expo export --platform android --output-dir /tmp/gezek-artwork-android`; 6.7 MB Hermes bundle / 15 font/raster assets. Existing Sentry configuration warnings retained. |
| Protected-source diff against origin/main | PASS: domain/data/recommendations/Firebase/persistence/release/lockfile untouched |
| `npm run check` | NOT RUN: no such script exists |
| Browser integration script | PASS at 393×852 and 412×915; zero page errors/overflow/neutral Event fallbacks; independent save and dismiss do not open detail |

Machine-readable local command results: `evidence/event-artwork/verification-results.json`. Android coverage summary: `evidence/event-artwork/android-coverage.json`. Full command logs remain under `/tmp/gezek-artwork-validation/`; npm install log `/tmp/gezek-artwork-ci.log`. No separate old Python asset validator exists. No remote Firestore read/write, production deployment, signed release, physical Redmi or TalkBack validation was run; these require the corresponding environment/evidence and are outside this artwork task.

## Browser evidence

Actual App/Home and ProductionArtwork render through React Native Web with current code/catalog/engine and native/backend services stubbed. Temporary preview harness was rebuilt in `/tmp/gezek-artwork-browser`; dependencies stayed in `/tmp/gezek-artwork-web-deps`. `tests/event-artwork-browser.cjs` uses `GEZEK_BROWSER_MODULES`, `GEZEK_BROWSER_URL`, `GEZEK_BROWSER_OUTPUT`. No fixture dependency entered package.json or lockfile.

For each width 393 / 412, `evidence/event-artwork/` contains:

- `supply-hero-<width>.png`, `supply-square-<width>.png`: full current eligible supply, main Event plus four alternatives.
- `acoustic-hero-<width>.png`, `acoustic-square-<width>.png`: three real acoustic Events with other IDs dismissed via controlled fixture preferences.
- `family-hero-<width>.png`: Magic Bubbles with other IDs dismissed; honest one-result state, no invented alternatives.
- `responsive-assets-<width>.png`: supplemental asset sheet of all nine exact Events and all 27 responsive layouts, including Compact. Home itself uses Hero and Square; its discovery tiles are separate generic UI exports. No Home layout was changed to force Event Compact.
- `browser-results.json`: viewport, supply counts, no neutral fallbacks, quick-action independence and zero errors.

Browser evidence is not physical-device acceptance. Redmi acceptance remains pending.

## Risks, blockers and next step

No current Event remains on fallback and no family/layout asset is missing. Newly published remote Event IDs require a reviewed inventory/app release; unknown IDs intentionally use neutral. Shared semantic families can repeat across similar concerts/theatre; this is approved existing artwork reuse, not runtime-generated visuals. Inventory review does not verify live ticket availability or override recommendation rules. GitHub CI and human review must pass before any later merge; this task stops after Draft PR delivery.

Redmi retest:
1. Open Etkinlik with non-free budget and matching preferences; refresh to see current IDs. Check CSO/Sempre Mozart/Atatürk tribute acoustic art and Magic Bubbles family art.
2. Inspect Hero and alternative Square art at normal/large font; confirm no neutral current Event cards, cropping or missing SVG fills.
3. Tap bookmark and dismiss independently; verify no detail opens, saved state, undo and restart persistence.
4. Open Event Detail, return with Back/Close and confirm Home state/scroll; verify source facts and existing ranking/free-budget behavior.
5. Record device/build/version and screenshot evidence separately; browser captures are not this acceptance.

## Exact changed files

See [EVENT_ARTWORK_CHANGED_FILES.txt](EVENT_ARTWORK_CHANGED_FILES.txt) for the complete tracked delivery list, including all twelve PNG captures and three JSON evidence files. Unrelated Verilog files are excluded.
