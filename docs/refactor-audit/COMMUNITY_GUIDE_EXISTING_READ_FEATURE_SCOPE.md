# Existing Guide Read Feature Scope

## Decision

**Not Same Concern**

`createCommunityGuideReadFeature` composes `guideContentReader`, the Concierge text generator, `createGetCommunityGuide`, and the Guide renderer. Its compatibility adapter only builds the Guide content payload.

It has no tracked publication message ID, onboarding record, publication state mapper, filesystem record, lookup port, or persistence responsibility. Reusing it for tracked state would conflate content/read-model ownership with publication identity ownership.
