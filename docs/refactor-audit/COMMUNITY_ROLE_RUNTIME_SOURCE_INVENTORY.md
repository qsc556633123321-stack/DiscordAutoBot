# Community Role Runtime Source Inventory

## Active entry

`src/legacy/interactions/legacyInteractionRuntime.js` handles every
`concierge_*` button and calls `handleConciergeButton(interaction)` from
`src/systems/communityConcierge.js`. The current button-handler modules do not
match `concierge_*`, so this remains a legacy dispatcher path.

## Role-related functions

| Function | Current owner | Responsibility |
| --- | --- | --- |
| `handleConciergeButton` | Runtime | customId routing, role intent, embed construction, `interaction.reply` |
| `maybeAddRole` | Runtime | permission/hierarchy checks, cache lookup, Discord role add |

## Discord and interaction APIs

- `member.guild.members.me.permissions.has(ManageRoles)`
- `member.guild.roles.cache.find(...)`
- bot highest-role comparison and `role.editable`
- `member.roles.add(role, 'Community concierge quick role')`
- `interaction.reply({ embeds, ephemeral: true })`

No role fetch, configured mapping, role removal, logging, `followUp`,
`editReply`, `update`, or `deferReply` occurs in this role path.
