# Community Guide Message Lookup Success Mapping

A truthy Discord message is contained within infrastructure and maps to
`{ status: MessageAvailable, messageId: request.messageId }`. The tracked
opaque request ID is preserved; returned `message.id` is not substituted. No
Discord message object crosses into Application.
