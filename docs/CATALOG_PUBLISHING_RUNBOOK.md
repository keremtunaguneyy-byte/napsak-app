# Catalog publishing and rollback MVP

The operator stages a complete Ankara catalog, validates and approves its SHA-256 digest, then publishes it to a local Firestore emulator. The CLI fixes the project to `demo-napsak` and requires `FIRESTORE_EMULATOR_HOST=127.0.0.1:<port>`. Run it from the repository root with the locked dependencies installed and Java 21 available.

## Rehearse locally

Run the client acceptance and security rules suites sequentially. They use the same emulator port and manage their own isolated test data.

```sh
npm run test:catalog-publishing
npm run test:rules
```

For a manual CLI rehearsal, start a fresh emulator in one terminal. In another terminal, use the demo project and loopback address below. An existing local emulator may contain other rehearsal data, so check `status` before staging.

```sh
npx --no-install firebase emulators:start --project demo-napsak --only firestore
```

```sh
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
npm run catalog:publish -- status
```

On a fresh emulator, the base is the embedded version `2026-11-22.1`. This fixture command copies that snapshot and makes two synthetic edits for rehearsal. The embedded Events are time sensitive. This exact fixture is suitable for the November 2026 acceptance window. A later rehearsal needs a candidate with current, validated Events, or the automated suite with its fixed test clock.

```sh
node --import tsx - <<'JS'
const { writeFileSync } = require('node:fs');
const { embeddedCatalog } = require('./src/data/catalog');
for (const [revision, note] of [[2, 'Emulator good'], [9, 'Emulator bad']]) {
  const snapshot = structuredClone(embeddedCatalog('ankara'));
  snapshot.catalogVersion = '2026-11-22.' + revision;
  snapshot.fetchedAt = new Date().toISOString();
  snapshot.ideas[0].note = note;
  writeFileSync('/tmp/gezek-catalog-rehearsal-' + revision + '.json', JSON.stringify(snapshot));
}
JS
npm run catalog:publish -- stage 2026-11-22.1 /tmp/gezek-catalog-rehearsal-2.json
```

Review the submitted snapshot against its expected base. Save the printed digest in `GOOD_DIGEST`, then run the following commands. Approval applies to this digest only. A changed payload or base requires staging and approving a new digest. Confirm a version as good after loading the published snapshot with a client and verifying the intended content.

```sh
npm run catalog:publish -- validate "$GOOD_DIGEST"
npm run catalog:publish -- approve "$GOOD_DIGEST"
npm run catalog:publish -- publish "$GOOD_DIGEST"
npm run catalog:publish -- confirm-good 2026-11-22.2
npm run catalog:publish -- stage 2026-11-22.2 /tmp/gezek-catalog-rehearsal-9.json
```

Save the new digest in `BAD_DIGEST`. Publish the second fixture, let a test client load it, and restore the confirmed good content. The automated suite verifies this exact cache transition using the app's catalog loader and Firestore repository.

```sh
npm run catalog:publish -- approve "$BAD_DIGEST"
npm run catalog:publish -- publish "$BAD_DIGEST"
npm run catalog:publish -- rollback 2026-11-22.9 2026-11-22.2 2026-11-22.10
npm run catalog:publish -- status
```

The active version should be `2026-11-22.10`, with `2026-11-22.2` recorded as good. Exact retries return `already published` or `already restored`. These are receipts for the earlier operation. Check `status` for the current head. A stale base or conflicting target version requires a fresh review. If a publish returns an unknown outcome, retry the same digest and check the head before making another candidate.

## How activation and restoration work

- The candidate digest binds its expected base version and serialized payload. Validation applies the app's snapshot checks and the catalog operations checks for Saved destinations, retired Event IDs, stable identities, approved Guide media, geography, and Event health. Publish rechecks the candidate and its base inside the transaction.
- The transaction creates the immutable versioned snapshot and updates `catalogMeta/ankara-published` together. A reader pins the version from the head and reads exactly that release. Concurrent writers on one base have one winner. Existing readers continue to use the legacy path. Before the first publish, a current legacy seed is captured as the baseline, or the embedded snapshot is used when the seed is absent or older.
- Rollback copies the confirmed good snapshot under a new version and advances the head atomically. The loader accepts remote content only if its version exceeds the embedded/cache fallback. A pointer reset to an old version would leave a client holding the bad cache. The existing numeric revision comparator correctly orders `.10` after `.9`.
- The publisher and client enforce the same inclusive 900 KiB UTF-8 payload cap, which leaves room under Firestore's document limit. Signed-in clients can get published releases. Rules deny client writes and access to staged candidates. The admin CLI is emulator-only.

## If rollback is blocked

The transaction leaves the active version and its confirmed good reference intact and creates no release. Run `status` to verify the head. Rollback checks that current Saved and Hidden destinations still resolve under their original IDs, including the nine retired Events shipped with PR #85. It also rechecks Event timing, verification age, upcoming inventory and horizon using the rollback clock. Rollback preserves each Event's original `verifiedAt`.

If the target would lose a destination, prepare a forward candidate from the active version that keeps the affected IDs and corrects the bad content. If Event health blocks the target, follow the [Event operations runbook](EVENT_OPERATIONS_RUNBOOK.md) and change verification dates only after checking the sources. Stage, validate and explicitly approve the corrected candidate under a new version. If the correction requires retiring an ID that the shipped client still resolves, stop for review of its personal-history treatment.

## Before production use

Review operator identity, IAM, audit retention, and separate approval permissions. Plan a client rollout because builds predating the publication reader still use legacy collections. Freeze legacy writes during cutover and verify the initial known-good snapshot, including retired Event IDs and date-sensitive content.

Rehearse with realistic catalog sizes, an installed mobile client, and the target environment's migration and monitoring plan. Decide immutable release retention with in-flight readers in mind. The emulator tests cover the application cache contract with injected storage and a disconnected SDK instance. Device AsyncStorage restart behavior, deployment and production rollout require separate verification.
