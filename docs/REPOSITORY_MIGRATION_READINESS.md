# Repository Migration Readiness

## Current ownership

`JsonCommunityCompatibilityReader` is the active compatibility source for
legacy community bindings. `SupabaseCommunityReadRepositories` implements the
same read-side shapes but is not a production data source and performs no
writes. The dashboard exposes their comparison only as a read-only migration
readiness report.

## Repository contracts

The application owns five query contracts: Guild, Game, GuildGame, Channel
Binding, and Role Binding. Infrastructure supplies the concrete JSON or
Supabase implementation. Snowflake values remain strings throughout.

## Safety decision

Database migration cannot proceed until the draft SQL has been manually
reviewed, backed up, applied in a non-production environment, and reconciled
without unresolved high-risk conflicts. Current feature-flag design remains
JSON primary, Supabase read shadow disabled, and Supabase writes disabled.
