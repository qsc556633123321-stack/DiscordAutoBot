# Community Roadmap Runtime Mutation Edit Retained Strategy

## Approved strategy

After a future `mutationPort.edit({ messageId: message.id, payload })` resolves,
the runtime keeps its existing local exact raw message `M`. It does not assign
the port result and does not call `getRetainedMessage()` again.

This preserves the frozen legacy contract: `M.edit(payload)` may resolve to an
unrelated value `E`, but persistence and the returned result still use exact
`M`. The mutation adapter already validates that its retained message matches
the requested `messageId`.

## Rejected alternatives

- Reassigning from the getter would introduce unnecessary Session coupling.
- Treating `EditSuccess` as a Discord message would lose raw identity.
- Adding a fetch, retry, or direct-edit fallback would add Discord I/O and
  change failure behavior.
