# Guide Mutation Adapter Edit Success Mapping

The frozen candidate maps a successful edit to `EditSuccess` using
`request.messageId`. Legacy persistence keeps the existing tracked identity;
the runtime ignores the value returned by `message.edit(payload)`. A returned
Discord Message is therefore not exposed or used to replace the tracked ID.
