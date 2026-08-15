# Community Role Concierge Presentation Implementation Result

## Ownership after Slice #88

| Responsibility | Owner |
| --- | --- |
| Games payload | `CommunityRoleConciergePresentation` Module |
| Invest payload | `CommunityRoleConciergePresentation` Module |
| Dev payload | `CommunityRoleConciergePresentation` Module |
| Role workflow | existing Application/Infrastructure/Composition boundary |
| `quickLinks` | Concierge runtime |
| `interaction.reply` | Concierge runtime |
| semantic routing and prefix error wrapper | existing migrated resolver/handler |

The builder accepts only `{ action, added, links }` and returns `{ embeds,
ephemeral }`; unknown actions return `null`. It has no Interaction, Guild,
role Gateway, workflow, filesystem, logging, mutation, or customId dependency.

Each runtime role branch preserves its original ordering: role workflow execute,
runtime quick-link resolution, builder call, one awaited reply, then `true`.
The gateway's existing swallowed role-add rejection remains represented as
`added: true`, and therefore retains the existing success presentation.

Night, Bot, and Roadmap continue to use the separate non-role presentation
builder unchanged.
