# Discord.js Ephemeral Response Deprecation Maintenance

## Status

Deferred, non-blocking maintenance item discovered during the successful Vultr
refactored Bot deployment.

## Observed Warning

Discord.js warns that the `ephemeral` interaction response option is deprecated
and that response flags should be used instead.

## Scope for a Future Slice

- Inventory every interaction response using `ephemeral`.
- Characterize the existing public/private response behavior.
- Replace only the deprecated option with the Discord.js-supported flag form.
- Run command, interaction, migration, architecture, and production-safe
  regression checks.

Do not mix this with new features, dashboard work, or broad interaction
refactoring. It did not block the deployed Bot, TempVoice smoke, PM2 stability,
or permissions.
