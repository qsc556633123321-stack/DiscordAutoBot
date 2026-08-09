# Roadmap Runtime Lookup Redirect: Approved Future Diff

Only the following runtime change is approved for the next slice:

1. Destructure `lookupPort` and `getRetainedMessage` from the existing Pair.
2. Replace the direct legacy fetch expression with a truthy-ID guarded
   `lookupPort.lookupTrackedMessage({ messageId: roadmapMessageId })` call.
3. Use the application `Available` discriminator to obtain the retained
   message, throwing if it is unexpectedly absent.
4. Map `Unavailable` to `null`.

The diff must not change the legacy edit branch, send branch, persistence call,
return shape, channel ensure path, JSON contract, or failure wording.
