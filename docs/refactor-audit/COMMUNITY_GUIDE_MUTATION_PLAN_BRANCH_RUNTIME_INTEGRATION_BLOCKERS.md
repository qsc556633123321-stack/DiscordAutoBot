# Guide Mutation Plan Branch Runtime Integration Blockers

Base: `608f248`. This slice modifies only `src/systems/communityConcierge.js`,
specifically `setupCommunityGuide()`. The pure Plan controls only the already
resolved edit/send choice. Discord Message and Channel objects, payloads,
`saveOnboarding()`, Roadmap continuation, and interaction behavior stay in the
legacy runtime. Discord ports/adapters, persistence migration, writer
replacement, composition, retries, recovery, and full Guide migration remain
explicitly out of scope.
