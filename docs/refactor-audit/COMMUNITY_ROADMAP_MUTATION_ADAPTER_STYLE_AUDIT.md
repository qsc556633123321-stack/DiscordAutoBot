# Community Roadmap Mutation Adapter Style Audit

| Concern | Guide mutation adapter | Roadmap preparation decision |
| --- | --- | --- |
| Factory | CommonJS factory | `createRoadmapPublicationMessageMutationAdapter` |
| Dependency | Session object | `{ resourceSession }` for Roadmap terminology |
| Result mapping | Application result factories | Roadmap Application Mutation Port factories |
| Edit success ID | Request ID | retained original Message ID after strict match |
| Send success ID | sent Message ID | sent Message ID |
| Failure behavior | maps to Guide failure result | rethrows exact raw rejection |
| Persistence | none | none |

Guide's adapter cannot be reused because its failure-result contract is
Guide-specific. Roadmap's existing port has no failure variant, so the future
Roadmap adapter must preserve the Session's exact rejection instead.
