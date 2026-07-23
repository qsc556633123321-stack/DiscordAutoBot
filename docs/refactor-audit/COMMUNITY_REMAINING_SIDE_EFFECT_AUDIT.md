# Community Remaining Side-effect Audit

## Scope

This is a static audit of remaining Community-adjacent runtime paths. It does not execute, repair, publish, assign roles, alter panels, or edit persisted data.

| Operation | File | Function | Trigger | Target | Rollback Possible | Idempotent | Risk | Feature |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ensure data directory/file | `systems/communityConcierge.js` | `ensureFile` | module/helper use | filesystem | manual restore | mostly | Medium | Guide / onboarding |
| Read / save onboarding state | `systems/communityConcierge.js` | `readOnboardingData`, `saveOnboarding` | guide setup, welcome | `onboarding-flows.json` | restore prior JSON | no transaction | High | Guide / Roadmap |
| Optional Concierge wording | `systems/communityConcierge.js` | `generateConciergeText` | guide / help rendering | OpenAI API | n/a | read-like | Medium | Guide |
| Ensure entry category | `systems/communityConcierge.js` | `getOrCreateCategory` | guide setup | category | manual delete/move | intended idempotent by name | High | Guide publish |
| Ensure guide channel | `systems/communityConcierge.js` | `getOrCreateGuideChannel` | guide setup | channel and permission overwrites | manual rollback | intended idempotent by name | High | Guide publish |
| Publish / refresh guide | `systems/communityConcierge.js` | `setupCommunityGuide` | slash / V3 internal call | channel message and onboarding JSON | message edit/revert; JSON restore | message-ID based | High | Guide publish |
| Publish / refresh Roadmap panel | `systems/communityConcierge.js` | `setupRoadmapPanel` | guide setup/refresh | message and onboarding JSON | message edit/revert; JSON restore | message-ID based | High | Roadmap compatibility consumer |
| Grant quick interest role | `systems/communityConcierge.js` | `maybeAddRole` | concierge button | member role | role remove | add is mostly idempotent | High | Guide button |
| Send Concierge DM | `systems/communityConcierge.js` | `sendConciergeWelcome` | `guildMemberAdd` | member DM | cannot reliably retract | not idempotent | Medium | Event onboarding |
| Read recommendation inputs | `systems/interactiveGuideSystem.js` | `buildBaseRecommendation` | `/help-me-start` | none | n/a | yes | Low | Guide read |
| Optional recommendation wording | `systems/interactiveGuideSystem.js` | `buildHelpMeStartEmbed` | `/help-me-start` | OpenAI API / reply | n/a | read-like | Medium | Guide read |
| Ensure guest role | `systems/welcomeSystem.js` | `ensureGuestRole` | `guildMemberAdd` | role/member | role remove; role delete if newly created | role assignment mostly | High | Welcome / Guest Gate |
| Welcome channel and DM | `systems/welcomeSystem.js` | `handleGuildMemberAdd`, `sendWelcomeDm` | `guildMemberAdd` | messages / DM | cannot reliably retract | duplicate guarded only in memory | Medium | Welcome |
| Reminder timer | `systems/welcomeSystem.js` | `scheduleRoleReminder` | member add | delayed message / map | no durable rollback | per-process only | Medium | Welcome |
| Create self-assign roles | `legacy/systemRuntimes/roleManagerRuntime.js` | `setupSelfAssignableRoles` | setup/select paths | guild roles | delete manually | name-based idempotence | Critical | Roles |
| Update selected roles and inheritance | same | `updateMemberRoles`, `syncMemberRoleInheritance` | select menu | member roles / logs | manual role correction | partly idempotent | Critical | Roles / Guest Gate |
| Guest cleanup queue | same | `buildGuestCleanupPlan`, `executeGuestCleanup` | slash + confirm | many member roles / logs | manual role restoration | plan guard, not transactional | Critical | Roles / MemberGuard |
| Persist role settings | same | `writeSettingsData`, `updateRoleSettings` | settings command | `role-settings.json` | restore JSON | no transaction | High | Roles |
| Persist panel record | `legacy/systemRuntimes/channelPanelsRuntime.js` | `savePanelRecord`, `deletePanelRecord` | panel lifecycle | `channel-panels.json` | restore JSON | no transaction | High | Panels |
| Publish / refresh / force panels | same | `applyPanelToChannel`, `setupChannelPanels` | slash / internal call | Discord messages | message edit/delete irreversibility differs | record-based, target-dependent | High | Panels |
| Persist proposal and game metadata | `legacy/systemRuntimes/gameSuggestionSystemRuntime.js` | `saveSuggestion`, `writeGameCategories` | proposal workflow | JSON contracts | restore JSON | no transaction | Critical | Proposals |
| Publish / update proposal card | same | `createGameSuggestion`, `updateSuggestionMessage`, `handleVote` | slash/modal/button | suggestion message | edit/revert where message exists | vote state is mutable | High | Proposals |
| Create dynamic game category | same | `createDynamicGameCategory` | admin approval | categories, child channels, overwrites, metadata | manual removal/move and metadata repair | intended name/identity reconciliation | Critical | Proposals / Games |
| Refresh panels / Voice Hub / server logs after approval | same | `approveSuggestion` | approve button | panels, Voice Hub, log channel | feature-specific | not atomic | Critical | Cross-feature |
| Archive inactive dynamic game | same | `archiveInactiveGames` | command | parent category and metadata | move back manually | activity-dependent | High | Maintenance / Games |
| Bootstrap / repair / dedupe | `legacy/community/communityBootstrapSystem.js` | bootstrap/repair/dedupe functions | grouped community commands | categories/channels/roles/overwrites/registry | plan-dependent/manual | partial idempotence | Critical | Bootstrap / Permission Repair |
| Polish / rebuild | `legacy/community/serverPolisher.js`, `serverRebuilder.js` | plan executors | admin confirm | roles/channels/categories/overwrites/archive/delete | limited/manual | partial idempotence | Critical | Maintenance |
| V3 reconciliation post-actions | `legacy/systemRuntimes/communityV3BuilderRuntime.js` | V3 executor | rebuild command | Guide, panels, game metadata | partial/manual | reconciliation oriented | Critical | Bootstrap / Guide / Panels |

