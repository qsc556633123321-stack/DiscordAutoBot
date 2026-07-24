# Community Mutation Cross-Feature Dependency Map

| Feature | Hard dependencies | Compatibility / soft dependencies | Extraction boundary |
| --- | --- | --- | --- |
| Guide Publish | Guide payload, onboarding JSON, channel permissions | Bootstrap/V3 refresh | message publish + persistence only after channel/permission ports exist |
| Panels | panel JSON, Discord messages | Guide, Roles, Ticket, Voice, Proposals | keep separate bounded context |
| Bootstrap | channels, roles, overwrites, registries | Guide, Panels, Games | orchestrator last |
| Roles | Discord hierarchy, role settings | MemberGuard, Onboarding, Panels | role mutation gateway |
| Onboarding | member-add event, roles, welcome settings | Guide, MemberGuard | event workflow after role gateway |
| Proposals | suggestion/game metadata, Discord channels | Panels, Voice, Permissions | Game proposal state machine |
| Maintenance | plans, protected resources, logs | Layout, Permission Repair, Voice/Tickets | diagnostics before execution |

Guide Status has no node because it has no confirmed runtime consumer.
