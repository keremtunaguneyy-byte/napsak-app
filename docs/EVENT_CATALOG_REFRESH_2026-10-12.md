# Event catalog refresh — 12 October 2026

Branch: `codex/gezek-event-catalog-refresh-2026-10-12`.
Base: fetched `origin/main` = `262c84e45e87b2d9401914c2c04326e4f58869b2` (merged PR #70).
Repository: `/Users/kerem/Documents/ChatGPT/Napsak codex/napsak-app`.
Unrelated untracked `src/firebase/BA_4bit.sv/` preserved.

Only Event data, catalog regression tests and this evidence report change. No algorithm, UI/navigation, Firebase schema/contracts, persistence, release configuration, artwork mapping, Place, Experience, Idea or Guide changes. No production operations or merge.

New event IDs use the existing neutral branded visual fallback in Hero, Square and Compact layouts. The artwork registry is unchanged; tests explicitly enumerate the eight new IDs and retain all existing mapped artwork checks. AMADEUS remains first in the array and retains its mapped visual.

All included sessions have explicit +03:00 starts and `verifiedAt=2026-10-12`. Dates, time, venue and entry restrictions were checked against direct institution/organizer/ticket pages. Ticket sale listings confirm available sessions; no seats were reserved or purchased. Availability can change after verification.

## Removed: 13 expired sessions

Each was already past its start on 12 October in Europe/Istanbul. IDs are retired, not repurposed. Removal uses the existing runbook semantics, not a fresh verification of historical ticket pages.

| Stable ID / event | Start (+03:00) | Previous source | Result |
|---|---|---|---|
| `event-ankara-open-wta-125-2026-09-22` / Türk Telekom Ankara Open WTA 125 | 2026-09-22T10:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/turk-telekom-ankara-open-wta-125) | Removed: expired |
| `event-masumiyet-demirkubuz-visnelik-2026-09-23` / ODTÜ MD Vişnelik Çim Amfi Açık Hava Sineması – Zeki Demirkubuz ile Masumiyet Film Gösterimi & Söyleşi | 2026-09-23T20:15:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etiket/odtu-md-visnelik-cim-amfi-acik-hava-sinemasi) | Removed: expired |
| `event-one-more-atilim-2026-09-24` / ONE MORE | 2026-09-24T21:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/one-more) | Removed: expired |
| `event-sami-yusuf-congresium-2026-09-24` / Sami Yusuf | 2026-09-24T21:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/sami-yusuf) | Removed: expired |
| `event-tca-burger-fries-workshop-2026-09-24` / TCA | Burger & Fries Workshop | 2026-09-24T19:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/tca-burger-fries-workshop) | Removed: expired |
| `event-trivia-night-alti-ustu-2026-09-26` / Trivia Night - Bilgi Yarışması | 2026-09-26T19:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/trivia-night-) | Removed: expired |
| `event-candles-echoes-meb-sura-2026-09-26` / Candles and Echoes - Ankara | 2026-09-26T21:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/candles-and-echoes-ankara) | Removed: expired |
| `event-happy-pigs-cayyolu-2026-09-27` / Happy Pig\ | 2026-09-27T17:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/happy-pigs-ogreniyor) | Removed: expired |
| `event-ankara-cocktail-festival-2026-09-27` / Ankara Cocktail Festival | 2026-09-27T14:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/ankara-cocktail-festival) | Removed: expired |
| `event-golden-chef-el-yapimi-makarnalar-2026-09-29` / Golden Chef — El Yapımı Makarnalar Workshop | 2026-09-29T11:00:00+03:00 | [source](https://goldenchef.com.tr/workshoplar/) | Removed: expired |
| `event-ajda-pekkan-oran-2026-09-30` / Ajda Pekkan | 2026-09-30T21:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/ajda-pekkan) | Removed: expired |
| `event-bubble-show-cukurambar-2026-10-03` / Bubble Show | 2026-10-03T14:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/bubble-show) | Removed: expired |
| `event-tastydays-visnelik-2026-10-11` / TastyDays Ankara Gastronomi Festival | 2026-10-11T12:00:00+03:00 | [source](https://www.bubilet.com.tr/ankara/etkinlik/tastydays) | Removed: expired |

## Included: one retained, eight added

| Stable ID / event | Start (+03:00) | Exact venue | Exact source | Verification result |
|---|---|---|---|---|
| `event-cso-iki-keman-bir-miras-2026-10-16` / Cumhurbaşkanlığı Senfoni Orkestrası — İki Keman Bir Miras | 2026-10-16T20:00:00+03:00 | CSO Ada Ankara, Ziraat Bankası Ana Salon | [ticket page](https://biletinial.com/tr-tr/muzik/cumhurbaskanligi-senfoni-orkestrasi-iki-keman-bir-miras-cso) | Added new ID; date/time/venue and sale listing confirmed; Tam bilet 150 ₺’den; öğrenci 75 ₺’den |
| `event-amadeus-congresium-2026-10-16` / AMADEUS - Veda Turnesi | 2026-10-16T20:30:00+03:00 | Congresium Ankara | [ticket page](https://www.bubilet.com.tr/ankara/etkinlik/amadeus) | Retained ID; price refreshed; date/time/venue and sale listing confirmed; 2.195 ₺’den başlayan seçenekler |
| `event-sempre-mozart-ankara-dob-2026-10-23` / Sempre Mozart — Ankara DOB | 2026-10-23T20:00:00+03:00 | CSO Ada Ankara, Bankkart Mavi Salon | [ticket page](https://biletinial.com/tr-tr/opera-bale/sempre-mozart-ankara-dob) | Added new ID; date/time/venue and sale listing confirmed; 2. kategori 170 ₺; 1. kategori 250 ₺ |
| `event-magic-bubbles-csoada-2026-10-24` / Magic Bubbles | 2026-10-24T17:00:00+03:00 | CSO Ada Ankara, Fuaye | [ticket page](https://biletinial.com/tr-tr/muzik/magic-bubbles-csoada) | Added new ID; date/time/venue and sale listing confirmed; Tam bilet 480 ₺ |
| `event-falda-carmen-xl-ataturk-sanat-2026-10-31` / Falda CARMEN Çıktı XL Müzikali | 2026-10-31T20:30:00+03:00 | Çankaya Belediyesi Atatürk Sanat Merkezi | [ticket page](https://www.biletix.com/etkinlik/5FFEA/TURKIYE/tr/falda-carmen-cikti-xl-muzikali-31-10-2026-ankara) | Added new ID; date/time/venue and sale listing confirmed; 1.350 ₺’den |
| `event-bir-aile-provasi-ataturk-sanat-2026-11-01` / Bir Aile Provası: Yaşayın Gitsin | 2026-11-01T20:30:00+03:00 | Çankaya Belediyesi Atatürk Sanat Merkezi, Kırmızı Salon | [ticket page](https://www.biletix.com/etkinlik/55AP6/TURKIYE/tr) | Added new ID; date/time/venue and sale listing confirmed; 550 ₺’den |
| `event-ankara-kadin-orkestrasi-csoada-2026-11-02` / Ankara Kadın Orkestrası Konseri | 2026-11-02T19:30:00+03:00 | CSO Ada Ankara, Ziraat Bankası Ana Salon | [ticket page](https://biletinial.com/tr-tr/muzik/ankara-kadin-orkestrasi-konseri-csoada) | Added new ID; date/time/venue and sale listing confirmed; 5. kategori 650 ₺’den |
| `event-satonun-altinda-ataturk-sanat-2026-11-07` / Şatonun Altında | 2026-11-07T20:00:00+03:00 | Çankaya Belediyesi Atatürk Sanat Merkezi, Mavi Salon | [ticket page](https://dt.biletinial.com/tr-tr/tiyatro/satonun-altinda-yy) | Added new ID; date/time/venue and sale listing confirmed; 877 ₺’den |
| `event-ataturke-saygi-csoada-tarihi-2026-11-10` / Gazi Mustafa Kemal Atatürk’ü Anıyoruz — Atatürk’e Saygı Konseri | 2026-11-10T20:00:00+03:00 | CSO Ada Ankara, Tarihi Salon | [ticket page](https://biletinial.com/tr-tr/muzik/gazi-mustafa-kemal-ataturku-aniyoruz-ataturke-saygi-konseri-csoada) | Added new ID; date/time/venue and sale listing confirmed; Tam bilet 260 ₺’den; öğrenci 130 ₺’den |

### Cross-checks and metadata limits

- [İki Keman Bir Miras — official CSO detail](https://csoadaankara.gov.tr/tr/event/detail/15942/15957/cumhurbaskanligi-senfoni-orkestrasi-ki-keman-bir-miras): 16 October 20:00, Ziraat Bankası Ana Salon. Direct ticket page shows the same session and price categories.
- [Sempre Mozart — Sanat Cepte](https://sanatcepte.gov.tr/etkinlik/etkinlik-detay/sempre-mozart-ankara-dob): 23 October 20:00, Bankkart Mavi Salon. Direct ticket page has available seats and category prices.
- [Magic Bubbles — Sanat Cepte](https://www.sanatcepte.gov.tr/etkinlik/etkinlik-detay/magic-bubbles-csoada): 24 October 17:00, Fuaye, ticket required for every participant. Direct ticket page shows available seats and 480 TL full-price category; no unsupported duration or age limit added.
- [Falda Carmen XL — municipal detail](https://asm.cankaya.bel.tr/etkinlik/falda-carmen-cikti-xl-muzikali): 31 October 20:30. Biletix indexed direct listing explicitly shows “Satışta”, 1,350 TL starting price and 16+ entry. Direct HTTP fetch returned 403 and web open cache misses; evidence is the direct ticket provider's indexed listing plus the accessible municipal detail, not a live seat-map check.
- [Bir Aile Provası — municipal detail](https://asm.cankaya.bel.tr/etkinlik/bir-aile-provasi-yasayin-gitsin) and [BKM organizer](https://bkmonline.net/tr/etkinlikler/bir-aile-provasi-yasayin-gitsin): 1 November 20:30. Biletix event page explicitly shows “Satışta” and 550 TL starting price. Organizer says 80 minutes, Biletix says 90 minutes and municipal calendar gives a two-hour window: no endsAt added.
- [Ankara Kadın Orkestrası — Sanat Cepte](https://www.sanatcepte.gov.tr/etkinlik/etkinlik-detay/ankara-kadin-orkestrasi-konseri-csoada): 2 November 19:30, Ziraat Bankası Ana Salon. Ticket page confirms available seats and 650 TL category. Women-only audience restriction is explicitly stated in the note; existing eligibility code has no gender filter and is unchanged. Only the requested 2 November session was included.
- [Şatonun Altında — municipal detail](https://asm.cankaya.bel.tr/etkinlik/satonun-altinda-oyunu): 7 November 20:00. Ticket source confirms Mavi Salon, available seats, 877 TL starting price and 16+. Ticket duration is 75 minutes while municipal calendar gives a two-hour window: no endsAt added.
- [Atatürk’e Saygı — Sanat Cepte](https://sanatcepte.gov.tr/etkinlik/etkinlik-detay/gazi-mustafa-kemal-ataturku-aniyoruz-ataturke-saygi-konseri-csoada): 10 November 20:00, Tarihi Salon. Ticket page confirms available seats; full-price category begins at 260 TL, student at 130 TL.
- AMADEUS retains its genuinely unchanged session identity, venue, 150-minute duration, 12+ note and editorial metadata. Only the verified date and stale starting price change.
- Biletinial headline amounts ending in 0.01 differ from its named ticket category amounts. Price notes use explicitly named categories, distinguish student discounts, and do not treat JSON-LD's generic zero price as free entry. Final fees/availability must be checked at purchase.
- `priceLevel`, moods, interests, group sizes and editorial scores are catalog editorial classifications, not provider ratings or guarantees of admission. New editorial scores use 4.5; AMADEUS's existing 4.9 is preserved. No recommendation weights or ranking logic change.
- Most optional endsAt values are omitted rather than inferred. Age/entry restrictions are included only where directly supported.

## Candidates excluded

| Candidate | Exact checked source | Result |
|---|---|---|
| Carmen — Ankara DOB, 17 October | [Sanat Cepte](https://www.sanatcepte.gov.tr/etkinlik/etkinlik-detay/carmen-ankara-dob) | Explicit “Tükendi”; excluded under the runbook. |
| Duo Blanc & Noir, 8 November | [Municipal detail](https://asm.cankaya.bel.tr/etkinlik/duo-blanc-ve-noir-piyano-ikilisi), [Biletix](https://www.biletix.com/performance/5QF9A/001/ANKARA/en), [Bubilet](https://www.bubilet.com.tr/ankara/etkinlik/duo-blanc-noir-piyano-ikilisi) | Municipality/Biletix name Atatürk Sanat Merkezi; Bubilet names Çankaya Sahne. Excluded pending venue reconciliation; prices not transplanted between venues. |
| CSO Ata’ya Saygı, 13 November | [Sanat Cepte](https://www.sanatcepte.gov.tr/etkinlik/etkinlik-detay/cso-denizbank-konserleri-ataya-saygi-konseri-cso) | Programme/time/venue confirmed; sale opens 14 October 20:00. Current price unavailable; excluded rather than invent mandatory priceLevel. |
| Film Müzikleri, 20 November | [Sanat Cepte](https://sanatcepte.gov.tr/etkinlik/etkinlik-detay/cso-denizbank-konserleri-film-muzikleri-hollywooddan-cinecittaya-cso) | Same sale-opening constraint; price unavailable. |
| Fazıl Say — Umut Senfonisi, 27 November | [Sanat Cepte](https://sanatcepte.gov.tr/etkinlik/etkinlik-detay/cso-denizbank-konserleri-fazil-say-umut-senfonisi-cso) | Same sale-opening constraint; price unavailable. The work is programmed; no claim that Fazıl Say performs. |
| Tango After Dark | User-provided unresolved 20:00/21:00 discrepancy | Excluded as requested; no new verification claimed. |

No exhibitions or arbitrary target count were added.

## Regression coverage

The fixed verification instant is 12 October 2026 23:59:59 Europe/Istanbul (covers the full verification day). Tests require zero expired active records, at least five upcoming records, a horizon beyond seven days, valid HTTPS source URLs, calendar-valid verification dates, exact +03:00 starts, unique IDs and normalized title/date sessions. All thirteen expired IDs must remain absent and AMADEUS must retain its ID. Each included session is recommendable immediately before its start and excluded at the exact start.

## Validation and delivery

Changed files:
- `src/data/events.ts`
- `tests/domain.test.cjs`
- `tests/gezek-production-assets.test.ts`
- `docs/EVENT_CATALOG_REFRESH_2026-10-12.md`

| Command | Final result |
|---|---|
| `git diff --check` | PASS |
| `npm ci` | PASS with network access; initial sandbox attempt failed with registry DNS ENOTFOUND. Lockfile unchanged. npm reported 64 dependency vulnerabilities (24 moderate, 38 high, 2 critical); dependency remediation is outside this maintenance scope. |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 111 domain/release tests + 88 TypeScript tests = 199; zero failures. Earlier runs exposed historical event-count/rotation/artwork assumptions; catalog-specific tests now cover the refreshed supply and existing fallback. |
| `npm run test:catalog` | PASS: local runtime validation/parity, 9 Events; no remote Firebase access. |
| `npm run check:events` | PASS: 9 upcoming, 0 expired, 0 stale, horizon 28.91 days at run time; no issues. |
| `npm run check:accessibility` | PASS: source contract, 8 files / 16 minimum target styles. |
| `npm run test:stress` | PASS: 2,560 Place + 640 Experience scenarios; no empty eligible pools, interest leaks, duplicates or rotation overlap; no duration leaks for Experience. |
| `npm run check:performance` | PASS: 5,000 iterations, p95 9.353 ms against 25 ms budget. |
| `npm run check:recommendations` | PASS: 15 scenarios, zero objective invariant failures / deterministic failures / expired or invalid event leaks. |
| `CI=1 npx expo export --platform android --output-dir /tmp/gezek-event-refresh-android` | PASS on final Event data: 1,417 modules, 6.7 MB Hermes bundle, 15 assets. Output is temporary and uncommitted. Existing Sentry organization/project fallback warning and terminal color warnings were emitted. |

Validation not run locally: Firebase Rules and release readiness (no rules/release change), signed native device acceptance (catalog-only task), remote Firestore parity/seeding/deployment (no production operation authorized). GitHub CI must be checked on the Draft PR; no merge is authorized.

The saved-ID behavior and cache/catalog version (`2026-09-21.1`) remain unchanged. Removed historical Event IDs can no longer resolve from the active catalog; no persistence migration is performed. Firestore catalog data is unchanged, so a remote catalog may continue to serve prior data until a separately approved publication step.

Commit/push/Draft PR delivery follows local validation; exact commit SHA and PR URL are reported in the chat and PR metadata rather than embedding a self-referential commit SHA in this file.
Device/manual app validation not run: this is catalog-only maintenance. Public source checks above are content verification, not signed-release device acceptance. No production verification is claimed.

Next: review the Draft PR and CI; continue the existing seven-day source verification cycle. Recheck excluded future CSO concerts when ticket sales open, and resolve Duo venue discrepancy before a separate addition.
