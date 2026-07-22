# Community Migration Risk Matrix

Scores: 1 low, 5 very high. Total is the sum of runtime criticality, Discord side-effect risk, persistence risk, cross-feature coupling, test gap, rollback difficulty, user-visible impact, permission risk, and data-loss risk.

| Subdomain | Criticality | Discord | Persistence | Coupling | Test gap | Rollback | Visible | Permission | Data loss | Total / level | Evidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Community About read-only command | 2 | 1 | 1 | 1 | 2 | 1 | 2 | 1 | 1 | 12 Low | `community-about` only renders `buildAboutEmbed`; no mutation/storage. |
| Community Roadmap read-only command | 2 | 1 | 2 | 1 | 2 | 1 | 2 | 1 | 1 | 13 Low | Reads roadmap JSON through Concierge and renders an embed. |
| Onboarding visibility inspection | 3 | 1 | 1 | 3 | 2 | 2 | 3 | 4 | 1 | 20 Medium | Already migrated wrapper; reads Guild visibility/native guidance. |
| Community guide setup | 3 | 4 | 3 | 3 | 4 | 3 | 4 | 3 | 1 | 28 High | Creates/moves channels, overwrites, messages, onboarding JSON. |
| Roles / self roles | 4 | 5 | 3 | 4 | 4 | 4 | 5 | 5 | 2 | 36 Very High | Role hierarchy/add/remove and guest/member behavior. |
| Permission repair / Guest Gate | 5 | 5 | 3 | 5 | 4 | 5 | 5 | 5 | 2 | 39 Very High | `communityPermissionService` directly delegates to legacy templates/plans. |
| Bootstrap/V3 rebuild | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 4 | 43 Very High | Multi-step channel/role/overwrite/panel operations with partial-failure risk. |
| Proposals/game suggestions | 4 | 4 | 4 | 5 | 5 | 4 | 4 | 3 | 2 | 35 Very High | Approval triggers dynamic game and Voice/LFG integrations. |
| Layout/maintenance | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 44 Very High | Rename/move/delete candidate behavior overlaps a separate Layout feature. |

## Conclusion

Start with a read-only Concierge command. Treat permission repair, bootstrap/rebuild, role mutation, game proposals, and Layout as late-stage work. Voice remains deferred/high-risk.
