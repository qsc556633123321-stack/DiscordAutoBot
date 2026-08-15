# Community Channel Setup Entry Point Matrix

| Entry | Caller intent | Ensure call | Setup mutations before publication | Return observed by caller |
| --- | --- | --- | --- | --- |
| `setupCommunityGuide(guild, options)` | Guide setup / refresh | `getOrCreateGuideChannel` | category create, guide create or parent move, overwrite set | `{ channel, message }` |
| `setupRoadmapPanel(guild)` | Roadmap setup / refresh | `getOrCreateRoadmapChannel` | category create, roadmap create | `{ channel, message }` |
| `sendConciergeWelcome(member)` | welcome delivery | none | none | `undefined` |

Guide and Roadmap setup are indirect runtime entries through their existing
commands/bootstrap callers. Creation occurs before payload construction,
message lookup/mutation, and persistence. No admin command or startup hook was
identified as a separate active Concierge channel-creation implementation.
