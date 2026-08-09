# Community Roadmap Runtime Mutation Send Result Strategy

## Approved strategy

After `mutationPort.send({ payload })` returns `SendSuccess`, the runtime calls
`getRetainedMessage()` exactly once to recover raw sent Message `S`. It checks
that `S` exists and `S.id === SendSuccess.messageId`, then uses `S` for legacy
persistence and the return result.

`SendSuccess` is an application result, not a Discord Message. Its sole
runtime use is validating the recovered raw identity.

## Failure invariant

If the getter is missing/invalid or its ID mismatches `SendSuccess.messageId`,
the future runtime throws an invariant error before persistence. It must not
retry, send again, fetch again, call a direct-channel fallback, or inspect a
mutation-failure getter after a successful Send.
