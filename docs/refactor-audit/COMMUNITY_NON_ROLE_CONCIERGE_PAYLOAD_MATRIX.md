# Community Non-role Concierge Payload Matrix

| Action | Embed construction | Payload keys | Dynamic input | Reply contract |
| --- | --- | --- | --- | --- |
| `night` | new `EmbedBuilder`, color `0x2f3136`, title, description, two fields | `embeds`, `ephemeral` | ordered Night quick links; empty links use the existing fallback string | reply once; `ephemeral: true`; return `true` |
| `bot` | new `EmbedBuilder`, color `0x57f287`, static title and multi-line feature description | `embeds`, `ephemeral` | none | reply once; `ephemeral: true`; return `true` |
| `roadmap` | existing `buildRoadmapEmbed()` | `embeds`, `ephemeral` | current roadmap read model and embed timestamp | reply once; `ephemeral: true`; return `true` |

The frozen test candidate emits payload only. It does not invoke `interaction.reply`, catch errors, map `customId`, or mutate roles.
