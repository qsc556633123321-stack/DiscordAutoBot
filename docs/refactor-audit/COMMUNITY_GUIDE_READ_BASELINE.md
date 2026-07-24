# Community Guide Read Baseline

## Frozen compatibility contract

The legacy Community Guide read contract is the guide Embed and its two button rows:

- title: `👋 歡迎來到 <guild name>`
- the Concierge-generated introduction, falling back to the legacy default introduction
- one ordered `你可以：` section and its ordered items
- footer: `不用急著看完，慢慢探索就好。`
- the seven existing button custom IDs, labels, emoji, styles, order, and disabled state

The frozen fixture is `tests/fixtures/communityGuideLegacyBaseline.js`. It is test-only and is not imported by production code.

## Read sources

`src/infrastructure/community/communityGuideContentReader.js` holds the extracted static Guide content contract used by the legacy pure builder. It is read-only.

## Explicitly excluded

This baseline does not cover Guide status, onboarding-flow JSON, Guide channel creation, message publication or refresh, JSON writes, role changes, buttons, onboarding events, panels, Voice, layout, permissions, MemberGuard, or Dashboard behavior.
