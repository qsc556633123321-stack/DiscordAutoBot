# Community Guide Mutation Runtime Integration Preparation Blockers

Base: `75092e0`. The working tree was clean before this preparation slice.

No runtime integration is approved yet. The legacy `setupCommunityGuide()` owns
channel ensure, permission overwrite, payload construction, tracked-message
fetch, edit/send, shared onboarding persistence, return values, and errors.
The pure Plan has no Discord object, channel, persistence callback, payload, or
interaction dependency. Moving only the edit/send branch would still couple
fetch timing and shared writer behavior. Candidate D is ready only as a future,
explicitly bounded Plan-controlled branch change; no Discord port, writer, or
execution service is approved.
