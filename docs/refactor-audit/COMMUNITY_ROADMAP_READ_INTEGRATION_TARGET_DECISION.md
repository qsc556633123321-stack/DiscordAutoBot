# Community Roadmap Read Integration Target Decision

Selected: `setupRoadmapPanel` Existing Message Identity Read. The runtime maps
the legacy guild record, reads `publicationState.roadmap.messageId`, and falls
back to the raw value only for malformed truthy legacy behavior. Rejected:
Roadmap channel identity, full Roadmap state, shared Guide/Roadmap
consolidation, Bootstrap, Rebuild, and full setup/refresh workflows.
