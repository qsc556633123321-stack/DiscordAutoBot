# Community Roadmap Mutation Send Result Identity

Legacy Send assigns `S = await channel.send(payload)` and runtime keeps exact
`S`. A future `SendSuccess` result must report `messageId: S.id`; the future
session/Pair handoff must retain exact `S`, not reconstruct a message.
