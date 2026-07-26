# Community Publication Channel Identity Consumer Inventory

| Consumer | Exact source/function | Field | Status | Coupling |
| --- | --- | --- | --- | --- |
| Guide setup | `src/systems/communityConcierge.js#setupCommunityGuide` | writes `guideChannelId` through `saveOnboarding` | Active Runtime | channel ensure, message publication, persistence |
| Welcome link | `communityConcierge#sendConciergeWelcome` | reads `guideChannelId` | Active Runtime | channel cache/fetch and DM |
| Roadmap setup | `communityConcierge#setupRoadmapPanel` | writes `roadmapChannelId` through `saveOnboarding` | Active Runtime | channel ensure, message publication, persistence |
| Bootstrap | legacy bootstrap calls Guide refresh | indirect Guide channel writer | Indirect Active Runtime | broad bootstrap workflow |
| Rebuild V3 | V3 builder calls Guide refresh | indirect Guide channel writer | Indirect Active Runtime | broad rebuild workflow |

No confirmed independent `channels.fetch` consumer uses `roadmapChannelId`.
No channel identity reader is currently isolated enough for runtime integration.
