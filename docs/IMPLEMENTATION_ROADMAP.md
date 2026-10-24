# KU HUB Data Architecture Implementation Roadmap

## Sprint 01 complete: design freeze

- Data-flow inventory and duplicate-source analysis.
- Draft relational schema, ERD, workflow/SOP, and test-only architecture checks.
- No SQL execution, Discord mutation, deployment, or JSON migration.

## Sprint 02 complete: read-only implementation

- Added an idempotent, transaction-wrapped Supabase migration draft and a
  channel-binding repository seam for the read-only preview path.
- Added a Discord read-only snapshot adapter, pure layout diff engine, and
  application preview use case.
- Added a Dashboard preview API protected by OAuth-derived manageable-guild
  authorization and a read-only Dashboard page. No execute control exists.
- The Supabase migration remains unapplied; production JSON and Discord state
  remain authoritative until an explicitly approved migration slice.

## Sprint 03 complete: snapshot persistence and reconciliation

- Added deterministic Community Snapshot fingerprints and atomic local JSON
  persistence with explicit Result failures and fingerprint de-duplication.
- Added read-only reconciliation of live resources, persisted bindings, and the
  desired schema. Uncertain identities remain review items; nothing is merged
  or deleted automatically.
- The Dashboard now displays snapshot metadata, reconciliation issues, risk
  ordering, resource filtering, and observed-versus-recorded permission drift.

## Sprint 05 complete: governance persistence integration

- Reused Governance v1.3 decision, v1.4 immutable-plan, and v1.5 transaction
  JSON stores through unified read-side repository contracts.
- Added a manage-guild-authorized, read-only governance-history API and
  Dashboard summary. It exposes plan fingerprints, decisions, and audit
  history without enabling execution.
- Supabase governance repositories are query-only preparation; JSON remains
  the primary source and an unapplied schema reports `DATABASE_NOT_READY`.

## Next implementation order

1. Review JSON-versus-Supabase migration readiness in an administrator workflow.
2. Add a staged, non-production migration rehearsal with backup verification.
3. Only after reconciliation coverage and explicit approval, migrate controlled writes behind feature flags and an explicit rollback plan.

## Acceptance cases

- Alias collision resolves to one canonical game ID.
- A duplicate channel binding is rejected per guild but the same Discord-shaped string can exist in another guild.
- Identical snapshot/rule input returns an existing plan; completed plans are not re-executed.
- Permission before/after summaries differ only as approved.
- Rejected reviews retain their reason.
- No API or audit output contains credentials.
