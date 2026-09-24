# DiscordAutoBot Major Release Final Review

**Status:** `MAJOR_RELEASE_READY_FOR_DEPLOYMENT_REVIEW`  
**Production baseline:** `25dee3343d3dbb549afe8658b4ab01819d396294`  
**Current candidate:** local GitHub `main`; deployment remains a separate approval.

## Scope and product result

The desired managed server is fixed at **16 categories**, **43 persistent channels**, and **10 game areas**: four full, three compact, and three voice-only. There is no archive category or archive action. TempVoice rooms and tickets remain runtime/protected resources, outside persistent reconciliation.

The production-shaped fixture begins with 132 current resources and 59 desired managed resources. Its fully reviewed immutable plan is deterministic: **24 operations**: six channel creates, three renames, nine permission reconciliations, and six channel deletes. There are no moves or category deletes. All review entries resolve without `UNDECIDED`, `STALE`, `CONFLICT`, or orphaned decisions.

The final reconciliation release test applies the approved target shape to a fake inventory and re-previews it. It permits only user-managed `IGNORE_GOVERNANCE` review entries; no governed create, move, rename, permission, delete, or conflict action remains.

## Human evidence

- [Delete manifest](SERVER_GOVERNANCE_DELETE_MANIFEST.md): six voice-only legacy text channels only.
- [Permission manifest](SERVER_GOVERNANCE_PERMISSION_MANIFEST.md): nine canonical-profile reconciliation operations.
- The compiler snapshots resource ID, type, name, parent identity, permission summary, canonical identity, owner, and lifecycle. Its fingerprint covers the complete ordered immutable operation set.
- Fresh inventory, desired-state, and human-decision fingerprints must all validate before execution. Duplicate execution, stale plans, altered confirmation, protected targets, and tampered operations abort without mutation.

## Execution safety and failure matrix

The transaction layer records operation state, receipts, rollback evidence, and interrupted transactions. It is covered for rename, move, permission, and delete write failures; stale/permission drift; protected and unexpected-child deletion guards; early rollback; irreversible partial rollback; duplicate execution; confirmation mismatch; tampered plans; and restart recovery.

Execution is intentionally **not public**: no slash command or dashboard action invokes it. `SERVER_GOVERNANCE_EXECUTION_ENABLED` stays `false` unless separately authorized. A deployment review must set `SERVER_GOVERNANCE_ENABLED=true` explicitly and retain execution disabled until the exact approved plan and live read-only validation are signed off. No `.env` file is changed by this release.

## State and deployment procedure

Release-local stores use `src/data/server-governance-review-decisions.json`, `src/data/server-governance-approved-plans.json`, and `src/data/server-governance-execution-transactions.json`. A deployment must preserve these files with the same ownership and backup approach as the existing `src/data` and `src/legacy/data` state. The immutable plan, review decisions, and transaction receipt must be backed up together.

1. Pull the reviewed GitHub commit on the server without enabling execution.
2. Verify the deployed commit and environment flags; do not print secrets.
3. Perform a read-only inventory/preview, reconcile IDs, review actions, manifests, and the newly compiled fingerprint.
4. Confirm the bot can start and the existing slash-command registry remains complete. Keep governance execution disabled.
5. Only after explicit human approval may a separately authorized operator enable the execution flag, generate a fresh plan, submit its exact confirmation, and monitor the receipt.
6. Roll back by restoring the previous application release and the matching state backup. Never reuse an old confirmation or receipt to execute a changed plan.

The non-executing smoke checklist is: bot readiness, command registration, dashboard/API health where deployed, guide/roadmap/welcome behavior, TempVoice creation lifecycle, ticket flow, game-role preview, and read-only governance preview. Any mismatch means stop and restore the previous release.

## Operational boundaries

- No release task SSHed to Vultr, restarted PM2, enabled execution, or mutated a Discord guild.
- `channelDelete.js` is unchanged.
- Legacy structural mutation routes remain centrally blocked while governance mode is enabled, preventing parallel mutation paths.
- Command registry review remains 72 deployed command definitions: seven main routes plus 65 compatibility aliases; no duplicate names and no public governance execution command.

## Known limitations and rollout condition

This local candidate is ready for **deployment review**, not automatic deployment. A production rollout still requires a fresh live read-only inventory, current human decisions, backup verification, a runtime smoke check, and an explicit execution authorization. The live server is never treated as equivalent to the fixture solely because local tests pass.
