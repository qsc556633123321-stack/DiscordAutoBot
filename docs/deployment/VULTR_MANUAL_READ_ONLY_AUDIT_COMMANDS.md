# Vultr Manual Read-Only Audit Commands

## Status

Codex has no approved Vultr SSH target or server session in this workspace.
No production server command has been executed. Run the first group below on
the Vultr host and return the output with any host name, IP address, user name,
or secret-looking text removed.

These commands are read-only. Do not run deployment, package-management,
process-control, Git mutation, or environment-dumping commands.

## First Group: OS, Node, Process Manager, and Running Bot

1. Connect to the existing server with your normal SSH method. Do not include
   an SSH private-key path or password in shared output.

2. Run the following commands one group at a time:

```sh
uname -a
cat /etc/os-release
node --version
npm --version
which node
which npm
```

```sh
ps aux | grep -E '[n]ode|[Dd]iscord[Aa]uto[Bb]ot|src/index.js'
command -v pm2 && pm2 list
command -v systemctl && systemctl --no-pager --type=service --all | grep -Ei 'discord|bot|node'
```

3. If `pm2 list` identifies a Bot application, run only this additional
   read-only command, replacing `<app-name-or-id>` with the value shown by PM2:

```sh
pm2 describe <app-name-or-id>
```

4. If a likely systemd unit appears, do not restart it. Return only its unit
   name first; the next audit group will request a targeted `systemctl status`
   and `systemctl cat` command.

## Do Not Run

- Do not run `cat .env`, `env`, `printenv`, or any secret-printing command.
- Do not run `git pull`, `npm install`, `npm ci`, `pm2 restart`, `systemctl
  restart`, `kill`, or any deployment command.
- Do not start a second Bot or run slash-command deployment.

## What This Establishes

This first group identifies the operating system, Node/npm runtime, probable
service manager, and currently running Bot command without changing the server.
It does not establish the release directory, data location, environment-key
presence, dashboard state, backup feasibility, or rollback command yet.
