# N’apsak Agent Instructions

## 1. Source of truth

- Live Git state and the current code are authoritative for repository state.
- `docs/START_HERE.md` is the first project-memory entry point. Read relevant specifications and runbooks before substantial work.
- Documentation may contain stale historical checkpoint SHAs. Never assume an old SHA is current without verifying Git.
- If code and documentation conflict, report the conflict instead of silently changing product behavior.
- `OPEN`, experimental, and unresolved decisions are not approved requirements. User approval is required before promoting an open product decision into implementation.

Recommended reading order:

1. `docs/START_HERE.md`
2. `docs/STATUS.md`
3. `docs/PRODUCT_SPEC.md`
4. `docs/DECISIONS.md`
5. The task-specific specification or runbook

Task-specific references:

- Algorithm: `docs/ALGORITHM_SPEC.md`
- Design: `docs/DESIGN_SPEC.md`
- Firebase: `docs/FIREBASE_RUNBOOK.md`
- Analytics: `docs/ANALYTICS_SPEC.md`
- Observability: `docs/OBSERVABILITY_RUNBOOK.md`
- Events: `docs/EVENT_OPERATIONS_RUNBOOK.md`
- Performance: `docs/PERFORMANCE_RUNBOOK.md`
- Device acceptance: `docs/DEVICE_ACCEPTANCE_RUNBOOK.md`
- Release: `docs/RELEASE_RUNBOOK.md`

## 2. Product guardrails

Unless a task explicitly requires and approves the change, do not silently change:

- N’apsak’s recommendation-first product direction
- The Experience / N’apsak, Mekân, Etkinlik, and Fikir content separation
- Ankara 101 as a separate editorial surface
- Eligibility-before-ranking behavior
- Dismissed-before-scoring behavior
- The default rule that saved status does not affect ranking
- Recommendation weights, hard filters, ranking, diversity, rotation, recommendation explanations, or catalog semantics
- Stable IDs, `cityId` relationships, or `Experience.points[].placeId` relationships

Current design work is still evolving. Do not treat the current UI or `docs/DESIGN_SPEC.md` as proof of final visual approval, and do not perform a broad UI redesign unless explicitly requested.

## 3. Local Git workflow

1. Verify Git status, current branch, HEAD, and `origin/main` before substantial work.
2. Never develop directly on `main`.
3. Start from a clean, verified `main`.
4. Create a short-lived feature branch for one logical unit of work.
5. Multiple local implementation, test, and device iterations are allowed before pushing.
6. Local checkpoint commits are allowed when useful.
7. Do not create a commit unless the user explicitly requests a commit or the task explicitly includes committing as an approved step.
8. Do not push partial experiments unless explicitly requested.
9. Push only when the logical unit is ready for review.
10. Create one final pull request per completed logical unit.
11. Require relevant local validation before push.
12. Require GitHub CI before merge.
13. Re-verify `main` after merge.

Never reset, clean, stash, overwrite, or delete unrelated user work without explicit approval. Never modify unrelated files merely because issues were noticed; report out-of-scope issues separately.

## 4. Testing and validation

Historical test results do not validate the current working tree.

Minimum baseline for normal code changes:

- `git diff --check`
- `npm run typecheck`
- `npm test`

Additional task-specific validation:

- Algorithm or catalog changes: `npm run test:stress`, `npm run test:catalog`, and `npm run check:performance`
- Firebase Rules: `npm run test:rules`
- Release or readiness: `npm run check:release`
- UI or behavior: relevant automated tests and device/manual validation when appropriate

Expo Go or development-build testing is not release-device evidence. A historical phone test is not current signed-release evidence. Do not claim production verification from local tests.

## 5. Release and production safety

- Release blockers may only be closed with real evidence.
- Do not invent production IDs, package identifiers, bundle identifiers, EAS project IDs, Firebase project values, Sentry DSNs, URLs, test results, device results, or user data.
- Never commit secrets, keys, certificates, tokens, service-account files, or production credentials.
- Production operations require explicit user approval and verification of the correct account and environment.
- AI agents must not autonomously modify production systems.

## 6. Scope discipline

- Inspect before editing.
- Make the smallest coherent change that satisfies the task.
- Do not opportunistically refactor unrelated code.
- Do not silently expand scope.
- If a task requires a product decision that is not approved, stop and report the decision needed.
- Preserve backward compatibility unless the task explicitly approves breaking behavior.

## 7. Completion report

Every implementation task must report:

- Branch
- Changed files
- Behavior changed
- Behavior intentionally not changed
- Validation commands run and results
- Validation not run and why
- Device/manual validation if relevant
- Remaining risks, blockers, or unresolved issues
- Whether a commit was created
- Whether a push occurred
- Whether a pull request was created
- Recommended next step
