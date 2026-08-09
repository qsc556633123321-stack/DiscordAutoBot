# Roadmap Reuse Feature Preparation Blockers

1. `setupRoadmapPanel` remains legacy-owned for persistence sequencing.
2. A reuse feature must not create a writer, repository, Port, or adapter.
3. Writer `persisted: false` must pass through without throw/retry/re-log.
4. Generic invariant throws must pass through exactly.
5. Runtime redirect needs a separate ordering and partial-success slice.
