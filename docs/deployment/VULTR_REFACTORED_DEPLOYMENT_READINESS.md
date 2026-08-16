# Refactored Vultr Deployment Readiness

## Status: DEPLOYED

The refactored Discord Bot release `b484f77565d29db76ba867c7c6de61d23708987b`
is deployed at
`/opt/DiscordAutoBot-releases/b484f77565d29db76ba867c7c6de61d23708987b`.
Backup, independent staging, live-state symlink verification, local server
validation, PM2 cutover, and production smoke checks passed.

The first production replacement scope is Discord Bot only. Dashboard/API is
not deployed. The legacy checkout and verified backup remain available for
rollback.

## Ready From Repository Evidence

- `npm ci` succeeds with the committed lockfile.
- Main Bot entry is `npm start` / `node src/index.js`.
- Required Bot environment variable is `DISCORD_TOKEN`.
- `OPENAI_API_KEY` is optional and has a verified fallback contract.
- No database schema change or data schema migration was introduced by the
  Community refactor.

## Remaining Operational Follow-up

- Retain the legacy checkout and backup through an agreed stability window.
- Observe PM2 `index` logs and restarts during normal community activity.
- Address the recorded non-blocking Discord.js `ephemeral` option deprecation
  in a separate, small maintenance slice.

## Deployment Guard

Do not remove the legacy checkout or backup without an explicitly approved
retention decision. Do not deploy the dashboard/API as part of Bot follow-up.
