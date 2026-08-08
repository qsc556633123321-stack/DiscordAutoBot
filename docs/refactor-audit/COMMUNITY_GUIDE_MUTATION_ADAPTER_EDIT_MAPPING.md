# Guide Mutation Adapter Edit Mapping

Future `adapter.edit(request)` delegates exactly once to
`session.editTrackedMessage(request.payload)`. Request `guildId`, `channelId`,
and `messageId` are pure context/compatibility fields; the adapter does not use
them to resolve a resource. It performs no lookup or `messages.fetch`.
