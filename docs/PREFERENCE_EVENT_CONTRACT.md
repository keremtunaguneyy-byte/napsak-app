# Production Preference Editor and Event Empty States — approved contract

Approved by the user's corrected 2026-10-13 product decision. Baseline: verified fetched main `a04c385f3854eb47a979208b54d7cb44b592053a` (merged #73). Implementation branch: `codex/gezek-preference-editor-event-empty-states`; one Draft PR, no merge.

## Scope and authority

Figma file `yTdAWr92ETyurlQQHNNqpi`: overview `288:1879`, budget sheet `288:2439`, shared field sheet family `266:745` (Mood `266:638`, Duration `266:663`, Budget `266:691`, Group `266:719`), interest controls `30:242` / `31:86`. Event action `974:4278`, panel family `974:4326`, states `974:4279`, `974:4289`, `974:4298`, `974:4309`, `974:4318`. Long-copy / large-text QA: `974:5192`, `974:5280`. Existing production Home is the runtime shell, including header, atmosphere, content selector, location notice, fixed navigation and card geometry.

**Event discovery remains unfiltered by date.** No Today/Tomorrow/Weekend row, selected/button semantics, date state, persistence, recommendation input or filtering is added. Figma full screens demonstrate placement/hierarchy/clearance; their date chips are explicitly excluded. A future functional date-discovery PR requires approved intervals and a separate truthful `date_no_match` state. `no_current_catalog` means zero current verified Events in the entire usable active catalog.

The Figma Duration sheet says "Yol süresi dâhil". The current approved PRODUCT_SPEC §6.2 / ALGORITHM_SPEC and runtime exclude travel to the first stop and homeward travel. Preserve the approved runtime meaning: maximum plan duration, first-stop arrival/homeward travel excluded; explain this in the editor. This copy conflict does not authorize an algorithm change.

## Preference sessions

Home Düzenle opens Bugünkü tercihlerin above the still-mounted Home. Mood, duration, budget, group and persistent interests show their current values. Shared approved choice controls edit a session-local field draft. Field Apply returns to overview; its changes are committed only by overview Değişiklikleri kaydet, as one compatible preference snapshot. Field Cancel/Back discards that field's edits. Back then closes overview to Home; Close exits the whole editor and discards all unapplied edits.

Event budget CTA opens the budget sheet directly. Budget-only Apply changes budget only and exits to the Event surface; Cancel/Back/Close writes nothing. User-facing `Ücretsiz` is Bedava; `Tek` is 1 kişi; `5+` is 5+ kişi. Stored enum values, v5 preference schema, onboardingCompleted, interactions and Firebase contracts remain compatible. Editing does not revisit onboarding/progress/preparation.

Actual Home context retained: active content filter, run/seed, previous batch and origin scroll. Return focus: Home editor → preference control; Event budget Cancel → budget action; Event budget Apply → first Event card or Event tab; restore/retry success → first card; retry failure → error title/action. The Modal routes Android onRequestClose through the same field → overview → origin reducer. Native confirmation remains a device check.

## Event presentation

One deterministic resolver uses real recommendation results and isolated diagnostic runs of `recommendAll(filter: 'event')`, never changes ranking or eligibility, and never leaks budget-relaxed paid records into visible free results. Diagnostics enumerate the complete eligible Event set, beyond the five displayed cards, before dismissal; the relaxed set omits only budget and dismissal to diagnose inventory independently of scoring.

Precedence:

1. Explicit total failure with no usable safe catalog → load_error.
2. Actual catalog bootstrap/retry pending → loading.
3. No future-start current Event in the globally usable catalog → no_current_catalog.
4. Nonempty budget-eligible pre-dismiss set whose entire ID set is dismissed → all_dismissed.
5. Zero visible and zero pre-dismiss budget-eligible results, but a nonempty budget-relaxed current set → budget_no_match.
6. Nonempty visible eligible results → populated.

An inconsistent/unmapped combination raises a diagnostic error instead of presenting invented copy. Current explicit Event eligibility has no mood/interest/group/duration hard gate; all known zero results are covered. Source freshness remains the existing catalog-validation/editorial contract, not a new runtime expiry gate.

Restore is one interaction reducer action removing only the current pre-dismiss Event IDs. All other dismissals and saved order/content remain untouched. Retry calls the real catalog-only `loadBestCatalog` path through refreshActiveCatalog; no preference, saved/dismissed, Auth migration or user-sync writes. Valid cache/embedded fallback remains usable when remote refresh fails. The bundled valid catalog normally prevents total-load failure; injected no-safe-catalog tests exercise the exceptional error/retry branch honestly.

Approved title, explanation and action copy is retained. Global-empty informational copy has no primary CTA; loading action exposes busy + disabled. No artificial prototype 0.9-second timer. Editor and panel replacement use instant transitions under both normal and reduced motion. Decorative assets are hidden from assistive technology; controls are at least 44 px; growing content and measured editor footer clearance prevent large text being hidden under fixed navigation.

## Evidence

The preserved pre-implementation audit is under `docs/evidence/preference-event/pre-implementation-audit.*`. It examined 12,800 valid current unfiltered preferences: 2,560 budget_no_match and 10,240 populated, no unexplained zero or paid leakage. The total 163,840 real recommendation calls included proposed date-window diagnostics; those scenarios remain explicitly outside runtime scope. Current focused tests add preference × five catalog fixtures × dismissal scenarios plus all 512 production Event dismissal subsets. Browser evidence is RN Web with stubbed native/backend services, never native or release-device proof. See PREFERENCE_EVENT_IMPLEMENTATION_REPORT.md.
