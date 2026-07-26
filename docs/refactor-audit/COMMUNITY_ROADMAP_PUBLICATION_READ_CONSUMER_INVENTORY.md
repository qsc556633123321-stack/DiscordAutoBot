# Community Roadmap Publication Read Consumer Inventory

| Consumer | Source/function | Read and branch | Suitability |
| --- | --- | --- | --- |
| R01 Roadmap existing message | `communityConcierge.setupRoadmapPanel` | `roadmapMessageId` -> fetch or send | Preferred |
| R02 Setup/refresh command | legacy command execute | invokes R01 | Mutation/persistence coupled |
| R03 Guide setup command | invokes Roadmap panel after Guide | broader workflow | Too broad |
| R04 Bootstrap/Rebuild | indirect Guide-only flows | no direct Roadmap target | Blocked |

R01 is the selected consumer. Its fetch/edit/send and `saveOnboarding` remain
unchanged legacy behavior.
