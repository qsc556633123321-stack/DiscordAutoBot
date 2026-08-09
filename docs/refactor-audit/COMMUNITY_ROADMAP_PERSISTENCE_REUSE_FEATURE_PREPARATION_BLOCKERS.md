# Roadmap Reuse Feature Implementation Blockers

1. `setupRoadmapPanel` remains legacy-owned for persistence sequencing.
2. The implemented reuse feature does not create a writer, repository, Port, or adapter.
3. Writer `persisted: false` passes through without throw, retry, or re-log.
4. Generic invariant throws pass through exactly, including primitive and
   `undefined` thrown values.
5. Runtime redirect still needs a separate ordering and partial-success slice.
