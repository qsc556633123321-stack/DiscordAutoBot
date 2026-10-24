# KU HUB Relational Database Design

The proposed draft is [20261024_ku_hub_data_architecture_sprint_01.sql](../supabase/migrations/20261024_ku_hub_data_architecture_sprint_01.sql). It is not executed automatically.

## ERD

```text
guilds 1---* guild_games *---1 games
guilds 1---* channel_bindings
guilds 1---* role_bindings
guilds 1---* game_suggestions 1---* suggestion_reviews
guilds 1---* cleanup_plans 1---* cleanup_actions
guilds 1---* audit_logs
```

## Key rules

- Discord snowflakes use PostgreSQL `text`: JavaScript must never coerce them to `Number`.
- `games.canonical_game_id` is the canonical identity; aliases are descriptive lookup data only.
- `channel_bindings.discord_channel_id` and `role_bindings.discord_role_id` are primary identities. Names may change.
- Composite guild-scoped unique constraints prevent cross-guild collisions and repeat bindings.
- A cleanup plan is idempotent by `(discord_guild_id, plan_fingerprint)`.
- Audit metadata must exclude tokens, refresh tokens, service keys, raw authorization headers, and credentials.

## Migration risks

1. Existing JSON has irregular schemas and may contain name-only records; import must resolve or quarantine ambiguous rows.
2. Dashboard’s in-memory fallback is non-durable and cannot be treated as a migration source.
3. Existing Supabase schema has no row-level security policy in this draft; authorization/RLS needs a separate security slice.
4. Never bulk-backfill or run this migration against Vultr/production without a backup, dry-run report, and explicit approval.
