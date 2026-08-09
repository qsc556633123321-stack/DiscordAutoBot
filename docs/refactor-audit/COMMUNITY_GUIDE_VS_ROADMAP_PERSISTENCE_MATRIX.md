# Guide vs Roadmap Persistence Matrix

| Concern | Guide | Roadmap | Conclusion |
| --- | --- | --- | --- |
| Runtime helper | `saveOnboarding` | `saveOnboarding` | Shared legacy helper |
| File | `onboarding-flows.json` | `onboarding-flows.json` | Shared root |
| Fields | `guideChannelId`, `guideMessageId` | `roadmapChannelId`, `roadmapMessageId` | Flat and distinct |
| Merge/failure | Shallow merge; writer logs/swallow | Same | Shared writer contract |
| Ordering | Publish then persist | Publish then persist | Same partial-success shape |

Roadmap persistence is not runtime-migrated. The generic Community publication
feature is a reuse candidate, not approval for a duplicate Roadmap repository.
