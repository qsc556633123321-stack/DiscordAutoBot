# Community Maintenance Boundary Discovery

| Operation family | Concrete source / function | Owner | Mutation level | Notes |
| --- | --- | --- | --- | --- |
| Sync | `syncMemberRoleInheritance` | Roles | member role mutation | Formal-member inheritance, not Community maintenance. |
| Sync | category/child overwrite sync in legacy role permissions | Permission Repair | overwrite mutation | Shared access contract. |
| Cleanup | `executeGuestCleanup` | Roles / MemberGuard boundary | bulk role mutation | Retry queue and logs. |
| Cleanup | Temp Voice missing-room cleanup | Voice | channel/data mutation | Not Community-owned. |
| Ensure | `getOrCreateGuideChannel`, `getOrCreateRoadmapChannel` | Guide publish | channel/overwrite/message/data mutation | `getOrCreate` is not a read. |
| Ensure | `ensureLayout`, `ensureCategory`, `ensureChannel`, `ensureRoles` | Layout / Bootstrap | broad Discord mutation | High risk. |
| Ensure | `ensureCommunityStructure` | Layout / Game Proposals support | channel/role mutation | Shared structural helper. |
| Repair | `repairChannelPermissions` | Permission Repair | overwrite mutation | Do not classify as Community-only. |
| Repair | `repairCreateEntryRegistry` | Voice / Games | metadata mutation | Temp Voice create-entry contract. |
| Reconcile | `executeCommunityV3` | Bootstrap orchestration | broad mutation | Invokes Guide/Panels post-actions. |
| Audit | `checkOnboardingVisibility`, `layoutDoctor`, Architect diagnose | Permission Repair / Layout | read-only plan/report | Completed onboarding query stays separate. |
| Architect | planner/executor | Layout orchestration | plan then move/rename/sync/archive | Community-branded entry, Layout-owned mechanics. |
| Rebuild | server rebuilder / V3 builder | Bootstrap orchestration | broad mutation/delete path | Protects tickets/temp voice but remains high-risk. |
| Archive | `archiveInactiveGames`, dedupe archive category | Proposal/Games or Layout | parent mutation | Not general Community archival. |
| Reset | factory reset runtime | General destructive administration | delete/mutate/data clear | Separate high-risk feature. |
| Scheduled cleanup | Welcome reminder timeout | Welcome / Onboarding | delayed message | In-memory only; one reminder guard. |
| Reminder cleanup | recent welcome / reminder maps | Welcome | memory cleanup | Process-local, not durable scheduler. |

## Owner rule

Community owns structural intent and guide-facing coordination, not every operation with a community noun. Layout owns topology, Permission Repair owns overwrites, Voice owns temporary-room lifecycle, Roles owns membership roles, Proposal/Games owns game suggestion lifecycle, and infrastructure owns logging/storage primitives.
