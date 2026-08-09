# readOnboardingData Production Consumer Audit

| Module | Function | Fields read | Semantic owner | Migration status |
| --- | --- | --- | --- | --- |
| `communityConcierge.js` | `setupCommunityGuide` | `guideMessageId` via mapper plus raw fallback | Shared tracked publication message state | Direct shared read remains |
| `communityConcierge.js` | `setupRoadmapPanel` | `roadmapMessageId` via mapper plus raw fallback | Shared tracked publication message state | Direct shared read remains |
| `communityConcierge.js` | `sendConciergeWelcome` | `guideChannelId` | Shared Guide publication channel state | Direct shared read remains |
| `communityConcierge.js` | `readOnboardingData` | Definition | Legacy compatibility read helper | Retained |

There are three runtime consumers and one definition. No role, command, or unrelated production consumer was found. This excludes tests and docs.
