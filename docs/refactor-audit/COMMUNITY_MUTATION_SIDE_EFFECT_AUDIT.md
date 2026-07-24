# Community Mutation Side-Effect Audit

| Effect family | Exact runtime source | Upstream path | Preconditions / error behavior | Persistence / partial failure |
| --- | --- | --- | --- | --- |
| Guide channel create/move/overwrites | `src/systems/communityConcierge.js:getOrCreateGuideChannel` | setup/refresh command; bootstrap/V3 refresh | `ManageChannels` at command entry; overwrite errors are caught | channel may exist before message publish fails |
| Guide message send/edit | `communityConcierge.js:setupCommunityGuide` | setup/refresh command | existing record fetch is caught; send/edit errors propagate | send can succeed before onboarding JSON write |
| Roadmap message send/edit | `communityConcierge.js:setupRoadmapPanel` | setup/refresh command | same channel lookup/create behavior | same record consistency risk |
| Concierge role add / DM | `communityConcierge.js:maybeAddRole`, `sendConciergeWelcome` | button / member-add event | hierarchy checked; failures caught | no persistent completion state |
| Panel messages / JSON | `legacy/systemRuntimes/channelPanelsRuntime.js` | panel command, rebuilds, proposals | tracked message ownership; force deletes only stored bot message | message and JSON record can diverge |
| Community bootstrap / V3 | legacy bootstrap and V3 runtimes | privileged command confirmations | retries/queues vary by runtime | extensive multi-resource partial success risk |
| Role create/assign/remove | `roleManagerRuntime`, `welcomeSystem`, `memberGuard` | role commands, select, member-add | bot hierarchy/permission checks vary | JSON settings and Discord roles can diverge |
| Proposal state and game channels | `gameSuggestionSystemRuntime` | modal/buttons | moderator approval and game identity checks | message/JSON/channel creation can partially succeed |
| Permission overwrites | legacy permission/bootstrap/V3 systems | repair/rebuild/setup | guild and role availability required | overwrite sync may partially apply |
| Destructive channel cleanup | `categoryCleaner`, rebuild/factory runtimes | confirmed maintenance commands and `channelDelete` event | protected-resource checks and confirmations | irreversible; retry may observe changed state |

External calls also include optional OpenAI Concierge generation and Discord REST. No Supabase mutation was confirmed in the Community mutation runtime paths reviewed here.
