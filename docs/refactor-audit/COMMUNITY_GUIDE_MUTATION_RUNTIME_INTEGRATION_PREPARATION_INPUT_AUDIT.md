# Guide Mutation Runtime Integration Preparation Input Audit

The Plan is defined by `GuidePublicationMutationInput.js` and
`buildGuidePublicationMutationPlan.js`. It receives `guildId`, `mode`,
`trackedMessageId`, `existingMessageAvailable`, and
`existingMessageLookupAttempted`; it returns an immutable operation,
tracked ID, and persistence intent.

Legacy source is `src/systems/communityConcierge.js`: `setupCommunityGuide()`
reads onboarding data, resolves its legacy truthy ID, conditionally fetches,
then edits or sends before `saveOnboarding()`. Fetch happens before a Plan can
know message availability. Payload, Roadmap continuation, and interaction
responses remain outside the Plan. Current Plan and execution readiness remain
Prepared / Not Integrated and Characterized / Legacy respectively.
