# Ankara catalog operations audit

Reference instant `2026-11-17T21:00:00.000Z`. Embedded version `2026-10-12.1`.

| Content | Records | Eligible before preferences | Lifecycle |
|---|---:|---:|---|
| event | 9 | 0 | expired 9 |
| experience | 52 | 52 | active 52 |
| guide | 12 | editorial | editorial 12 |
| idea | 140 | 140 | active 140 |
| place | 178 | 175 | active 175, deprecated 2, verification_required 1 |

## Measured gaps

| Tier | Area | Metric | Affected / measured | Follow-up |
|---:|---|---|---:|---|
| 1 | event | expired at start | 9 / 9 | Event freshness |
| 1 | event | source verification older than 7 days | 9 / 9 | Event freshness |
| 2 | event | empty preference scenarios | 25 / 25 | Event freshness |
| 2 | place | empty preference scenarios | 1 / 25 | catalog expansion |
| 2 | experience | empty preference scenarios | 2 / 125 | catalog expansion |
| 3 | reservation-bearing plans | oldest linked evidence over 90 days | 11 / 12 | source verification |
| 3 | source-bearing records | all valid source URLs point to host roots | 141 / 251 | source verification |
| 3 | experience | partial preference scenarios | 35 / 125 | catalog expansion |
| 3 | place | partial preference scenarios | 1 / 25 | catalog expansion |

## Event operations

- `no_upcoming_events`
- `stale_verification`

## Preference supply

| Surface | Scenarios | Empty | Partial (1–4) | Full (5) |
|---|---:|---:|---:|---:|
| event | 25 | 25 | 0 | 0 |
| experience | 125 | 2 | 35 | 88 |
| idea | 25 | 0 | 0 | 25 |
| place | 25 | 1 | 1 | 23 |

## Integrity and evidence

- 52/52 routes passed ordered linkage and anchor checks across 71 stops.
- 0 ambiguous Saved IDs across 393 destinations.
- 0 stable-ID collision groups, 1 groups share a normalized title, 2 near-title pairs.
- 64 distinct URLs appear on multiple records. 0 source field issues.
- 0 unresolved recommendation artwork references. 12/12 Guide media bindings resolve.
- Runtime snapshot validation passed. In-memory cache round-trip passed.

The [JSON evidence](audit.json) contains district and interest counts, all Event dates, source-host counts and resolver outcomes by layout. The [implementation report](../../CATALOG_OPERATIONS_QUALITY_FOUNDATION_REPORT.md) defines the denominators, severity and follow-up work.
