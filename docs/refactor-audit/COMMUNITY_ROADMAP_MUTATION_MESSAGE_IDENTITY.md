# Roadmap Mutation Message Identity

The Edit target is the exact Message retained by the lookup Pair. Although
`await message.edit(payload)` may resolve to another value, runtime state,
persistence ID, and return value continue to use the original retained Message.

The Send path uses the exact value returned by `await channel.send(payload)`
for runtime state, persistence ID, and return value. Neither branch clones or
normalizes the payload or Discord resource.
