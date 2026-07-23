# Community Remaining Runtime Entry Map

## Entry categories

| Entry name | Entry type | Registry path | Active implementation | Called service / helper | Read source | Write target | Discord side effect | Error behavior | Permission requirement | Guild-only | MemberGuard dependency | Layout dependency | Voice dependency | Candidate slice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/community-about` | Slash command | command registry -> alias registry | Presentation command / legacy wrapper | Community About composition | guild name | none | ephemeral embed reply | presentation safe reply | none | yes | no | no | no | Complete; excluded |
| `/community-roadmap` | Slash command | command registry -> alias registry | Presentation command / legacy wrapper | Community Roadmap composition | `community-roadmap.json` or compatibility fallback | none | ephemeral embed reply | presentation safe reply | none | yes | no | no | no | Complete; excluded |
| `/help-me-start` | Slash command | alias registry -> legacy command | `interactiveGuideSystem.buildHelpMeStartEmbed` | `generateConciergeText` | slash answers, guild channel cache | none | deferred ephemeral embed reply; optional OpenAI call | command error path | none | yes | role recommendation only | no | no | Read-only Guide candidate |
| `/setup-community-guide` | Slash command | alias registry -> legacy command | `communityConcierge.setupCommunityGuide` + `setupRoadmapPanel` | guide/roadmap render helpers | guild cache, onboarding JSON | onboarding JSON | create/move/permission-sync channels; send/edit messages | command catches and edits reply | ManageChannels | yes | indirect via role panel/buttons | permission template | no | Guide publish mutation |
| `/refresh-community-guide` | Slash command | alias registry -> legacy command | same Concierge setup functions | same | guild cache, onboarding JSON | onboarding JSON | fetch/edit or send panel messages | command catches and edits reply | ManageChannels | yes | indirect | permission template | no | Guide refresh mutation |
| `/setup-roles` | Slash command | alias registry -> legacy command | role manager runtime | self-assignable role setup / panel setup | guild roles/channels | role settings/panel records indirectly | role create, message send | legacy handler | ManageRoles | yes | shared role lifecycle | permission expectations | no | Roles mutation |
| `/role-settings` | Slash command | alias registry -> legacy command | role manager runtime | settings update | slash options/settings JSON | `role-settings.json` | reply/log | legacy handler | ManageRoles | yes | direct | Guest Gate assumptions | no | Roles configuration mutation |
| `/cleanup-guest-roles` | Slash command + confirm button | alias registry -> legacy command -> fallback button runtime | role manager runtime | build / execute cleanup plan | guild member/role cache | in-memory plan, server logs | bulk role removals | retry/rate-limit queue | ManageRoles | yes | direct | role inheritance facts | no | Deferred high-risk mutation |
| `/setup-channel-panels` | Slash command | alias registry / `/panel` route | `communityService.setupPanels` -> panel runtime | panel target/type inference | guild/current channel/panel records | `channel-panels.json` | message fetch/send/edit/delete | command error reply | ManageChannels | yes | role select panels | target channel placement | create-voice button only | Panels mutation |
| `/suggest-game` | Slash command + modal/buttons | alias registry / `/game` route | game category service -> suggestion runtime | suggestion/card/category functions | proposal/category JSON, guild activity | suggestion/category JSON | send/edit card; on approve create/move/rename channels/overwrites | interaction error fallback | user vote; admin approval | yes | role access expectations | placement/rebuild facts | Temp Voice / LFG / Voice Hub | Deferred proposal mutation |
| `/bootstrap-community` | Slash command | alias registry / `/community rebuild` route | legacy adapter -> rebuild service -> bootstrap runtime | V3 plan/reconciliation | guild/layout/registry | layout registry | categories/channels/roles/overwrites | plan summary/reply | ManageChannels | yes | role facts | direct | guide/panels entry setup | Deferred orchestration |
| `/rebuild-community-v3` | Slash command + confirm button | alias registry / `/community rebuild` route | legacy adapter -> rebuild service | preview/save/execute V3 plan | guild/V3 architecture | V3 plan/registry | broad structure and permission mutation | confirm ownership checks | ManageGuild + ManageChannels | yes | role facts | direct | guide/panels | Deferred orchestration |
| `/community-architect` | Slash command + confirm button | alias registry / `/community audit` route | architect planner/executor | diagnosis / preview / execute plan | guild/layout state | architect plans | move/rename/sync/archive depending plan | confirmation plan checks | ManageChannels | yes | role facts | direct | indirect | Deferred orchestration |
| `concierge_games` | Button | interaction gateway -> button fallback | `handleConciergeButton` | `maybeAddRole`, `quickLinks` | guild/member/roles/channels | none | role add + ephemeral embed | handler catches in legacy runtime | Bot ManageRoles; member role editable | yes | direct | category visibility affected later | no | Guide role mutation |
| `concierge_invest`, `concierge_dev` | Button | same | `handleConciergeButton` | same | guild/member/roles/channels | none | role add + ephemeral embed | handler catches in legacy runtime | Bot ManageRoles; role position | yes | direct | category visibility affected later | no | Guide role mutation |
| `concierge_night`, `concierge_bot`, `concierge_roadmap` | Button | same | `handleConciergeButton` | quick links / Roadmap embed | guild/channels/Roadmap composition | none | ephemeral embed reply | handler catches in legacy runtime | none | yes | no | no | room references only | Guide read candidates |
| `panel_open_roles` / `role_select_menu` | Button / select | interaction gateway -> panel/role fallback | legacy interaction runtime -> role manager runtime | role option builder/update | guild/member/roles/settings | role settings/logs | role add/remove, guest removal/restoration, reply | interaction reply guards | Bot ManageRoles and hierarchy | yes | direct | inherited formal-member access | no | Roles mutation |
| `panel_show_guide` / guide navigation panel IDs | Button | panel fallback | legacy interaction runtime | panel response map / Concierge for `concierge_*` | channel names/guild | none | ephemeral reply | fallback error reply | none | yes | no | no | no | Compatibility consumer |
| `panel_suggest_game`, `game_suggest_*`, `game_suggest_create_modal`, rejection modal | Button / modal | gateway -> game handler or fallback | suggestion runtime | modal, vote, approve/reject | guild/suggestion metadata | suggestion/category JSON | panel send/edit; approve mutations | error fallback reply | admin for approve/reject | yes | indirect | category placement | Temp Voice metadata | Deferred proposal mutation |
| `guildMemberAdd` -> Concierge welcome | Event | `src/index.js` dynamic event loader | `sendConciergeWelcome` | onboarding data reader | member/guild/onboarding JSON | none | DM | errors swallowed by `catch(() => null)` | DM availability only | yes | event runs after MemberGuard | no | no | Deferred event integration |
| V3 reconciliation -> Guide / Panels | Internal call | community V3 builder runtime | `setupCommunityGuide`, `setupChannelPanels` | shared systems | guild/registry | onboarding/panel JSON | panel creation/refresh | summary collects failures | bot channel permissions | yes | role structure | direct | create-entry/panel paths | Cross-feature dependency |
| Factory reset -> panels | Internal call | factory reset runtime | panel setup facade | panel runtime | guild/panel records | panel JSON | message lifecycle | summary/errors | admin flow | yes | no | no | Cross-feature dependency |
| Dashboard panel/roles views | Dashboard route/API | `apps/api/server.js`, `apps/web/**` | API/UI | API fetch helpers | API/SQLite/mock data | database/session where applicable | HTTP response only in current scan | Express errors | HTTP auth path | not necessarily | unknown | unknown | none shown | Excluded / unknown |

## Required full-path examples

### Guide button with role mutation

```text
Discord button registry
  -> interactionGateway.handle
  -> buttonInteractionHandler
  -> no dedicated concierge mapping, so legacyInteractionDispatcher fallback
  -> legacy interaction runtime `concierge_*` branch
  -> communityConcierge.handleConciergeButton
  -> maybeAddRole(member, roleName)
  -> member.roles.add(...)
  -> ephemeral Embed reply

The role change does not itself write a channel overwrite. Later Guest Gate / permission logic interprets
the member's role against the permission matrix; that cross-feature consequence must not be hidden as
a direct guide mutation.
```

### Guide publication

```text
/setup-community-guide
  -> legacy command (ManageChannels check and defer)
  -> communityConcierge.setupCommunityGuide
  -> getOrCreateGuideChannel
  -> getOrCreateCategory / guild.channels.create or channel.setParent
  -> channel.permissionOverwrites.set(onboarding template)
  -> fetch recorded guide message or channel.send/message.edit
  -> saveOnboarding(onboarding-flows.json)
  -> setupRoadmapPanel follows the same recorded-message lifecycle
```

### Proposal approval

```text
Suggestion card button `game_suggest_approve_<id>`
  -> interactionGateway
  -> gameButtons mapping
  -> legacy interaction runtime
  -> gameSuggestionSystemRuntime.handleGameSuggestionButton
  -> approveSuggestion
  -> createDynamicGameCategory
  -> category/channel create, move, rename, overwrite sync
  -> Temp Voice create-entry registration, Voice Hub scheduling, panel refresh, server log
```

## Non-entries confirmed by discovery

- No prefix-command Community entry was found in the bounded scan.
- No Community scheduled job was found; timer-based reminder cleanup is local Welcome System state, not a scheduler-owned Community workflow.
- No direct Dashboard route was proven to invoke the Guide, role, bootstrap, panel, or proposal runtime.
- Native Discord Onboarding configuration is inspected by the completed onboarding-visibility slice; this pass found no separate native-Onboarding writer entry.
