# Vultr Deployment Mechanism Audit

## Status: VERIFIED BY MANUAL READ-ONLY AUDIT

| Item | Production fact |
| --- | --- |
| Service manager | PM2 (`/usr/bin/pm2`) |
| Application | `discord-bot`, PM2 id `0`, fork mode, online |
| Script | `/opt/DiscordAutoBot/src/index.js` |
| Working directory | `/opt/DiscordAutoBot` |
| Interpreter | node |
| User | root |
| Watch | disabled |
| Error log | `/root/.pm2/logs/discord-bot-error.log` |
| Output log | `/root/.pm2/logs/discord-bot-out.log` |

No dedicated Discord Bot systemd service was found. The checkout is dirty, so
an in-place `git pull` is unsafe. Use the documented side-by-side release and
PM2 cutover plans instead.
