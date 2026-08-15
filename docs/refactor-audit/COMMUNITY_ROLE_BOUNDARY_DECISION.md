# Community Role Boundary Decision

## Candidate comparison

| Candidate | Decision |
| --- | --- |
| A. `CommunityRoleQuickActionUseCase` | Recommended as the Application owner for intent-to-result workflow. |
| B. `CommunityMemberRoleMutationAdapter` | Required Infrastructure adapter for cache lookup and add mutation. |
| C. Role Action Service | Rejected; duplicates the Application use-case responsibility. |
| D. `CommunityRoleButtonHandler` | Deferred; dispatcher presentation coupling is a separate boundary. |
| E. Button Dispatch Boundary first | Rejected for now; increases blast radius without reducing role mutation ownership. |
| F. Keep current | Rejected; characterization shows a small independently movable role seam. |

Recommended future API: a plain request such as `{ guildId, memberId, action }`
with a plain result DTO. The use case should call a narrow gateway that resolves
the Discord objects and preserves all current `false`/swallowed-rejection
semantics. No `Guild`, `GuildMember`, `Role`, or interaction object belongs in
Application.
