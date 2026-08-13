# Community Welcome Final Current Flow

`sendConciergeWelcome(member)` currently executes:

1. Construct `CommunityOnboardingStateReader` with `ONBOARDING_FILE` and `readJson`.
2. Construct the channel tracking compatibility adapter and read `trackedChannelId`.
3. Construct `CommunityWelcomeChannelResolver` and resolve the tracked ID or fallback name.
4. The resolver owns cache/fetch/name fallback behavior.
5. If no channel resolves, return `undefined` and send no DM.
6. Map `guild.id` plus the resolved channel ID with `mapLegacyWelcomeDeliveryRequest`.
7. Build the existing welcome payload.
8. Construct `CommunityWelcomeDmDeliveryAdapter({ member })`, await `dmDelivery.send(payload)`, then resolve `undefined`.

Tracking read, channel resolution, and DM delivery are migrated.
