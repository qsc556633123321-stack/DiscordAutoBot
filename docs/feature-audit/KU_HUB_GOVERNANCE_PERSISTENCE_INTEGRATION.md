# KU HUB Governance Persistence Integration

## Reused modules

- Governance v1.3: `jsonGovernanceReviewDecisionStore` retains decision
  records, reviewer identity, timestamp, and rejection reason.
- Governance v1.4: `jsonGovernanceApprovedPlanStore` retains immutable plan
  fingerprints and supersedes, rather than mutates, active plan records.
- Governance v1.5: `jsonGovernanceExecutionTransactionStore` retains locks,
  transaction receipts, compensation state, and duplicate-execution evidence.

## Current ownership

JSON remains the only active persistence source. The plan, decision, and audit
repositories are read-side facades over those stores, so no dual-write path
exists. The Supabase adapter is query-only and intentionally not wired as a
production source.

## Remaining blockers

The Supabase draft migration is unapplied and has no Governance review-decision
table yet; its decision repository intentionally returns `DATABASE_NOT_READY`.
A schema extension, backup, non-production rehearsal, conflict resolution, and
explicit administrative migration approval are needed before any source switch.
Governance execution remains disabled and no Dashboard Execute control is present.
