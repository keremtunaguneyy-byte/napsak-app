# Catalog publishing and rollback MVP

The emulator CLI stages a complete Ankara catalog, validates and approves its SHA-256 digest, then publishes it to a local Firestore emulator. It fixes the project to `demo-napsak` and requires `FIRESTORE_EMULATOR_HOST=127.0.0.1:<port>`. Run it from the repository root with the locked dependencies installed and Java 21 available.

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

## First publication with schema-1 legacy metadata

Use this emulator-only path when the Ankara publication head is absent and `catalogMeta/ankara` contains schema `1` with a known version. Plain `status` still refuses this starting state. Check it explicitly, then stage against the **embedded** version:

```sh
npm run catalog:publish -- status --expect-schema-1 2026-08-09.2
npm run catalog:publish -- stage 2026-11-22.1 /path/to/candidate.json --expect-schema-1 2026-08-09.2 --rollback-snapshot /path/to/rollback.json
```

Use the observed legacy version and current embedded version in any other rehearsal. The candidate digest binds the legacy expectation, embedded base, candidate payload and rollback payload. The validation and approval receipts also report the rollback version and its payload SHA-256. Review both snapshots and approve the returned digest with the standard commands. Use a rollback version newer than the legacy and embedded versions, then a candidate version newer than the rollback version. Reserve a third, newer version for a possible restore. Activation rechecks the exact Ankara schema and version and the absent head in the same transaction that writes both releases. A staged receipt alone does not activate anything.

The transaction preserves the legacy metadata and collections. It stores the explicit rollback snapshot as an immutable known-good release and advances the versioned head to the candidate. Validation and activation check both snapshots against the embedded catalog and check that every candidate Saved or Hidden destination survives a restore. Both snapshots must pass Event health at activation. A forward restore rechecks the stored rollback digest, destination continuity and Event health at the time of the restore. If an Event ages out, reverify it at the source and bring a corrected forward candidate to review. After the first publication, use ordinary `status` and omit both cutover flags for subsequent candidates. Exact publish retries use the original receipt. Check `status` separately for the current head.

This path never imports old schema-1 records. Review any legacy-only IDs and unresolved personal-history references before a later live test. The reader already falls back to the embedded catalog while the versioned head is absent. Rehearsing this path requires no edits to the old collections or their metadata.

## How activation and restoration work

- The candidate digest binds its expected base version and serialized payload. Validation applies the app's snapshot checks and the catalog operations checks for Saved destinations, retired Event IDs, stable identities, approved Guide media, geography, and Event health. Publish rechecks the candidate and its base inside the transaction.
- The transaction creates the immutable versioned snapshot and updates `catalogMeta/ankara-published` together. A reader pins the version from the head and reads exactly that release. Concurrent writers on one base have one winner. Existing readers continue to use the legacy path. With compatible metadata, the first publish captures the current legacy seed or the embedded snapshot when the seed is absent or older. With a schema-1 cutover, it uses the explicitly approved rollback snapshot.
- Rollback copies the confirmed good snapshot under a new version and advances the head atomically. The loader accepts remote content only if its version exceeds the embedded/cache fallback. A pointer reset to an old version would leave a client holding the bad cache. The existing numeric revision comparator correctly orders `.10` after `.9`.
- The publisher and client enforce the same inclusive 900 KiB UTF-8 payload cap, which leaves room under Firestore's document limit. Signed-in clients can get published releases. Rules deny client writes and access to staged candidates. The emulator CLI is local. The separate Napsak Dev command below is for Ankara's first cutover, subsequent releases, and forward restore.

## If rollback is blocked

The transaction leaves the active version and its confirmed good reference intact and creates no release. Run `status` to verify the head. Rollback checks that current Saved and Hidden destinations still resolve under their original IDs, including the nine retired Events shipped with PR #85. It also rechecks Event timing, verification age, upcoming inventory and horizon using the rollback clock. Rollback preserves each Event's original `verifiedAt`.

If the target would lose a destination, prepare a forward candidate from the active version that keeps the affected IDs and corrects the bad content. If Event health blocks the target, follow the [Event operations runbook](EVENT_OPERATIONS_RUNBOOK.md) and change verification dates only after checking the sources. Stage, validate and explicitly approve the corrected candidate under a new version. If the correction requires retiring an ID that the shipped client still resolves, stop for review of its personal-history treatment.

