# Community Remaining Operation Matrix

Counts below are tags, not mutually exclusive rows: an operation can read state, mutate Discord, and orchestrate several child effects.

| Operation | File | Area | Read | Discord Mutation | Data Mutation | Orchestration | Idempotent | Risk | Candidate Slice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `buildGuideEmbed` | communityConcierge | Guide | yes | no | no | no | yes | 1 | Guide renderer |
| `buildGuideRows` | communityConcierge | Guide | yes | no | no | no | yes | 1 | Guide renderer |
| `quickLinks` / `listChannelsByPatterns` | communityConcierge | Guide | yes | no | no | no | yes | 1 | Guide query |
| `buildHelpMeStartEmbed` | interactiveGuideSystem | Guide | yes | no | no | no | yes* | 2 | Help-me-start query |
| `setupCommunityGuide` | communityConcierge | Guide | yes | yes | yes | yes | partial | 5 | Guide publish |
| `setupRoadmapPanel` | communityConcierge | Guide | yes | yes | yes | yes | partial | 4 | Guide refresh |
| `handleConciergeButton` (night/bot/roadmap) | communityConcierge | Guide | yes | no | no | no | yes | 1 | Read Concierge buttons |
| `handleConciergeButton` (games/invest/dev) | communityConcierge | Guide / Roles | yes | yes | no | yes | partial | 4 | Role grant button |
| `sendConciergeWelcome` | communityConcierge | Onboarding | yes | yes | no | no | no | 3 | Deferred event mutation |
| `handleGuildMemberAdd` | welcomeSystem | Onboarding | yes | yes | no | yes | partial | 4 | Deferred event mutation |
| `ensureGuestRole` | welcomeSystem | Onboarding / Roles | yes | yes | no | yes | partial | 4 | Guest assignment |
| `sendWelcomeDm` | welcomeSystem | Onboarding | yes | yes | no | no | no | 2 | Deferred event mutation |
| `scheduleRoleReminder` | welcomeSystem | Onboarding | yes | yes | no | yes | no | 3 | Deferred reminder |
| `handleMemberGuardJoin` | memberGuard service | MemberGuard | yes | yes | yes | yes | feature-defined | 5 | Excluded cross-feature |
| `getRoleOptions` | roleManagerRuntime | Roles | yes | no | no | no | yes | 1 | Role query |
| `getRoleSettings` | roleManagerRuntime | Roles | yes | no | no | no | yes | 1 | Role settings query |
| `setupSelfAssignableRoles` | roleManagerRuntime | Roles | yes | yes | no | yes | partial | 4 | Role setup |
| `syncMemberRoleInheritance` | roleManagerRuntime | Roles | yes | yes | no | yes | partial | 4 | Role selection mutation |
| `updateMemberRoles` | roleManagerRuntime | Roles | yes | yes | no | yes | partial | 5 | Role selection mutation |
| `updateRoleSettings` | roleManagerRuntime | Roles | yes | no | yes | no | yes | 3 | Role settings mutation |
| `buildGuestCleanupPlan` | roleManagerRuntime | Roles | yes | no | no | yes | yes | 3 | Guest cleanup query |
| `executeGuestCleanup` | roleManagerRuntime | Roles | yes | yes | no | yes | partial | 5 | Guest cleanup mutation |
| `buildPanel` | channelPanelsRuntime | Panels | yes | no | no | no | yes | 1 | Panel renderer |
| `getTargetChannels` | channelPanelsRuntime | Panels | yes | no | no | no | yes | 1 | Panel target query |
| `applyPanelToChannel` | channelPanelsRuntime | Panels | yes | yes | yes | yes | partial | 4 | Panel publish |
| `setupChannelPanels` | channelPanelsRuntime | Panels | yes | yes | yes | yes | partial | 5 | Panel publish orchestration |
| `createGameSuggestion` | gameSuggestion runtime | Proposals | yes | yes | yes | yes | no | 4 | Proposal submit |
| `handleVote` | gameSuggestion runtime | Proposals | yes | yes | yes | yes | partial | 3 | Proposal review |
| `showGameSuggestionModal` | gameSuggestion runtime | Proposals | no | yes | no | no | yes | 1 | Proposal presentation |
| `handleCreateSuggestionModal` | gameSuggestion runtime | Proposals | yes | yes | yes | yes | no | 4 | Proposal submit |
| `approveSuggestion` | gameSuggestion runtime | Proposals / Games | yes | yes | yes | yes | partial | 5 | Proposal approval |
| `rejectSuggestion` | gameSuggestion runtime | Proposals | yes | yes | yes | yes | partial | 3 | Proposal review |
| `createDynamicGameCategory` | gameSuggestion runtime | Games / Layout | yes | yes | yes | yes | partial | 5 | Blocked by Games/Voice |
| `archiveInactiveGames` | gameSuggestion runtime | Maintenance / Games | yes | yes | yes | yes | partial | 4 | Separate feature |
| `bootstrapCommunity` | communityBootstrapSystem | Bootstrap | yes | yes | yes | yes | partial | 5 | Bootstrap execute |
| `repairChannelPermissions` | communityBootstrapSystem | Permission Repair | yes | yes | yes | yes | partial | 5 | Blocked by Permission Repair |
| `rebuildCommunityLayout` | communityBootstrapSystem | Layout | yes | yes | yes | yes | partial | 5 | Blocked by Layout |
| `checkOnboardingVisibility` | communityBootstrapSystem | Permission Repair | yes | no | no | no | yes | 2 | Completed query dependency |
| `buildCommunityV3Plan` | communityV3BuilderRuntime | Bootstrap | yes | no | yes | yes | partial | 4 | Bootstrap plan |
| `executeCommunityV3` | communityV3BuilderRuntime | Bootstrap | yes | yes | yes | yes | partial | 5 | Rebuild execute |
| `buildCommunityArchitectPlan` | communityArchitectPlanner | Layout | yes | no | yes | yes | partial | 4 | Architect diagnose |
| `executeCommunityArchitectPlan` | communityArchitectExecutor | Layout | yes | yes | yes | yes | partial | 5 | Architect execute |
| `buildPolishPlan` / `executePolish` | serverPolisher | Layout / Roles | yes | yes | yes | yes | partial | 5 | Deferred maintenance |
| `createRebuildPlan` / `executeRebuild` | serverRebuilder | Bootstrap | yes | yes | yes | yes | partial | 5 | Rebuild execute |
| `buildFactoryResetPlan` / `executeFactoryReset` | factoryResetRuntime | General admin | yes | yes | yes | yes | no | 5 | Separate destructive feature |

## Actual tagged totals

- Read-only operations (read=yes, Discord mutation=no, data mutation=no): **11**
- Discord-mutation operation tags: **31**
- Data-mutation operation tags: **23**
- Orchestration operation tags: **31**
- Concrete operation rows: **45**

`buildHelpMeStartEmbed` is marked `yes*` for idempotence because it optionally calls OpenAI for prose. Its deterministic fallback/payload needs a fixture before migration.
