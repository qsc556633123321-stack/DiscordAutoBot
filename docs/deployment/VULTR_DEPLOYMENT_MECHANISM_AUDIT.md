# Vultr Deployment Mechanism Audit

Repository evidence confirms `npm start` is the main Bot start command and
`npm run dashboard:start` is a separate Dashboard/API command. It contains no
authoritative PM2 ecosystem file, systemd unit, Dockerfile, docker-compose
file, screen/tmux procedure, or Vultr deployment script.

**Status: UNKNOWN - NEED SERVER INSPECTION.**

Before a replacement, inspect the server manually to identify the service
manager, release directory, active command, Node binary, environment-file
location, log destination, restart policy, and any volume/mount containing
`src/data/`. Do not infer these details from local development commands.
