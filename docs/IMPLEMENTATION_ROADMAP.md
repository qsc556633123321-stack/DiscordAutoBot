# KU HUB Data Architecture Implementation Roadmap

## Sprint 01 complete: design freeze

- Data-flow inventory and duplicate-source analysis.
- Draft relational schema, ERD, workflow/SOP, and test-only architecture checks.
- No SQL execution, Discord mutation, deployment, or JSON migration.

## Next implementation order

1. Add a read-only guild snapshot repository and normalized snapshot value object.
2. Implement the `guilds`, `games`, `guild_games`, and binding tables behind ports; retain JSON compatibility readers.
3. Add plan/audit persistence with immutable fingerprinting and approval records.
4. Migrate one read-only Dashboard view to the same repository.
5. Only after reconciliation coverage, migrate controlled writes behind feature flags and an explicit rollback plan.

## Acceptance cases

- Alias collision resolves to one canonical game ID.
- A duplicate channel binding is rejected per guild but the same Discord-shaped string can exist in another guild.
- Identical snapshot/rule input returns an existing plan; completed plans are not re-executed.
- Permission before/after summaries differ only as approved.
- Rejected reviews retain their reason.
- No API or audit output contains credentials.
