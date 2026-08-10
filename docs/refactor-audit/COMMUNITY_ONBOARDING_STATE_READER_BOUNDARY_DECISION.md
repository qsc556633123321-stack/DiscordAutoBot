# Community Onboarding State Reader Boundary Decision

**Decision: Infrastructure Reader.** The onboarding root is raw filesystem
compatibility state used only by Infrastructure tracking adapters. It is not a
business-level Application Port, Domain object, repository contract, or Discord
service.

The future `CommunityOnboardingStateReader` will be passed to the message and
channel tracking adapters. Guide, Roadmap, and Welcome runtime code will retain
only their narrow tracked-ID results and will not receive raw onboarding state.
