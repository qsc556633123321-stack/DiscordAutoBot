# Community Guide Message Lookup Application Port Pattern Audit

The implementation follows `GuidePublicationMessageMutationPort` and
`communityPublicationRecordRepository` conventions: an `assert...Port` method
verifies the required method, request/result factories return frozen plain
objects, and Application exports are collected through
`src/application/community/index.js`.

`guildId` and `channelId` use the existing non-empty string identity assertion.
`messageId` deliberately does not: it is an opaque legacy scalar so numeric,
object, array, boolean, and whitespace truthy values remain unchanged. The test
fake records calls and returns a configurable FIFO sequence of frozen results.

No port imports Discord, filesystem, legacy systems, infrastructure, or
composition. Validation of a Discord message identity belongs to a future
infrastructure adapter only if a separately approved compatibility contract
allows it; this slice approves no such validation.
