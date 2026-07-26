# Community Publication Channel Lookup Input Audit

Base commit: `f249895`. This is Characterization Slice #1, not a runtime integration.

| Item | Observed source contract |
| --- | --- |
| Target | `src/systems/communityConcierge.js#sendConciergeWelcome(member)` |
| Active trigger | `src/events/guildMemberAdd.js` calls it after the welcome flow. |
| Guide identity | `onboarding-flows.json[guildId].guideChannelId`; written by `setupCommunityGuide()`. |
| Roadmap identity | `roadmapChannelId`; written by `setupRoadmapPanel()`, with no confirmed active lookup reader. |
| Input root | `readOnboardingData()` returns an object fallback on absent, malformed, or failed reads. |
| Truthiness rule | A truthy `guideChannelId` uses cache then fetch. Falsy values use the legacy name lookup. |
| Domain / mapper | Existing publication state and mapper represent channel IDs, but this consumer does not call either. |
| Writer | No `saveOnboarding()` call occurs in `sendConciergeWelcome()`. |
| Prohibited scope | Runtime, adapters, ports, repositories, composition, JSON, permissions, Bootstrap, Rebuild, and Discord behavior. |

The sole target is the Guide channel lookup observable contract. No Channel Identity Runtime Integration is approved.
