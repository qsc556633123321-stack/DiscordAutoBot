# Community Concierge Function Inventory

The runtime has 18 significant local functions.

| Function | Primary responsibility | External side effect | Risk |
| --- | --- | --- | --- |
| `throwMutationFailure` | Preserve Guide mutation failure identity | throw | Medium |
| `ensureFile` | Ensure state directory/file exists | filesystem write | High |
| `readJson` | Legacy-compatible JSON read/fallback | filesystem read/log | High |
| `generateConciergeText` | OpenAI generation with fallback | OpenAI request | Medium |
| `findChannelByName` | Cached channel lookup | Discord cache read | Low |
| `getOrCreateCategory` | Find/create category | Discord channel create | High |
| `getOrCreateGuideChannel` | Ensure/move/permission Guide channel | Discord mutation | High |
| `getOrCreateRoadmapChannel` | Ensure Roadmap channel | Discord channel create | High |
| `buildGuidePayload` | Build Guide content through compatibility adapter | delegated read/AI | Medium |
| `listChannelsByPatterns` | Build button quick links | Discord cache read | Low |
| `buildRoadmapEmbed` | Build Roadmap embed | composition query | Low |
| `buildAboutEmbed` | Build About embed | domain view model | Low |
| `setupCommunityGuide` | Guide orchestration | lookup/mutation/persist via boundaries | High |
| `setupRoadmapPanel` | Roadmap orchestration | lookup/mutation/persist via boundaries | High |
| `maybeAddRole` | Guard and assign quick role | role mutation | High |
| `quickLinks` | Select link patterns | cache read | Low |
| `handleConciergeButton` | Button dispatch and replies | replies/role mutation | High |
| `sendConciergeWelcome` | Resolve guide channel and DM welcome | fetch/DM | High |

The audit does not approve a function extraction. It records ownership and
preserves existing failure behavior for a future bounded slice.