## Napsak Dev first cutover

`catalog:publish:napsak-dev` fixes the target to Ankara in `napsak-dev/(default)`. It rejects `FIRESTORE_EMULATOR_HOST` and requires `--target='napsak-dev/(default)'` and an expected `--operator` email on every call. Supply a short-lived Google OAuth access token from the authorized operator's existing session in `GEZEK_CATALOG_ACCESS_TOKEN`. It must cover Firestore and Google userinfo email. The command verifies the token's email and uses that same token for Firestore. Keep it out of arguments, shell tracing, logs, and receipts.

Read-only actions are `status [<expected-legacy-version>]` and `validate <digest>`. When the head is absent and the legacy metadata is schema 1, pass the observed legacy version to `status`. Plain `status` is the default action.

Before any live write, verify the operator's effective access, the exact target, live legacy metadata, the absent head and free release versions, Saved and Hidden reference counts, and current Event health. Obtain the owner's explicit approval for the exact operation and pair. Each write needs `--allow-write`, a matching command, and an operation-specific manifest kept outside Git. The flag and manifest record operating intent. Owner approval is a separate step.

For `stage`, `approve`, and `publish`, use a manifest with the following fields. Use the approved real receipt values in place of the illustrative values. The two snapshot file paths are relative to the manifest file, and the JSON bytes must match the reviewed pair.

```json
{
  "target": "napsak-dev/(default)",
  "city": "ankara",
  "operator": "operator@example.com",
  "operation": "stage",
  "base": "2026-11-27.1",
  "legacy": "2026-08-09.2",
  "digest": "<approved paired SHA-256>",
  "candidateFile": "candidate.json",
  "rollbackFile": "rollback.json"
}
```

The wrapper verifies the manifest and paired bytes before requesting a connection. The matching `approve` and `publish` manifests name those operations with the same pair. Firestore activation still rechecks the expected legacy metadata and absent head in the existing transaction, then records both releases and advances the head atomically. If a publish outcome is ambiguous, retry the exact operation and check the current head separately. An exact retry reports the existing release.

A separately approved forward restore uses a `rollback` manifest with the same target, city and operator. Its operation is `rollback` and its version fields are `from`, `good`, and `version` for the active release, recorded known-good release, and new release. The shared publisher rechecks the head, validates the known-good release, and restores it under the new version. This command keeps the first cutover's known-good pointer available while acceptance is in progress.

## Napsak Dev subsequent releases

Use the same target, verified operator and per-operation write opt-in as above. For each of `stage`, `approve` and `publish`, use a manifest with `mode: "subsequent"`, the expected published `base`, the exact `candidateFile`, and its approved `digest`. The manifest also needs the same `target`, `city`, `operator` and matching `operation`. Omit `legacy` and `rollbackFile`. Existing first-cutover manifests keep their paired digest and require an absent head.

The subsequent digest is SHA-256 of the UTF-8 bytes of `JSON.stringify([base, payload, 'published-head'])`. Here `payload` is the exact serialized snapshot string. The publisher requires the expected live head when staging a new digest. Validation, approval and activation recheck that head and the candidate's continuity against the current release in the transaction. A competing update requires a freshly reviewed base. An exact retry keeps its original receipt and leaves the current head as it is.

A forward correction is another subsequent release. Start from the currently active snapshot, preserve Saved and Hidden destinations, and assign a newer version to the corrected content. Removing an expired Event from discovery happens at its start time. Retain its catalog record while older app builds depend on it for personal history. Verify Event freshness before either approval or activation. The normal publish keeps the recorded known-good pointer. A forward restore of an older release is a separate authorized operation and can fail when that release lacks newly published IDs.

## Before production use

Review operator identity, IAM, audit retention, and separate approval permissions. Plan a client rollout because builds predating the publication reader still use legacy collections. Freeze legacy writes during cutover and verify the initial known-good snapshot, including retired Event IDs and date-sensitive content.

Rehearse with realistic catalog sizes, an installed mobile client, and the target environment's migration and monitoring plan. Decide immutable release retention with in-flight readers in mind. The emulator tests cover the application cache contract with injected storage and a disconnected SDK instance. Device AsyncStorage restart behavior, deployment and production rollout require separate verification.
