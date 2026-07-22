# Community Feature Candidate Inventory

## Method

The inventory searched `src`, `tests`, `scripts`, `apps`, `docs`, command/alias registries, event loading, deployment, and configuration for Community, guild, setup, bootstrap, onboarding, welcome, roles, categories, channels, layout, permission, announcement, suggestion, organizer, MemberGuard, and server-memory terms. A name match alone is not treated as feature ownership.

There are **55 Community candidates** in the bounded scan below. The grouping preserves exact paths while avoiding the false claim that every role/channel utility belongs to Community.

Legend: `D` reads Discord objects; `M` mutates Discord; `P` persists data; `V/L/PR/MG/O/M` mean Voice, Layout, Permission Repair, MemberGuard, Organizer, and Memory coupling.

| Classification | Paths / exports | Actual responsibility and runtime entry | D/M/P | Coupling | Testability / risk / proposed phase |
| --- | --- | --- | --- | --- | --- |
| Active source | `src/domain/community/communityArchitectureV3.js` (`categories`, `roles`, `games`, `onboarding`) | V3 structural facts used by permission and game policies; loaded through active services and test scripts. | no/no/no | L, PR | Pure fixture test possible; medium because it defines shared names and keys. Preserve as Community Core. |
| Active source | `src/domain/community/permissionMatrix.js` (`expandRoleKeys`, `roleCanAccessCategory`) | Role inheritance and category access facts. Used by the permission service and legacy permission paths. | no/no/no | PR, MG | Existing permission test; high user-visible impact. Community Permissions. |
| Active source | `src/domain/community/onboardingVisibilityPolicy.js` | Authorization rule for onboarding inspection. | no/no/no | PR | Regression exists; low. Already a completed vertical-slice component. |
| Active source | `src/application/community/checkOnboardingVisibilityUseCase.js` | Read-only onboarding inspection orchestration. | guild/no/no | PR | Migration regression exists; low. Do not re-migrate. |
| Active gateway | `src/infrastructure/discord/onboardingVisibilityGateway.js` | Delegates native onboarding inspection/rendering to legacy bootstrap source. | guild/no/no | legacy bootstrap, PR | Regression exists; medium due native onboarding contract. |
| Active service | `src/services/community/communityPermissionService.js` | Builds permission and Guest Gate plans; inspection, role visibility/debug, lock mutation. | guild/yes/no | L, PR, MG | Permission tests only; very high. Last-stage migration candidate. |
| Active service | `src/services/community/communityRebuildService.js` | Preview/execute V3, bootstrap, layout rebuild, polish and architect plan facades. | guild/yes/plan files indirectly | L, PR, Voice | No dedicated service tests; very high. Community Bootstrap/Layout orchestration. |
| Active service | `src/services/community/communityService.js` | Move/rename channels through repository and panel setup facade. | channel/yes/no | Panels, L | No direct test; medium-high. Community Operations. |
| Compatibility adapter | `src/adapters/legacy/legacyCommunityCommandExecutor.js`, `legacyCommandAdapters.js`, `legacyConfigAdapter.js`, `legacyDataAdapter.js` | Routes grouped/legacy community commands and bridges config/data formats. | varies | all legacy Community | Adapter tests are indirect; high because aliases depend on it. Preserve as rollback source. |
| Compatibility facade | `src/systems/communityBootstrapSystem.js`, `serverPolisher.js`, `serverRebuilder.js`, `communityV3Builder.js`, `communityV3PermissionBuilder.js`, `rolePermissions.js`, `guestGate.js` | Re-export or route to legacy Community/permission behavior. | varies | L, PR | Active compatibility, not independent features; high. |
| Legacy active | `src/legacy/community/communityBootstrapSystem.js` (`bootstrapCommunity`, `rebuildCommunityLayout`, `repairChannelPermissions`, `checkOnboardingVisibility`) | Core legacy bootstrap, matching, creation, channel move/order, guide invocation, and permission repair. Reached by rebuild/permission paths and gateway. | yes/yes/yes | L, PR, Voice, panels | 814 lines; high mutation and partial-failure risk. Community Bootstrap/Permissions. |
| Legacy active | `src/legacy/community/serverPolisher.js`, `serverRebuilder.js` | Polish plan/execute and template rebuild helpers. | yes/yes/yes | L, PR, roles, panels | High risk; active through rebuild service/factory paths. |
| Legacy active | `src/legacy/permissions/guestGate.js`, `rolePermissions.js`, `permissionTemplates.js`, `communityV3PermissionBuilder.js` | Guest visibility, role/category overwrite plans, templates, V3 permission builder. | yes/yes/plan JSON | PR, MG, V3 | High: explicit service allowlist imports. |
| Legacy runtime | `src/legacy/systemRuntimes/communityV3BuilderRuntime.js` | V3 plan persistence/execution, category/channel/role reconciliation, game metadata and guide integration. | yes/yes/yes | L, PR, Voice, games | Very high; active facade. |
| Legacy runtime | `src/legacy/systemRuntimes/roleManagerRuntime.js` | Self-assignable role setup, inheritance, role settings and role-panel helpers. | yes/yes/role JSON | MG, PR, panels | Very high; used by events/interactions. |
| Legacy runtime | `src/legacy/systemRuntimes/channelPanelsRuntime.js` | Panel matching, creation/refresh/force deletion, panel persistence and interaction assets. | yes/yes/panel JSON | roles, tickets, Voice | High; panel command is active. |
| Legacy runtime | `src/legacy/systemRuntimes/gameSuggestionSystemRuntime.js` | Suggestion card, review, game-category creation and integration hooks. | yes/yes/suggestion/game JSON | Voice, LFG, Voice Hub, games | Very high; belongs to Community Proposals but crosses Voice. |
| System | `src/systems/communityConcierge.js`, `interactiveGuideSystem.js` | Guide/roadmap/about/help content, onboarding state, channel/panel creation, role quick-add and optional OpenAI wording. | yes/yes/onboarding/roadmap JSON | roles, PR, AI | `community-about` read-only subpath is testable; setup guide is high risk. Community Onboarding. |
| System | `src/systems/welcomeSystem.js`, `src/events/guildMemberAdd.js` | New-member welcome, guest role and Concierge welcome invocation. | member/yes/welcome JSON | MG, roles, messages | Event path; high user-visible risk. Community Event Integration. |
| System | `src/systems/roleManager.js`, `src/systems/channelPanels.js`, `src/systems/gameSuggestionSystem.js` | Thin active facades over legacy role/panel/game-suggestion runtimes. | varies | MG, panels, Voice | Compatibility only; not new sources of truth. |
| System | `src/systems/communityArchitect*.js`, `communityHealthScorer.js`, `communityStructureManager.js`, `communityV3Validator.js` | Community structure diagnosis/planning/execution helpers. | yes/yes/plan JSON | L, PR, games | Medium to very high depending executor; layout-focused, not an independent Community Core slice. |
| Layout cross-feature | `src/systems/layoutDecisionEngine.js`, `src/modules/layout/**`, `src/legacy/layout/**`, `src/systems/aiLayoutPlanner.js` | Channel classification, duplicate detection, rename/archive/delete planning, permission plan delegation. | yes/yes/plan JSON | Community, PR, games | Layout feature, not Community ownership. Record only. |
| Command presentation | `src/legacy/commands/bootstrap-community.js`, `rebuild-community-layout.js`, `rebuild-community-v3.js`, `community-architect.js`, `polish-server-design.js`, `layout-doctor.js`, `dedupe-layout.js` | Slash option parsing, preview/confirm UI and legacy adapter dispatch. | interaction/yes/no | L, PR | Runtime aliases; high for mutation commands. |
| Command presentation | `src/legacy/commands/check-guest-visibility.js`, `check-role-visibility.js`, `check-onboarding-visibility.js`, `debug-permissions.js`, `apply-role-permissions.js`, `repair-channel-permissions.js` | Read-only checks and permission preview/confirm UI. | interaction/yes/no | PR, MG | `check-onboarding` already migrated; others medium-high. |
| Command presentation | `src/legacy/commands/community-about.js`, `community-roadmap.js`, `help-me-start.js`, `setup-community-guide.js`, `refresh-community-guide.js` | Read-only concierge embeds and guide/roadmap setup. | interaction/yes/onboarding JSON for setup | Onboarding, roles, AI | About is a low-risk complete-slice candidate; guide setup high. |
| Command presentation | `src/legacy/commands/setup-server.js`, `setup-roles.js`, `role-settings.js`, `cleanup-guest-roles.js`, `setup-channel-panels.js`, `announce.js` | Setup/admin entrypoints with role, panel, channel or message effects. | interaction/yes/various JSON | MG, panels, maintenance | High; command names alone do not make them one feature. |
| Command presentation | `src/legacy/commands/suggest-game.js`, `setup-game.js`, `fix-game-category.js`, `archive-inactive-games.js`, `game-registry-doctor.js` | Game category/suggestion operations. | interaction/yes/game JSON | Voice, LFG, registry | Games feature, not Community Core; exclude from first migration. |
| Data contract | `src/data/onboarding-flows.json`, `community-roadmap.json`, `community-layout-registry.json`, `community-architect-plans.json`, `layout-repair-plans.json`, `game-suggestions.json`, `game-categories.json`, `channel-panels.json`, `role-settings.json`, `welcome-settings.json` | Existing JSON contracts read by Community-related legacy code. | no/no/yes | multiple | Formal data: no modifications in discovery. Migration requires shape fixtures first. |
| Infrastructure/shared | `src/infrastructure/discord/discordChannelRepository.js`, `discordPermissionWriter.js`, `serverLogGateway.js`; `src/systems/serverLogs.js` | Generic Discord mutations/logging reused across features. | yes/yes/no | all | Not Community-owned; consume via ports later. |
| Dashboard-only | `apps/api/server.js`, `apps/web/app/dashboard/servers/page.js`, `roles/page.js`, `announcements/page.js`, `components/RoleManager.js` | Dashboard reads/static UI for guild/channel/role/panel concepts. | API/no or mock | Dashboard | No proved Community write contract; Discovery only. |
| Tests/scripts/docs | `tests/migration/check-onboarding-visibility.test.js`, `scripts/test-permissions.js`, `scripts/test-architecture.js`, `scripts/generate-legacy-audit.js`, `docs/**` | Regression, policy and inventory tooling. | no/no/docs | n/a | Community-specific coverage is incomplete. |

