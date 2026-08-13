# Community Concierge Legacy State Audit

Tracked message and channel IDs are read through the reader-backed compatibility
adapters. The runtime receives only `trackedMessageId` or `trackedChannelId`.

| Legacy concern | Active runtime exposure |
| --- | --- |
| `guideMessageId` raw field | 0 |
| `roadmapMessageId` raw field | 0 |
| `guideChannelId` raw record field | 0 |
| Onboarding root record | 0 |
| Mapper call in Concierge | 0 |

`guideChannelId` remains a local semantic value after the channel tracking
adapter returns `trackedChannelId`; it is not a raw-record read. Legacy fallback
and schema behavior remain infrastructure compatibility concerns.
