# Community Publication Channel Identity Mapping Matrix

| Legacy field | Domain candidate | Runtime consumer | Persistence consumer | Bootstrap/Rebuild |
| --- | --- | --- | --- | --- |
| `guideChannelId` | `GuidePublicationState.channelId` already exists | Guide setup writes; welcome reads | `saveOnboarding` shallow patch | indirect Guide refresh |
| `roadmapChannelId` | `RoadmapPublicationState.channelId` already exists | Roadmap setup writes | `saveOnboarding` shallow patch | no direct confirmed consumer |

The existing domain candidates are not approval to replace legacy runtime reads
or writes. Their normalization behavior must not silently change truthy
malformed channel-ID handling.
