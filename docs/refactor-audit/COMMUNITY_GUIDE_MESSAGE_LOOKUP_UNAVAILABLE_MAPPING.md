# Community Guide Message Lookup Unavailable Mapping

Both a null fetch result and a caught fetch rejection map to
`{ status: MessageUnavailable, messageId: request.messageId }`. Raw Error,
Discord error code, and `failureKind` are not part of the result contract.
