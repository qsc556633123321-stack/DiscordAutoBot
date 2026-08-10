# Community Publication Tracking Read Consumer Matrix

| Consumer | Requested semantic value | Legacy field | Mapper | Raw fallback | Read count | Migration status | Candidate boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `setupCommunityGuide` | Tracked Guide message ID | `guideMessageId` | `fromLegacyPublicationRecord` | Yes | 1 | Shared legacy read | Shared message query |
| `setupRoadmapPanel` | Tracked Roadmap message ID | `roadmapMessageId` | `fromLegacyPublicationRecord` | Yes | 1 | Shared legacy read | Shared message query |
| `sendConciergeWelcome` | Tracked Guide channel ID | `guideChannelId` | No | Direct value | 1 | Shared legacy read | Deferred channel query forecast |

The message query is the smallest shared boundary for the active Guide/Roadmap migration. Welcome must not expand this first contract into a raw onboarding record reader.
