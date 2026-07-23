# Community Roadmap Baseline

## Original active contract

| Contract | Baseline |
| --- | --- |
| Legacy command | `src/legacy/commands/community-roadmap.js` |
| Source helper | `src/systems/communityConcierge.js#buildRoadmapEmbed()` |
| Deploy payload | `{"options":[],"name":"community-roadmap","description":"查看社群未來規劃與開發方向","type":1}` |
| Options / permissions / guild-only | No options, no default permissions, no explicit guild-only guard. |
| Reply | One immediate `interaction.reply({ embeds, ephemeral: true })`; no defer or edit reply. |
| Embed | Color `0xf2c94c`; title `🚧 社群開發日誌`; fixed description; three non-inline fields in completed, in-progress, future order; fixed footer; timestamp; no author or thumbnail. |
| Empty arrays | Each field remains and renders `整理中`. |
| Read fallback | Missing or parse-invalid JSON renders the existing default roadmap. Non-object JSON also falls back. |
| Malformed object | The old renderer throws when a required section is not an array; no custom command error reply. |
| Logging | Parse failures log through the existing Concierge JSON reader. |

## Data schema

The production source is `src/data/community-roadmap.json` and contains exactly three ordered arrays: `completed`, `inProgress`, and `future`. Item order is source order. There is no ID, progress, guild-specific data, Dashboard reader, cache, writer, database, or environment dependency in the `/community-roadmap` read path.

## Timestamp contract

Timestamp is a Presentation concern. Tests compare static embed payloads independently and require each rendered timestamp to be ISO formatted; they do not compare two runtime clock values directly.
