# Guide-specific Discord Message Mutation Port Contract

This is a **test/documentation-only candidate contract**, not a production
interface and not a runtime dependency.

## Candidate

`GuidePublicationMessageMutationPort`

```text
edit({ guildId, channelId, messageId, payload }) -> EditSuccess | Failure
send({ guildId, channelId, payload }) -> SendSuccess | Failure
```

## Why Separate Methods

Separate `edit` and `send` methods make required resource identity explicit.
They avoid a discriminated `execute(request)` input that can contain invalid
states such as a Send request with a message ID or an Edit request without one.
The operation is therefore represented by method selection, not duplicated as
an independently trusted field.

## Boundary Exclusions

The candidate port does not receive or return Discord.js objects, persistence
outcomes, Roadmap outcomes, interaction replies, retries, rollback data, raw
Discord errors, or transaction state.

## Existing Execution Request

`GuidePublicationExecutionRequest` remains Prepared / Not Integrated. It is a
branch-execution descriptor, not the future port request, because it lacks
`guildId` and `channelId` and carries the legacy tracked ID rather than a
complete resource contract.
