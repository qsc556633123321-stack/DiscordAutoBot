# Community Role Presentation Pattern Audit

The closest completed pattern is
`src/modules/community/CommunityNonRoleConciergePresentation.js`: a narrow
Module-owned builder accepts semantic action data and returns `{ embeds,
ephemeral }`; the runtime retains link lookup, `interaction.reply`, `true`, and
the outer error wrapper.

The role presentation follows the same presentation shape, but remains a
separate boundary because it consumes the role workflow's `added` result and
must preserve its peculiar rejection-compatible wording. Discord
`EmbedBuilder` is allowed in the Module presentation layer. Application and
Domain remain Discord-free.

No Application DTO is approved: the output is Discord presentation data, not a
business value. No Presentation code may perform role mutation or resolve a
customId.
