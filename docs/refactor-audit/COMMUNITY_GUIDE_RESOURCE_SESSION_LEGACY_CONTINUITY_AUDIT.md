# Guide Resource Session Legacy Continuity Audit

`setupCommunityGuide(guild)` calls `getOrCreateGuideChannel(guild)` exactly
once per invocation. The returned channel remains the only channel used by the
rest of that invocation. A non-forced truthy tracked ID causes at most one
`channel.messages.fetch(id)` call. The fetched message is both the Plan
availability input and the exact object used by Edit. Send uses the ensured
channel directly, with no post-ensure channel resolution. Force and falsy IDs
skip lookup. Persistence follows the Guide mutation; Roadmap follows the Guide
path. Current failure handling remains legacy-owned.
