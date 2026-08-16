# Vultr Refactored Deployment Plan V2

## Preconditions

This plan is based on the verified PM2 production state. It is a future
procedure only; none of its commands are authorized by this documentation
slice.

1. Complete the backup plan before staging.
2. Keep `/opt/DiscordAutoBot` intact as the legacy rollback release.
3. Stage commit `cfd3991` or a later explicitly approved `main` SHA under
   `/opt/DiscordAutoBot-releases/<approved-sha>`.
4. Use `/usr/bin/node`, `/usr/bin/npm`, and PM2 application `discord-bot`.

## Release and State Model

Use a side-by-side release. The staged release receives the existing `.env` and
uses symlinks to the legacy checkout's live state directories:

```text
/opt/DiscordAutoBot/                    legacy rollback release
/opt/DiscordAutoBot-releases/<sha>/      staged refactored code
  .env                                  protected copied configuration
  src/data -> /opt/DiscordAutoBot/src/data
  src/legacy/data -> /opt/DiscordAutoBot/src/legacy/data
```

This **shared-directory plus symlink** strategy is the chosen first-cutover
strategy. The refactor has no data-schema migration, and one shared state
location avoids a copy divergence after the new Bot has handled events and a
rollback becomes necessary. It is reversible because the legacy checkout and
its data paths remain intact.

## PM2 Cutover Invariant

Never run legacy and refactored releases online together. Both would use the
same `DISCORD_TOKEN` and could process the same events. Stop and verify the old
`discord-bot` process first, then start the staged release as a distinct PM2
name during the verification window. The legacy application remains stopped,
not overwritten, as the rollback target.

See `VULTR_PRODUCTION_BACKUP_PLAN.md`, `VULTR_RELEASE_STAGING_PLAN.md`, and
`VULTR_PM2_CUTOVER_PLAN.md` for the future command sequence.
