# Community Mutation Migration Risk Matrix

| Candidate | Runtime certainty | Mutation / persistence complexity | Cross-feature coupling | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Guide payload read | confirmed and complete | none | low | Complete | retain compatibility delegation |
| Guide publish/refresh | confirmed | message + JSON + channel/overwrites | Bootstrap, Roadmap, Permissions | High | discovery only |
| Panel publish/refresh | confirmed | message + JSON + delete | Roles, Voice, Ticket, Proposals | High | separate later |
| Role setup/self-select | confirmed | role creation/assignment + settings | MemberGuard, Onboarding, Panels | High | separate role gateway first |
| Welcome/initial guest | confirmed | role + message + DM + timers | MemberGuard, Guide | High | event workflow later |
| Proposal approval | confirmed | JSON + channels + overwrites + panel refresh | Games, Voice, Panels | Blocked | wait for contracts |
| Bootstrap/rebuild | confirmed | broad multi-resource mutation | all Community contexts | Blocked | orchestrator last |
| Destructive maintenance | confirmed | irreversible delete / cleanup | Layout, Voice, Ticket | Blocked | diagnostics first |
| Guide Status | no consumer | none | none | Not a candidate | do not migrate |
