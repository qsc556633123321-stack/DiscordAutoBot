# Community Remaining Slice Candidates

| Slice | Entry / current path | Type | Input / output | Effects / data | Dependencies / exclusions | Tests and rollback | Blocker / risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Help-me-start recommendation | `/help-me-start` -> legacy command -> `buildHelpMeStartEmbed` | Read | answers + channel facts -> exact embed/reply | optional AI network only; no Discord/data write | exclude Guide publish, role add, onboarding event | exact embed + AI success/fallback + channel-pattern tests; keep wrapper | Low; candidate for next slice |
| Read Concierge buttons | `concierge_night`, `concierge_bot`, `concierge_roadmap` | Read | button + guild facts -> ephemeral payload | reply only | exclude role-grant buttons and custom-ID router migration | payload snapshots; wrapper fallback | Medium; interaction fallback |
| Guide renderer | `buildGuideEmbed`, `buildGuideRows` | Read / presentation | guild name/intro -> embed/components | none | exclude publication and AI provider | custom-ID/payload fixtures | Low-Medium |
| Guide status | onboarding record + guild lookups | Read | IDs/channel/message facts -> status model | Discord read only | exclude `getOrCreate*` | stale/missing record tests | Medium |
| Guide publish | `/setup-community-guide` | Mutation | guild + mode -> published IDs/result | channel/category/overwrite/message/JSON | exclude Roadmap migration semantics | publish/edit/stale/JSON failure fixtures; wrapper retained | Blocked by Permission Repair |
| Guide refresh | `/refresh-community-guide` | Mutation | guild + records -> refreshed result | message edit/send, JSON | exclude native onboarding changes | stale-message regression | Blocked by Permission Repair |
| Concierge role grant | games/invest/dev button | Mutation | member/role -> result/reply | member role add | exclude self-role panel/inheritance rewrite | hierarchy/missing role tests | Blocked by Roles/MemberGuard |
| Role selection | `role_select_menu` | Mutation | selected role IDs -> added/removed/inherited result | role adds/removes/logs | exclude panel publisher | exact selection/guest/hierarchy tests | Blocked by Roles/MemberGuard |
| Role settings | `/role-settings` | Mutation | settings patch -> persisted settings | role-settings JSON | exclude role selection | JSON failure/compatibility tests | Medium |
| Guest cleanup | `/cleanup-guest-roles` + confirm | Mutation | guild plan -> queue summary | bulk role removal/logs | exclude MemberGuard enforcement | rate-limit/retry/owner/partial tests | Blocked by MemberGuard |
| Onboarding event steps | `guildMemberAdd` | Mutation / event | member -> ordered effects | roles/messages/DM/timers | exclude MemberGuard and Welcome rework | ordering/failure/restart tests | Blocked by MemberGuard |
| Panel render | `buildPanel` | Read / presentation | channel/type -> payload | none | exclude message storage/publisher | panel payload/custom-ID tests | Low-Medium |
| Panel publish | `/setup-channel-panels` | Mutation | target/mode -> summary | messages/panel JSON | exclude ticket/voice behavior | stale/force/JSON write tests | High |
| Proposal submit | `/suggest-game` or modal | Mutation | game/reason -> card | proposal JSON/message | exclude approval/category creation | modal/JSON/message failure tests | Separate Feature Candidate |
| Proposal review | vote/reject | Mutation | vote/reason -> card state | JSON/message edit | exclude game creation | concurrency/authorization tests | Separate Feature Candidate |
| Proposal approval | approve button | Orchestration | suggestion -> category summary | JSON/channels/overwrites/panels/voice | exclude Voice/Game migration | partial/idempotency fixtures | Blocked by Voice/Layout |
| Bootstrap plan | `/bootstrap-community mode:preview` | Orchestration read plan | guild -> plan/embed | plan state | exclude execute | plan snapshot | Blocked by Layout |
| Bootstrap execute | `/bootstrap-community mode:execute` | Orchestration | plan -> summary | broad Discord/data mutation | all structural effects | failure/repeat/rollback fixture | Blocked by Layout/Permission Repair |
| Rebuild execute | `/rebuild-community-v3` confirm | Orchestration | stored V3 plan -> summary | broad Discord/data/panel/guide mutation | Voice/Game integration | confirm ownership/partial failure | Defer |
| Architect diagnose | `/community-architect diagnose` | Orchestration read plan | guild -> report | plan persistence may occur in preview modes | exclude execute | report snapshot | Blocked by Layout |
| Architect execute | confirm button | Orchestration | plan -> summary | move/rename/sync/archive | all layout semantics | ownership/partial/rollback tests | Blocked by Layout |

Only one next slice is selected by the migration plan: **Help-me-start recommendation**. All other rows remain candidates, not implementation authorization.
