# Community Guide Mutation Baseline Coverage

| Operation | Exact production source | Baseline test | Happy | Failure | Partial | Retry | Fixture | Status | Migration blocker |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G01 locate category | `communityConcierge:getOrCreateCategory` | Channel Ensure | yes | partial | yes | documented | legacy baseline | Covered | name matching remains coupled |
| G02 locate guide channel | `getOrCreateGuideChannel` | Existing Refresh / Channel Ensure | yes | partial | yes | documented | legacy baseline | Covered | category lookup internal |
| G03 create guide category | `getOrCreateCategory` | Channel Ensure / Partial Failure | yes | yes | yes | documented | legacy baseline | Covered | direct Discord call remains coupled |
| G04 create guide channel | `getOrCreateGuideChannel` | Channel Ensure / Partial Failure | yes | yes | yes | documented | legacy baseline | Covered | direct Discord call |
| G05 move guide channel | `getOrCreateGuideChannel` | Channel Ensure | yes | yes | yes | documented | legacy baseline | Covered | direct Discord call remains coupled |
| G06 apply guide overwrite | `getOrCreateGuideChannel` | Channel Ensure / Partial Failure | yes | swallowed | yes | none | legacy baseline | Covered | full overwrite replacement |
| G07 load guide record | `readOnboardingData` | Persistence | yes | malformed/missing | n/a | none | legacy baseline | Covered | direct file I/O |
| G08 fetch guide message | `setupCommunityGuide` | Existing/New Publish | yes | fetch rejection | n/a | none | legacy baseline | Covered | no retry |
| G09 edit guide message | `setupCommunityGuide` | Existing Refresh | yes | edit rejection | yes | none | legacy baseline | Covered | error propagation |
| G10 send guide message | `setupCommunityGuide` | New Publish | yes | send rejection | yes | documented | legacy baseline | Covered | send-before-write |
| G11 persist guide ID | `saveOnboarding` | Persistence / New Publish | yes | write rejection | yes | documented | legacy baseline | Covered | shared record |
| G12 load roadmap record | `readOnboardingData` | Mutation Order | yes | inherited malformed path | n/a | none | legacy baseline | Partial | focused malformed roadmap test remains absent |
| G13 edit roadmap message | `setupRoadmapPanel` | Mutation Order / Partial Failure | yes | yes | yes | none | legacy baseline | Covered | shared record and command coupling |
| G14 send roadmap message | `setupRoadmapPanel` | existing characterization / Partial Failure | yes | yes | yes | none | legacy baseline | Covered | send-before-write partial success |
| G15 persist roadmap ID | `saveOnboarding` | Partial Failure / Mutation Order | yes | second-write failure | yes | documented | legacy baseline | Covered | shared record |

## Coverage Decision

The baseline is sufficient to freeze existing behavior and identify precise
gaps. It is deliberately not sufficient to approve a production migration:
the shared Guide/Roadmap record, full permission overwrite replacement,
bootstrap/V3 caller variance, and the lack of a focused malformed-Roadmap
record path still block an isolated mutation slice.