## Active runtime paths

```text
Bot start: src/index.js
  -> commandRegistry (7 grouped commands + legacy aliases)
  -> aliasRegistry dynamically loads src/legacy/commands/*.js
  -> events dynamically load src/events/*.js and src/legacy/events/*.js

/community rebuild
  -> commandRouter
  -> legacy rebuild-community-v3 alias command
  -> legacyCommandAdapters.rebuild
  -> communityRebuildService
  -> systems/communityV3Builder facade
  -> legacy communityV3BuilderRuntime
  -> Discord categories/channels/roles/overwrites + JSON plans + log/reply

/community repair-permissions
  -> commandRouter
  -> legacy repair-channel-permissions command
  -> legacyCommandAdapters.permissions
  -> communityPermissionService
  -> legacy guestGate/rolePermissions and discordPermissionWriter
  -> permission overwrites + plan storage + reply

/check-onboarding-visibility
  -> aliasRegistry legacy wrapper
  -> presentation/checkOnboardingVisibilityCommand
  -> application/checkOnboardingVisibilityUseCase
  -> communityPermissionService
  -> onboardingVisibilityGateway
  -> legacy communityBootstrapSystem inspection
  -> embed reply

guildMemberAdd
  -> MemberGuard runtime adapter
  -> welcomeSystem
  -> communityConcierge.sendConciergeWelcome
  -> DM/message and onboarding-flow lookup
```

## Candidate count interpretation

The 55 items include shared infrastructure, tests, dashboard copies, and cross-feature consumers. They are not 55 migration targets. The current first-order Community migration surface is approximately 24 runtime/compatibility candidates; the rest are explicitly excluded or shared.
