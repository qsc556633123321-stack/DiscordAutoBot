# Community Guide/Roadmap Field Ownership Matrix

| Path | Primary owner | Readers | Writers | Preserve rule | Shared mutation | Blocker | Future owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `guideChannelId` | Guide | welcome | Guide | retain Roadmap/unknown siblings | no | shared guild record | Guide publication state |
| `guideMessageId` | Guide | Guide | Guide | retain Roadmap/unknown siblings | no | send-before-write duplicate risk | Guide publication state |
| `roadmapChannelId` | Roadmap | none confirmed | Roadmap | retain Guide/unknown siblings | no | shared guild record | Roadmap publication state |
| `roadmapMessageId` | Roadmap | Roadmap | Roadmap | retain Guide/unknown siblings | no | send-before-write duplicate risk | Roadmap publication state |
| `nativeTaskRecommendations` | Native Onboarding | none confirmed | Guide | retain unless Guide rewrites it | yes | Guide owns write but not semantic consumer | Shared publication state |
| `nativeTaskExcludedChannels` | Native Onboarding | none confirmed | Guide | retain unless Guide rewrites it | yes | Guide owns write but not semantic consumer | Shared publication state |
| `updatedAt` | Shared Legacy | none confirmed | all saves | latest write wins | yes | no ordering/locking | repository metadata, if introduced later |
| unknown fields | Unknown | Unknown | Unknown | preserve through shallow merge | unknown | no schema ownership | Unknown |

No owner may be assumed for unobserved fields. The present runtime grants no
field-level overwrite permission; every successful save rewrites the entire root
object based on the last synchronous read.
