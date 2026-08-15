# Community Non-role Concierge Presentation Inventory

Base: `ac7e357`. Production source is unchanged in this preparation slice.

| Action | Current owner | Dependencies | Runtime effect | Return |
| --- | --- | --- | --- | --- |
| `night` | `handleConciergeButton` | `interaction.guild`, `quickLinks(guild, 'night')`, `EmbedBuilder` | one `await interaction.reply(payload)` | `true` |
| `bot` | `handleConciergeButton` | `EmbedBuilder` only | one `await interaction.reply(payload)` | `true` |
| `roadmap` | `handleConciergeButton` | `buildRoadmapEmbed()` | one `await interaction.reply(payload)` | `true` |

The semantic resolver, prefix dispatcher, role workflow, Guide, Roadmap publication, Welcome, and filesystem boundaries are out of scope. Unknown semantic actions still return `false` from the runtime handler.
