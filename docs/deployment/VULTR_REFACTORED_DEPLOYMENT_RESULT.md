# Vultr Refactored Deployment Result

## Status: PASS

The refactored Discord Bot was deployed successfully from
`b484f77565d29db76ba867c7c6de61d23708987b`.

| Item | Verified result |
| --- | --- |
| Release directory | `/opt/DiscordAutoBot-releases/b484f77565d29db76ba867c7c6de61d23708987b` |
| Legacy rollback directory | `/opt/DiscordAutoBot` (preserved) |
| Backup | `/opt/DiscordAutoBot-backups/20260816T083856Z` (PASS) |
| Runtime | Node 22.22.2, npm 10.9.7 |
| PM2 process | `index`, online, fork mode, zero restarts/unstable restarts |
| Dashboard/API | not deployed; Bot-only scope |

## Backup and State Preservation

The pre-cutover backup contains the legacy release, `.env`, `src/data`,
`src/legacy/data`, `onboarding-flows.json`, `community-v3-plans.json`, legacy
temp-voice state, legacy Git metadata, and PM2 process information. The staged
release has its own `.env` copy with mode `0600` and symlinks to the preserved
legacy live-state directories. Repository defaults did not overwrite live data.

## Validation

`npm ci`, `test:community`, `test:migration`, `test:architecture`,
`test:legacy-boundaries`, `quality:gate`, `audit:legacy`, `dashboard:build`,
and dependency analysis passed on the staged server release. Architecture Score
was 100/100 with zero circular dependencies.

## Cutover and Smoke

The legacy PM2 Bot was stopped and verified offline before the staged Bot was
started. No Discord double-login occurred. The Discord ready log was observed.
Real TempVoice create-entry detection, temporary room creation, and subsequent
room detection passed without permission failure, runtime exception, or restart.

PM2 persistence was saved through the enabled, active `pm2-root` systemd
integration. The legacy PM2 entry was removed after successful validation; the
legacy code directory and backup remain intact.

## Rollback

Rollback remains available by stopping the refactored `index` PM2 process and
starting `/opt/DiscordAutoBot/src/index.js` with its preserved legacy working
directory, configuration, and shared data. Do not remove the legacy checkout or
backup until a separately approved retention decision.

## Known Non-Blocking Warning

Discord.js emitted a deprecation warning for the `ephemeral` interaction
response option; `flags` should be used instead. No production change was made
in this operations slice. See the maintenance note for a future narrow fix.
