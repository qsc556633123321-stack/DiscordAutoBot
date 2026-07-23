# Community Remaining Cross-feature Dependency Map

| Area | Depends On | Type | Direction | Runtime Critical | Blocker | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Guide | Roles | role mutation | Guide -> Roles runtime today | yes | hierarchy/inheritance contract | `maybeAddRole`, Concierge interest buttons |
| Guide | Permission Repair | visibility | Guide -> template/writer today | yes | onboarding-visible overwrite owner | `getOrCreateGuideChannel` |
| Guide | Roadmap | read renderer / publisher | Guide -> Roadmap composition | yes | Roadmap publication compatibility | `buildRoadmapEmbed`, `setupRoadmapPanel` |
| Onboarding | MemberGuard | event sequencing | Onboarding consumes MemberGuard-first path | yes | member risk/restriction boundary | `guildMemberAdd.js` |
| Onboarding | Welcome | event sequencing | event -> Welcome -> Concierge | yes | duplicate/reminder/guest logic | `guildMemberAdd.js` |
| Onboarding | Permission Repair | role-derived visibility | indirect | yes | Guest Gate / formal-member visibility facts | Welcome guest + role selection |
| Onboarding | Layout | name/placement lookup | indirect | medium | channel topology contract | welcome/guide channel finders |
| Roles | MemberGuard | shared member lifecycle | bidirectional behavior-level dependency | yes | guest/release ownership | role manager, welcome, MemberGuard |
| Roles | Permission Repair | role-to-overwrite semantics | Roles -> policy facts | yes | matrix and overwrite plan | permissionMatrix / guestGate |
| Roles | Voice | access / Night Crew | indirect | medium | role names/access contract | Voice and Night Crew surfaces |
| Bootstrap | Layout | structural operations | Bootstrap -> Layout mechanics | yes | plan/mutation separation | bootstrap/V3/polisher |
| Bootstrap | Permission Repair | overwrite application | Bootstrap -> Permission Repair | yes | writer ownership | ensure/repair methods |
| Bootstrap | Voice | protected channels/create entries | Bootstrap -> Voice contract | yes | Temp Voice metadata | V3/game channels |
| Panels | Roles | role select panel | Panels -> role manager | yes | selection mutation ownership | `role_select_menu` |
| Panels | Guide | navigation panel IDs | Panels -> Guide response | medium | custom ID routing | `panel_show_guide`, Concierge |
| Panels | Proposal | proposal panel/modal | Panels -> Proposals | yes | lifecycle ownership | `panel_suggest_game` |
| Proposal | Games | dynamic category creation | Proposal -> Games | yes | identity/category service | approval flow |
| Proposal | Voice | create entry / hub / LFG | Proposal -> Voice | yes | metadata/lifecycle contract | approval flow imports |
| Maintenance | mutation features | orchestration | Maintenance -> all relevant executors | yes | failure/rollback plans | bootstrap, rebuild, architect, reset |

No row above authorizes a new direct import. Future contracts must point from presentation/application to narrow ports, rather than preserving runtime-module coupling.
