# Community Concierge Quick Links Ownership Audit

`quickLinks` remains runtime-local in `src/systems/communityConcierge.js`. It calls `listChannelsByPatterns`, which reads the guild text-channel cache, filters by current regular-expression patterns, formats channels through `toString()`, preserves cache iteration order, and limits output to eight links.

Current consumers are the `games`, `invest`, `dev`, and `night` Concierge branches. This slice only characterizes `night`; it does not move the utility or alter patterns, ordering, empty-result fallback, limit, or channel lookup behavior. A future payload builder should receive the already-resolved links rather than acquire a guild or perform the Discord cache lookup itself.
