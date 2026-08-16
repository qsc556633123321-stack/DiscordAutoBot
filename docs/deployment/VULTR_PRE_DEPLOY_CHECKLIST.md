# Vultr Pre-Deploy Checklist

- [ ] Record current release path, Git SHA, Node/npm versions, and service manager.
- [ ] Back up current code, `.env`, live `src/data/`, service configuration,
  lockfile, and optionally recent logs outside the release directory.
- [ ] Confirm Node meets `>=18` for the Bot and `>=20.9` if Dashboard runs.
- [ ] Verify `DISCORD_TOKEN`; verify Dashboard/OAuth/Supabase variables only if
  that separate service is enabled.
- [ ] Run `npm ci` in the new release directory, never against the live data
  directory.
- [ ] Preserve live `src/data/`; do not overwrite it with Git defaults.
- [ ] Confirm privileged Discord intents and Bot role permissions.
- [ ] Prepare the rollback release and command before stopping the old Bot.
- [ ] Stop the old process before starting the new process with the same token.
