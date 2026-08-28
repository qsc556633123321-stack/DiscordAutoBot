# Server Governance Review Manifest

`buildGovernanceReviewManifest()` turns only `REVIEW` and `REVIEW_DELETE`
planner actions into a read-only approval ledger. It is part of the preview
model; it does not persist choices, enable execution, or mutate Discord.

Each entry records the resource ID, name, type, parent name and ID, resolved
canonical identity, purpose, ownership, lifecycle, reason, recommendation,
and evidence. The preview renderer groups entries by reason and resource type
before showing each record in a compact human-readable form.

## Approval States

- `UNDECIDED`: default state; execution remains blocked.
- `KEEP`: a future human decision to retain a resource.
- `DELETE`: a future human decision to delete a reviewed resource.
- `ADOPT_CANONICAL`: a future human decision to associate a resource with a
  canonical target.
- `IGNORE_GOVERNANCE`: a future human decision to leave a user-managed
  resource outside governance.

These are immutable model values only. There is no approval storage, command,
or executor in v1.2. `REVIEW` and `REVIEW_DELETE` continue to block preflight
with `UNAPPROVED_REVIEW_ACTIONS`.

## Safety Boundary

Known compact-game split channels recommend `MIGRATE`; voice-only leftovers
recommend `DELETE`; user-managed unknown resources recommend
`IGNORE_GOVERNANCE`. Recommendations are explanatory, never authorization.
Runtime voice and ticket resources remain protected by the existing planner,
and unknown resources are never auto-deleted.
