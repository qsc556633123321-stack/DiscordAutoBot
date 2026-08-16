# Vultr Production Backup Plan

## Status

Prepared only. Do **not** execute these commands until a separate Production
Backup Execution slice is approved.

## Scope

Back up the legacy release, `.env`, `src/data`, `src/legacy/data`, and PM2
metadata before staging. The target is a root-owned, timestamped directory
outside the running checkout:

```text
/opt/DiscordAutoBot-backups/<UTC-TIMESTAMP>/
```

## Future Command Sequence

Run as the PM2 owner after choosing a UTC timestamp. These commands copy only;
they do not restart or stop the Bot.

```sh
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="/opt/DiscordAutoBot-backups/$STAMP"
install -d -m 700 "$BACKUP_DIR"
cp -a /opt/DiscordAutoBot/. "$BACKUP_DIR/legacy-release"
test -f /root/.pm2/dump.pm2 && cp -a /root/.pm2/dump.pm2 "$BACKUP_DIR/pm2-dump.pm2"
pm2 describe discord-bot > "$BACKUP_DIR/pm2-discord-bot.describe.txt"
sha256sum "$BACKUP_DIR/legacy-release/.env" > "$BACKUP_DIR/env.sha256"
du -sh "$BACKUP_DIR"
```

Treat the backup directory as secret-bearing because it includes `.env`. Do not
copy its contents into GitHub, tickets, or chat. Confirm the backup contains
`src/data/onboarding-flows.json`, the untracked `community-v3-plans.json` when
present, and `src/legacy/data` before staging.

## Restore Basis

The intact `/opt/DiscordAutoBot` checkout is the immediate rollback target.
The timestamped backup is the recovery source if that directory or its live
state is accidentally damaged during a future operation.
