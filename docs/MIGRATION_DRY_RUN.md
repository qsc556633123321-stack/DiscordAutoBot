# Community Data Migration Dry Run

The active source remains JSON. Supabase is a read-only shadow target until an
administrator approves a separately scheduled migration.

## Dry-run contract

- It reads JSON compatibility records and, only when configured, the Supabase
  repository.
- It reports `MATCHED`, `JSON_ONLY`, `DATABASE_ONLY`, `CONFLICT`,
  `INVALID_REFERENCE`, or `AMBIGUOUS`; it never writes, deletes, or changes
  Discord resources.
- A missing or unapplied Supabase schema is reported as `DATABASE_NOT_READY`.

## Preconditions

1. Export all current JSON files and record checksums.
2. Back up Supabase schema and affected tables.
3. Resolve conflicts and ambiguous bindings through an administrator review.
4. Keep the JSON source enabled until a post-migration verification succeeds.

## Rollback and flags

Future rollout flags must default to `json` primary, read-shadow disabled, and
database writes disabled. Rollback means disabling the read-shadow or future
database-primary flag; it never deletes JSON or Discord resources.
