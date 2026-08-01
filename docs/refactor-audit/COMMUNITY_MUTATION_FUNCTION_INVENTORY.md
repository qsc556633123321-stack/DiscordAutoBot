# Community Mutation Function Inventory

| File / function | Caller / trigger | Input / output | Discord writes | JSON writes | Observable behavior | Idempotent / retry-safe | Current / future owner |
| --- | --- | --- | --- | --- | --- | --- |
| `communityConcierge#setupCommunityGuide` | setup/refresh commands; Bootstrap/V3 indirect | guild, mode -> `{ channel, message }` | ensure category/channel, move, overwrite, fetch/edit/send message | `saveOnboarding` guide IDs/tasks | existing message edited or new message sent | partial; repeated calls can refresh/send after fetch miss | Legacy runtime / unapproved |
| `communityConcierge#setupRoadmapPanel` | guide setup/refresh paths | guild -> `{ channel, message }` | ensure Roadmap channel, fetch/edit/send message | `saveOnboarding` roadmap IDs | existing Roadmap edited or new message sent | partial; repeated calls can publish after fetch miss | Legacy runtime / unapproved |
| `communityConcierge#saveOnboarding` | Guide/Roadmap publication | guildId, patch -> guild record | none | shallow merge then `writeJson` | returns merged record even when write catches error | not transaction-safe; retry may overwrite concurrent root changes | Legacy runtime / unapproved |
| `communityConcierge#writeJson` | `saveOnboarding`, file ensure | file path, root -> none | none | `writeFileSync` | logs write failure, does not throw | no retry; whole-root write | Legacy runtime / unapproved |
| `communityConcierge#getOrCreateGuideChannel` | Guide setup | guild -> channel | category/channel create, parent move, overwrite set | none | returns ensured Guide channel | mostly idempotent, failed sub-operation can leave partial state | Legacy runtime / unapproved |
| `communityConcierge#getOrCreateRoadmapChannel` | Roadmap setup | guild -> channel | category/channel create | none | returns ensured Roadmap channel | mostly idempotent | Legacy runtime / unapproved |

No confirmed Community mutation uses webhook, thread/forum, role, pin/unpin, voice, or message delete APIs in this owner.
