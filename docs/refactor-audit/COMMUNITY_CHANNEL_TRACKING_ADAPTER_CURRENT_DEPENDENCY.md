# Community Channel Tracking Adapter Current Dependency

`createCommunityPublicationChannelTrackingReadCompatibilityAdapter` currently
requires `{ readOnboardingData }`, validates it at construction, and throws
`TypeError('CommunityPublicationChannelTrackingReadCompatibilityAdapter requires readOnboardingData')` for a non-function.

Every `readTrackedChannel` query invokes the helper exactly once, reads
`records[guildId] || {}`, and returns the frozen Port result holding the raw
`data.guideChannelId`. It does not use the publication mapper and must continue
to preserve all falsy and truthy malformed values by identity.
