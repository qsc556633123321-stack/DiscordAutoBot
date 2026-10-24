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

## Next implementation order

1. Implement the `guilds`, `games`, `guild_games`, and binding tables behind ports; retain JSON compatibility readers.
2. Add plan/audit persistence with immutable fingerprinting and approval records.
3. Migrate one read-only Dashboard view to the same repository.
4. Only after reconciliation coverage, migrate controlled writes behind feature flags and an explicit rollback plan.

## Acceptance cases

- Alias collision resolves to one canonical game ID.
- A duplicate channel binding is rejected per guild but the same Discord-shaped string can exist in another guild.
- Identical snapshot/rule input returns an existing plan; completed plans are not re-executed.
- Permission before/after summaries differ only as approved.
- Rejected reviews retain their reason.
- No API or audit output contains credentials.
