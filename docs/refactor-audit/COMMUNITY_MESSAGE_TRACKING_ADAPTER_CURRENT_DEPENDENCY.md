# Community Message Tracking Adapter Current Dependency

`createCommunityPublicationTrackingReadCompatibilityAdapter` currently requires
`{ readOnboardingData }`. It validates that dependency at factory construction
and throws `TypeError('CommunityPublicationTrackingReadCompatibilityAdapter requires readOnboardingData')` when it is not a function.

Each `readTrackedMessage` call invokes `readOnboardingData()` exactly once,
selects `records[guildId] || {}`, maps it with the production
`fromLegacyPublicationRecord`, and returns the frozen Port result. Guide uses
`state.guide.messageId || data.guideMessageId`; Roadmap uses the equivalent
roadmap expression. Therefore raw truthy malformed legacy values remain
observable through the fallback.
