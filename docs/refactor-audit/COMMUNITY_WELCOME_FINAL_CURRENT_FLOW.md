# Community Welcome Final Current Flow

`sendConciergeWelcome(member)` currently executes:

1. Construct `CommunityOnboardingStateReader` with `ONBOARDING_FILE` and `readJson`.
2. Construct the channel tracking compatibility adapter and read `trackedChannelId`.
3. For a truthy ID, call `guild.channels.cache.get(id)`; on miss, call `guild.channels.fetch(id).catch(() => null)`.
4. For a falsy ID, call `findChannelByName(guild, GUIDE_CHANNEL_NAME)` exactly once.
5. If no channel resolves, return `undefined` and send no DM.
6. Map `guild.id` plus the resolved channel ID with `mapLegacyWelcomeDeliveryRequest`.
7. Build the existing welcome payload.
8. Await `member.send(payload).catch(() => null)`, then resolve `undefined`.

Tracking read is already migrated. Channel resolution and DM delivery remain Runtime-owned.
