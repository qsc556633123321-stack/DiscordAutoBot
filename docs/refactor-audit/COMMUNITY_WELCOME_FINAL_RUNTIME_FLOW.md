# Community Welcome Final Runtime Flow

`sendConciergeWelcome(member)` performs one per-invocation flow:

1. Create `CommunityOnboardingStateReader`.
2. Read one tracked guide channel ID through the channel tracking adapter.
3. Construct `CommunityWelcomeChannelResolver` and resolve the guide channel.
4. Return `undefined` when resolution is falsy.
5. Map `{ guildId, guideChannelId }` with `mapLegacyWelcomeDeliveryRequest`.
6. Build the payload with `buildCommunityWelcomeMessage`.
7. Construct `CommunityWelcomeDmDeliveryAdapter({ member })`.
8. Await `dmDelivery.send(payload)` and discard its raw Message or `null` result.

The Welcome scope contains no direct channel cache/fetch/name lookup or direct
`member.send` mutation. The function still implicitly returns `undefined`.
