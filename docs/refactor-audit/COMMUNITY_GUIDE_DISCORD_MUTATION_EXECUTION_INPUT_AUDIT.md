# Guide Discord Mutation Execution Input Audit

The runtime target is `setupCommunityGuide()` in `communityConcierge.js`. The
Plan is already created after fetch and selects Edit or Send. Execution needs a
plain payload plus operation; Edit depends on the legacy message object and
Send depends on the legacy channel object. Generated message ID is consumed by
legacy persistence after execution. Persistence, Roadmap, interaction response,
and partial-failure behavior remain outside this contract.
