# Community Mutation Write Targets

| Target | Operations | Source | Notes |
| --- | --- | --- | --- |
| `src/data/onboarding-flows.json` | create-if-missing, whole-root overwrite | `ensureFile`, `writeJson` | Guide/Roadmap records shallow-merge per guild before serializing full root |
| Guide category/channel | create, move, overwrite | category/channel ensure | no delete path |
| Roadmap category/channel | create | Roadmap ensure | no delete/overwrite path in this function |
| Guide Discord message | edit or send | `setupCommunityGuide` | tracked ID controls fetch attempt |
| Roadmap Discord message | edit or send | `setupRoadmapPanel` | tracked ID controls fetch attempt |
| Permission overwrite | set | Guide channel ensure | catch-to-null, best effort |
| Forum/thread/role/pin/voice/webhook | no-op | no active owner call | explicitly absent in inventory |