## Required findings

1. **Read and mutation mixed in one function:** `setupCommunityGuide`, `setupRoadmapPanel`, `handleConciergeButton`, `updateMemberRoles`, `applyPanelToChannel`, `approveSuggestion`, and bootstrap/rebuild executors read state, decide, mutate Discord, then persist records in the same function.
2. **Renderer with mutation:** Guide rendering itself (`buildGuideEmbed`, `buildGuideRows`) is pure, but `setupCommunityGuide` couples it to channel creation, overwrite sync, message publication, and JSON writes. Panel `buildPanel` is pure-ish, while its runtime immediately combines it with message lifecycle operations.
3. **Services that secretly write:** legacy runtime modules are not clean services: role manager writes JSON and logs; panel runtime writes records; proposal runtime writes both JSON contracts and performs Discord mutations; Concierge writes onboarding state.
4. **Get/load names that repair:** `getOrCreateCategory`, `getOrCreateGuideChannel`, `getOrCreateRoadmapChannel`, and structure-manager `ensure` methods are mutations despite retrieval-oriented names.
5. **Ensure methods that are not reads:** every `ensureFile`, `getOrCreate*`, `setupSelfAssignableRoles`, and panel setup flow can create filesystem or Discord state.
6. **Repeatability:** name/message-ID-based Guide and panel setup is intended to be repeatable, but stale message records, permission drift, partial failures, and force mode mean it is not transactionally idempotent. Proposal vote/review and member-add messages are not idempotent.
7. **Largest API bursts:** Guest cleanup member scan/role queue; bootstrap/rebuild/polish reconciliation; dynamic-game approval; panel setup over `target=all`; and channel/message fetches during guide refresh.
8. **Rollback quality:** embeds and overwrite plans can be manually edited/restored, but role changes, DMs, deleted force-panel messages, category moves, and broad rebuild actions lack one automatic transaction/rollback boundary.

## Boundary recommendation

Future slices must split read model construction from mutation execution. A mutation slice should accept a prepared request/plan, return an explicit result, use a dedicated port for Discord/JSON effects, and retain the legacy executor as a compatibility path until output and side-effect regression fixtures exist.
