# Community Publication Channel Lookup Consumer Inventory

| Consumer | File / function | Trigger / caller | Field and lookup | Handling / effects | Status / suitability |
| --- | --- | --- | --- | --- | --- |
| Guide welcome | `src/systems/communityConcierge.js#sendConciergeWelcome` | `guildMemberAdd` -> `sendConciergeWelcome(member)` | `guideChannelId`; `cache.get(id) || await guild.channels.fetch(id).catch(() => null)` | Missing lookup returns; success sends member DM; no persistence; send rejection is swallowed. No type or permission precheck. | Active Runtime / Preferred characterization target |
| Guide publication setup | `communityConcierge.js#setupCommunityGuide` | setup/refresh commands; Bootstrap/V3 indirect callers | Guide channel is name/category ensured, not read from `guideChannelId` | create/move/overwrite/message edit-or-send then `saveOnboarding`; broad mutation/persistence coupling. | Active Runtime / Mutation Coupled |
| Roadmap publication setup | `communityConcierge.js#setupRoadmapPanel` | setup/refresh commands | Roadmap channel is name/category ensured, not read from `roadmapChannelId` | create/message edit-or-send then `saveOnboarding`; broad coupling. | Active Runtime / Mutation Coupled |
| Roadmap reader | none found | n/a | `roadmapChannelId` has no confirmed lookup API consumer | no direct channel lookup evidence | Unknown / Rejected |
| Bootstrap refresh | legacy bootstrap/V3 runtimes | indirect `setupCommunityGuide(...refresh)` | no welcome lookup | Guide mutation path only | Indirect Runtime / Indirect Only |

Authorization belongs to the command/event caller. `sendConciergeWelcome()` itself has no authorization, retry, explicit logging, idempotency key, or persistence behavior.
