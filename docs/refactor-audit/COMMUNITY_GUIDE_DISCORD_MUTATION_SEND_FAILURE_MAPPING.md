# Guide Discord Mutation Send Failure Mapping

Candidate adapter vocabulary: `ChannelLookupFailed`, `MissingResource`,
`SendRejected`, and `Unknown`.

Legacy channel ensure failures occur before publication and propagate. Legacy
`channel.send(payload)` rejection also propagates and prevents Guide
persistence. A missing generated message ID has no defined legacy recovery.
The future adapter must not add retry, fallback destination, or recovery.
