# Roadmap Persistence Request Implementation Blockers

1. `setupRoadmapPanel` still owns legacy `saveOnboarding` sequencing.
2. The implemented request has no runtime consumer by design.
3. The generic feature is shared with Guide/onboarding and must be reused.
4. Writer failure remains adapter-owned log-and-swallow behavior.
5. A runtime redirect needs its own ordering and partial-success preparation.
