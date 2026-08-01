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

## Guide Baseline Update (2026-07-25)

The frozen Guide mutation harness adds characterization evidence without
changing the legacy runtime. Its risk remains High: Guide/Roadmap persistence,
full overwrite replacement, and indirect Bootstrap/V3 caller behavior remain
coupled.

The Shared Persistence Contract adds frozen schema and failure evidence, but
does not lower the Guide publish/refresh risk or mark a repository migrated.

The Publication Identity Contract does not lower that risk: duplicate detection
and record recovery are absent from the active runtime.

Guide channel lookup remains characterization-only. It is a confirmed consumer,
but its immediate member-DM side effect and legacy fallback rules make a
runtime extraction high-risk without a separately approved boundary.

Welcome delivery contracts do not reduce runtime risk: identity lookup, DM
send, and swallowed errors remain coupled in the legacy consumer.

The payload builder integration is low-risk and complete; the lookup/DM/error
coupling remains high-risk for every broader delivery candidate.

Result return-shape and Failure Reason mapping remain high risk because the
legacy caller observes neither and swallowed rejection matches success.
