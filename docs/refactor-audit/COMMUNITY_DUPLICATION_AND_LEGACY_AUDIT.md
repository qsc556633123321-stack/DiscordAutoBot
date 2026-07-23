# Community Duplication and Legacy Audit

| Classification | Paths | Finding | Action in a later migration |
| --- | --- | --- | --- |
| Active implementation | `src/services/community/communityPermissionService.js`, `communityRebuildService.js`, `communityService.js` | Active facades expose the intended service names but still delegate material behavior to legacy. | Retain; replace internals only after behavior fixtures exist. |
| Active compatibility | `src/systems/communityBootstrapSystem.js`, `serverPolisher.js`, `serverRebuilder.js`, `communityV3Builder.js`, `rolePermissions.js`, `guestGate.js` | Compatibility names and legacy sources coexist. | Keep as rollback sources; do not delete or rename during discovery. |
| Duplicate candidate | `src/config/communityArchitectureV3.js`, `communityLayout.js`, `communityStructure.js`, `communityRules.js`, `permissionTemplates.js`, `roleChannelAccess.js` | Multiple historical sources describe category/role/permission concepts. | Reconcile only after the V3 facts have behavior fixtures; high semantic risk. |
| Duplicate candidate | `communityBootstrapSystem`, `serverPolisher`, `serverRebuilder`, `communityV3BuilderRuntime`, `communityArchitect*` | Multiple builders/planners can create or rearrange similar server structures. | Define one structural use-case family later; current runtime behavior is too coupled for removal. |
| Duplicate candidate | `roleManagerRuntime`, `guestGate`, `rolePermissions`, `communityV3PermissionBuilder`, `communityPermissionService` | Role inheritance, visibility and overwrite plans are split across layers. | Migrate policy facts first, then plan builder, then mutation gateway. |
| Duplicate candidate | `channelPanelsRuntime`, `communityConcierge`, `setup-channel-panels`, `setup-community-guide` | Panel/guide messages overlap in discovery/navigation role. | Treat as two bounded subdomains until message ownership is proven. |
| Rollback source | all `src/legacy/community/**`, `src/legacy/permissions/**`, named legacy system runtimes | Alias registry and active allowlisted paths make these runtime-required. | Never remove in the same change that redirects behavior. |
| Migrated read query | `community-roadmap` legacy command, Roadmap gateway/domain/presentation | The legacy command is now a direct wrapper. The Concierge helper remains a compatibility consumer for guide/button paths; the JSON fallback exists once in the infrastructure reader. | Keep the wrapper and helper during the observation window; do not create another reader or fallback copy. |
| Removal candidate | None proven in Community scope. | Dynamic loading and explicit legacy allowlist prevent a safe unused conclusion. | Reassess after route-by-route migration and release window. |
| Dead candidate | None proven in Community scope. | Static search is insufficient because aliases/events load directories dynamically. | Keep. |
| Unknown | Dashboard role/server/announcement pages. | Similar nouns but no verified Community write/read contract. | Dashboard discovery separately. |

## Discovery Completion Addendum

The remaining Community analysis confirms that duplicated names do not imply one safe migration target. Guide, Onboarding, Roles, Panels, Proposals, Bootstrap, and Maintenance have distinct persistence and mutation boundaries. The only current low-risk follow-up is the read-only `/help-me-start` path; no active duplicate or legacy module is approved for removal.
