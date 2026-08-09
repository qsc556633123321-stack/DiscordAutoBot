# Community Roadmap Lookup Adapter Analyzer Blockers

Resolved. The prior false positive was the exact edge from
`RoadmapPublicationMessageLookupAdapter` to
`RoadmapPublicationMessageLookupPort`. The adapter implements the Application
port contract and is permitted by `AGENTS.md`.

The analyzer now recognizes the narrow generic `Infrastructure -> *Port.js`
contract bridge. No Roadmap-only allowlist was added; non-Port Application
dependencies remain reverse dependencies.
