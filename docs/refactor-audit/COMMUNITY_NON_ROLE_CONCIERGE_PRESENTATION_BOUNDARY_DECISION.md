# Community Non-role Concierge Presentation Boundary Decision

Recommended: **Candidate B**, one Presentation Adapter-style builder under `src/modules/community/`, with an API equivalent to `buildCommunityNonRoleConciergePresentationPayload({ action, links, buildRoadmapEmbed })`.

It returns only `{ embeds, ephemeral }`; the runtime retains semantic resolution, `quickLinks` lookup, `interaction.reply`, return `true`, and the modern prefix handler's error wrapper.

| Candidate | Decision |
| --- | --- |
| A: Application use case / DTO | Rejected: it would either leak Discord embed details into Application or force a broad DTO renderer migration. |
| B: one presentation payload builder | Recommended: narrow, preserves existing shared roadmap embed and runtime reply ownership. |
| C: runtime-local builders | Rejected: improves file shape but does not move ownership into a formal boundary. |
| D: three builders | Rejected: premature file split for three closely related payloads. |
| E: Bot-only | Rejected: leaves Night and Roadmap as the same unresolved ownership problem. |
| F: keep runtime | Rejected: characterization proves a small payload-only boundary is feasible. |

The target is one boundary, not action-specific ports. Discord SDK use is appropriate in the Presentation/Module layer, never Application or Domain.
