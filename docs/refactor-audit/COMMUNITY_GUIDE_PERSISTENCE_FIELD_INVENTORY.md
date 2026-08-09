# Community Guide Persistence Field Inventory

| Field | Source | Writer call | Semantic owner | Publication? | Native task? | Shared | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `guideChannelId` | ensured Guide channel `channel.id` | single `saveOnboarding` | Guide publication | Yes | No | No | Required |
| `guideMessageId` | exact retained edited/sent `message.id` | single `saveOnboarding` | Guide publication | Yes | No | No | Required |
| `nativeTaskRecommendations` | `NATIVE_ONBOARDING_RECOMMENDATIONS` | same call | Guide onboarding recommendations | No | Yes | No | Required |
| `nativeTaskExcludedChannels` | runtime constant array | same call | Guide onboarding recommendations | No | Yes | No | Required |
| `updatedAt` | generic persistence use case clock | generic merge | generic persistence | No | No | Yes | Existing behavior |

Other record fields, including roadmap, welcome, unknown fields, and other guild records are shallow-merge preserved by the generic writer.
