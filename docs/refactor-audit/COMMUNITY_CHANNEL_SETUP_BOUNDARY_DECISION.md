# Community Channel Setup Boundary Decision

| Candidate | Decision |
| --- | --- |
| A. Application `CommunityChannelSetupUseCase` + Infrastructure `CommunityChannelMutationGateway` | rejected for first implementation; broad semantic plan is not yet frozen |
| B. Infrastructure-only `CommunityChannelSetupAdapter` | **recommended**; smallest compatibility boundary around exact runtime ensure behavior |
| C. Setup Plan + Gateway | rejected; adds plan semantics before they are needed |
| D. Guide/Roadmap shared full setup boundary | rejected; their parent/permission contracts differ |
| E. Lookup/duplicate-only boundary | rejected; cannot independently preserve create/partial-failure behavior |
| F. Keep runtime | rejected; direct runtime Discord mutation remains a measurable ownership gap |

Recommended future API: `createCommunityChannelSetupCompatibilityAdapter` with
narrow Guide and Roadmap ensure operations, accepting plain names/overwrites
plus an injected Guild-facing resource. It must return the exact channel object.
The adapter is Infrastructure-owned; no Application port is approved until a
semantic request can be demonstrated without leaking Discord objects.
