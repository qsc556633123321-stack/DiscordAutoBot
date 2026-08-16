# Vultr PM2 Cutover Plan

## Status

Prepared only. Do **not** run in this slice. This plan applies to verified PM2
application `discord-bot` in `/opt/DiscordAutoBot`.

## Double-Login Guard

The replacement must not start until `discord-bot` is stopped and confirmed
offline. One Discord token must have exactly one online Bot process.

## Future Cutover Sequence

```sh
pm2 stop discord-bot
pm2 status discord-bot
ps aux | grep -E '[n]ode.*DiscordAutoBot.*src/index.js'
```

Proceed only when the legacy app is stopped and no legacy Bot `node` process is
online. Then start the staged release under a distinct verification name:

```sh
pm2 start /opt/DiscordAutoBot-releases/<approved-main-sha>/src/index.js \
  --name discord-bot-refactored \
  --cwd /opt/DiscordAutoBot-releases/<approved-main-sha> \
  --interpreter /usr/bin/node
pm2 status
```

Verify exactly one online Bot process, inspect only the designated PM2 logs,
and run the post-deploy smoke plan before considering the release successful.

## Future Rollback

If staging smoke or post-start checks fail, stop the new app, verify it is
offline, then restart the untouched legacy PM2 application:

```sh
pm2 stop discord-bot-refactored
pm2 status
pm2 restart discord-bot
pm2 status
```

Do not keep both application names online. Do not delete the legacy checkout
until a later, explicitly approved retention decision.
