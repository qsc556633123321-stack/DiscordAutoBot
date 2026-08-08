# Guide-specific Discord Mutation Port Failure Contract

## Characterized Legacy Behavior

| Condition | Current behavior |
| --- | --- |
| tracked message fetch rejects | caught to `null`; Plan selects Send |
| tracked message fetch returns no message | Plan selects Send |
| malformed truthy tracked ID | still fetched; failure is caught to `null`; Plan selects Send |
| edit rejects | error propagates; no Guide persistence call follows |
| send rejects | error propagates; no Guide persistence call follows |
| missing channel | channel ensure occurs earlier; failure propagates before publication |
| unknown Discord failure | no normalization/retry; error propagates |

## Candidate Port Semantics

A future port may return a typed `Failure` for `MessageLookupFailed`,
`ChannelLookupFailed`, `EditRejected`, `SendRejected`, `MissingResource`, or
`Unknown`. This is a proposed adapter-facing vocabulary only. It must not alter
the observable legacy behavior until a runtime integration slice characterizes
the mapping from each failure result to current thrown/caught behavior.
