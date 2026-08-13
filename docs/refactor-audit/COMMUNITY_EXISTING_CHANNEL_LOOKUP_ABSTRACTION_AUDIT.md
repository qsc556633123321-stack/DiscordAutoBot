# Existing Channel Lookup Abstraction Audit

## Result: Partial reuse only

`src/infrastructure/community/discordGuildChannelReader.js` supports
`listTextChannels(guildId)` for Help Me Start. It resolves a Guild and returns a
mapped channel list. It does not support tracked-ID cache lookup, fetch fallback,
raw malformed IDs, rejection swallowing, exact Discord channel identity, or name
fallback branching.

Guide/Roadmap lookup abstractions are message-specific. They cannot resolve a
Welcome guide channel. No existing abstraction can be reused without changing
the Welcome contract or widening an unrelated feature.
