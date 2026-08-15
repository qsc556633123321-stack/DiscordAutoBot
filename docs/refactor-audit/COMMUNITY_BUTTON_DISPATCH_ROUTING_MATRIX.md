# Community Button Dispatch Routing Matrix

| customId | Legacy matcher | Handler branch | Downstream dependency | Reply | Handler return |
| --- | --- | --- | --- | --- | --- |
| `concierge_games` | `startsWith('concierge_')` | games | `CommunityRoleQuickActionFeature`, `quickLinks` | ephemeral embed | `true` |
| `concierge_invest` | same | invest | role quick action, `quickLinks` | ephemeral embed | `true` |
| `concierge_dev` | same | dev | role quick action, `quickLinks` | ephemeral embed | `true` |
| `concierge_night` | same | night | `quickLinks` | ephemeral embed | `true` |
| `concierge_bot` | same | bot | static presentation | ephemeral embed | `true` |
| `concierge_roadmap` | same | roadmap | `buildRoadmapEmbed` | ephemeral embed | `true` |
| other `concierge_*` | same | none | none | none | `false` |

Prefix routing, handler routing, and presentation are separate ownership
concerns. The current legacy prefix branch accepts every `concierge_*` value;
the handler decides whether it recognizes the exact ID.
