# Vultr Server Read-Only Audit

## Audit Status

Manual server evidence was reconciled locally on 2026-08-16. This document
records read-only observations only. No SSH command was executed by this
workspace, and no production mutation occurred during this slice.

## Host Runtime

| Item | Verified value |
| --- | --- |
| OS | Ubuntu 24.04.4 LTS |
| Kernel | 6.8.0-136-generic |
| Architecture | x86_64 |
| Node | v22.22.2 at `/usr/bin/node` |
| npm | 10.9.7 at `/usr/bin/npm` |
| Disk | 52 GB total; 37 GB free (27% used) |

The Node runtime satisfies the Bot and dashboard version requirements. Disk is
not a blocker for a side-by-side release.

## Process and Release

| Item | Verified value |
| --- | --- |
| Service manager | PM2 at `/usr/bin/pm2` |
| Application | `discord-bot` (PM2 id `0`) |
| Status | online, fork mode, watch disabled, unstable restarts `0` |
| Script | `/opt/DiscordAutoBot/src/index.js` |
| Working directory | `/opt/DiscordAutoBot` |
| Interpreter | `node` |
| Service user | root |
| Logs | `/root/.pm2/logs/discord-bot-out.log`, `/root/.pm2/logs/discord-bot-error.log` |
| Git branch | `main` |
| Git revision | `f408e514c478e7b28600e80b023687bb14190787` (`f408e51 chore: auto update`) |
| Working tree | dirty |

No dedicated Discord Bot systemd unit was found. Do not use an in-place
`git pull`: the running checkout is both old and dirty.

## Live State and Configuration

- `/opt/DiscordAutoBot/src/data` is **LIVE MUTABLE STATE**. The running Bot has
  modified tracked files there, including `onboarding-flows.json`.
- `/opt/DiscordAutoBot/src/legacy/data` is also **LIVE MUTABLE STATE**; it
  contains `temp-voice-create-entries.json`.
- `/opt/DiscordAutoBot/src/data/community-v3-plans.json` is untracked runtime
  state and must be preserved.
- `/opt/DiscordAutoBot/.env` is **SECRET CONFIGURATION**, owned by `root:root`,
  mode `0644`. Its values were not inspected. Mode `0644` is a post-deployment
  hardening candidate, not a change for this operation.

`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, and `OPENAI_API_KEY` exist. `TOKEN`,
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SESSION_SECRET` are absent.
No secret values are recorded here.

## Dashboard and Network Scope

No Next.js, dashboard, API, or `start-production` process was observed. There
is no application HTTP listener; observed ports were infrastructure services
only. The first replacement scope is **Discord Bot only**. Supabase is not
relevant to this production replacement unless the dashboard is deliberately
introduced in a later, separate deployment.

## Operational Decision

The legacy checkout remains the rollback target. Use a separate release
directory, preserve the shared `.env` and both live-state directories, stop
the old Bot before starting the replacement, and maintain exactly one online
Discord client for the token.
