# Community Mutation Runtime Entry Inventory

Status labels are evidence-based. A discovered export is not treated as active unless a command, event, router, startup hook, or active system reaches it.

| Entry | Trigger | Immediate callee | Final mutations | Status | Authorization / response | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| `legacy/commands/setup-community-guide.js` | `/setup-community-guide` | `setupCommunityGuide`, `setupRoadmapPanel` | channel create/move, overwrite set, message send/edit, onboarding JSON write | Active Runtime | `ManageChannels`, deferred ephemeral reply | Guide setup/publish |
| `legacy/commands/refresh-community-guide.js` | `/refresh-community-guide` | same | existing-message edit or send, onboarding JSON write | Active Runtime | `ManageChannels`, deferred ephemeral reply | Guide refresh |
| `events/guildMemberAdd.js` | Guild member add | `handleGuildMemberAdd`, `sendConciergeWelcome` | role add, welcome message, DM | Active Runtime | Member Guard and welcome checks; failures caught | Onboarding |
| `legacy/commands/setup-channel-panels.js` | `/setup-channel-panels` | `setupChannelPanels` | panel message send/edit/delete, panel JSON write | Active Runtime | command permission checks | Panels |
| `legacy/commands/bootstrap-community.js` | `/bootstrap-community` | `communityRebuildService` / legacy bootstrap | category/channel/role/overwrite changes; Guide refresh | Indirect Active Runtime | confirmation and command checks | Bootstrap |
| `legacy/commands/rebuild-community-v3.js` | `/rebuild-community-v3` | V3 builder runtime | role/channel/overwrite create, duplicate/orphan delete, Guide/panel refresh | Indirect Active Runtime | confirmation and command checks | Bootstrap / maintenance |
| `legacy/commands/setup-roles.js` | `/setup-roles` | `setupSelfAssignableRoles` | role create, role assignment configuration | Active Runtime | `ManageRoles` | Roles |
| Concierge buttons | `interactionCreate` button routing | `handleConciergeButton` | optional role add and ephemeral replies | Indirect Active Runtime | hierarchy and role checks | Roles / Guide navigation |
| Proposal modal/buttons | interaction routing | `handleCreateSuggestionModal`, proposal handlers | message send/edit, JSON writes, dynamic channels/overwrites | Indirect Active Runtime | moderator checks for approve/reject | Proposals |
| `legacy/commands/repair-channel-permissions.js` | command confirmation | permission service / legacy permissions | overwrite set/edit | Active Runtime | `ManageChannels`, confirmation | Permission Repair |
| Cleanup/rebuild/admin commands | command confirmation | cleanup, architect, rebuilder runtimes | channel/category delete, move, overwrite, JSON plan mutation | Active Runtime | privileged confirmation flows | Maintenance / Layout |
| `legacy/events/channelDelete.js` | Channel delete event | legacy handler | state cleanup | Active Runtime | event-only; protected runtime | Maintenance |
| ready/startup hooks | `events/ready.js` | Voice Hub and Temp Voice recovery | stale state cleanup, hub message update | Active Runtime | bot permissions; failures logged | Voice (excluded) |
| Dashboard actions | API/dashboard source | not confirmed by runtime audit | unknown | Unknown | no active Discord mutation evidence found | Documentation-only / Not confirmed |

No active, indirect, or compatibility runtime entry was found for Guide Status. It is not a mutation candidate.
