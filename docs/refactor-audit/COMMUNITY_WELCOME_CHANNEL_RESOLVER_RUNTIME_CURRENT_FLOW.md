# Community Welcome Channel Resolver Runtime Current Flow

## Frozen Head Flow
`sendConciergeWelcome(member)` in `src/systems/communityConcierge.js` currently executes:

1. Construct `CommunityOnboardingStateReader` with `ONBOARDING_FILE` and `readJson`.
2. Construct the channel tracking compatibility adapter and read the `guide` tracking request once.
3. Extract `guideChannelId`.
4. Resolve the channel directly: truthy ID uses cache then one swallowed fetch; falsy ID calls `findChannelByName(member.guild, GUIDE_CHANNEL_NAME)`.
5. Return `undefined` when the resolved channel is falsy.
6. Map `{ guildId: member.guild.id, guideChannelId: guideChannel.id }` with `mapLegacyWelcomeDeliveryRequest`.
7. Build the payload and directly call `member.send(payload).catch(() => null)`.

## Redirect Boundary
The next implementation may replace only step 4 with one per-invocation resolver construction followed by `await resolve({ trackedChannelId: guideChannelId, fallbackChannelName: GUIDE_CHANNEL_NAME })`. All other ordering and calls remain fixed.
