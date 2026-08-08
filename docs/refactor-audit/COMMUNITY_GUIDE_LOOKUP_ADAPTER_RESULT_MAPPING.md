# Guide Lookup Adapter Result Mapping

`{ available: true }` maps to `createMessageAvailable({ messageId })` and
`{ available: false }` maps to `createMessageUnavailable({ messageId })`.
Legacy uses `channel.messages.fetch(id).catch(() => null)`, so a session
rejection must map to `MessageUnavailable` in a future adapter. No failure kind
or new public status is approved.
