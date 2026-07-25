# Community Onboarding Root Field Ownership Map

| Field path | Known readers | Known writers | Ownership/evidence | Preservation requirement |
| --- | --- | --- | --- | --- |
| `<root>.<guildId>.guideChannelId` | Guide setup, welcome | W01 | Guide publication | preserve unless Guide patch replaces it |
| `<root>.<guildId>.guideMessageId` | Guide setup, welcome | W01 | Guide publication | preserve unless Guide patch replaces it |
| `<root>.<guildId>.roadmapChannelId` | Roadmap setup | W02 | Roadmap publication | preserve unless Roadmap patch replaces it |
| `<root>.<guildId>.roadmapMessageId` | Roadmap setup | W02 | Roadmap publication | preserve unless Roadmap patch replaces it |
| `<root>.<guildId>.nativeTaskRecommendations` | Guide setup output | W03 | shared native onboarding | preserve across publication patches |
| `<root>.<guildId>.nativeTaskExcludedChannels` | Guide setup output | W03 | shared native onboarding | preserve across Roadmap patches |
| `<root>.<guildId>.* unknown` | Unknown | Unknown | unknown/legacy ownership | shallow-merge preservation required |
| `<root>.* other guilds` | all root readers | W01-W05 via root rewrite | independent guild ownership | preserve, but stale full-root writes can lose later updates |

Clear semantics are only characterized in the pure preparation model; no active
runtime clear writer was found. Malformed/missing root behavior is owned by
`readJson` fallback. Unknown ownership remains unknown.
