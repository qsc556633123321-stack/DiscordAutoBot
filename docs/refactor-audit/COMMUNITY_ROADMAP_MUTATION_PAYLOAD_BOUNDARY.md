# Community Roadmap Mutation Payload Boundary

Current runtime passes `{ embeds: [buildRoadmapEmbed()] }` directly to Discord.
For a future Roadmap Mutation Port, `payload` is an opaque Application input:
the contract must not import Discord.js, embed builders, channels, messages, or
filesystem code. Payload ownership and validation are deferred; this slice
does not introduce a production Port.
