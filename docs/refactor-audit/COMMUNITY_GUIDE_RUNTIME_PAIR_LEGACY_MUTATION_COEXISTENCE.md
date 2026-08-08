# Guide Runtime Pair Legacy Mutation Coexistence

Pair creation alone leaves legacy `message.edit(payload)` and
`channel.send(payload)` unchanged. Mutation ports are not called.
