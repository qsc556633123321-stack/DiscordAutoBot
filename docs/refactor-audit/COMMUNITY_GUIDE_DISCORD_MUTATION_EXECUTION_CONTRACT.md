# Guide Discord Mutation Execution Contract

`GuidePublicationExecutionRequest` contains only `operation`, `payload`, and
`trackedMessageId`. `GuidePublicationExecutionResult` records `operation`,
`success`, `messageId`, and `failureKind`. Edit expects a legacy Discord
message; Send expects a legacy Discord channel. Persistence, Roadmap, and
interaction are deliberately outside the execution contract.
