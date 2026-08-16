# Vultr Refactored Deployment Plan V2

## Execution Result

This plan was executed successfully using the verified PM2 production state.
The deployed release is
`b484f77565d29db76ba867c7c6de61d23708987b` at
`/opt/DiscordAutoBot-releases/b484f77565d29db76ba867c7c6de61d23708987b`.

1. Backup completed at `/opt/DiscordAutoBot-backups/20260816T083856Z` before
   staging.
2. `/opt/DiscordAutoBot` was preserved as the legacy rollback release.
3. The refactored release was independently cloned and verified at its exact
   SHA.
4. `/usr/bin/node` 22.22.2, `/usr/bin/npm` 10.9.7, and PM2 were used.

## Release and State Model

The side-by-side release received a protected `.env` copy and uses symlinks to
the legacy checkout's live state directories:

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

## PM2 Cutover Result

The legacy `discord-bot` process was stopped and verified offline before the
refactored process started. No Discord double-login occurred. Shell multiline
execution caused PM2 to assign the cosmetic process name `index`; it is online,
fork-mode, at zero restarts, and runs the staged release's `src/index.js`.

PM2 startup integration is the enabled and active `pm2-root` systemd service.
`pm2 save` passed. The old stopped PM2 entry was removed only after successful
cutover; the legacy checkout itself was retained for rollback.

See `VULTR_REFACTORED_DEPLOYMENT_RESULT.md` for the complete record, including
the retained backup, smoke checks, and rollback basis.
