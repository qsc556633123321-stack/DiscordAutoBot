# Community Guide Pre-Plan Message Lookup Port Contract

Future candidate name: `GuidePublicationMessageLookupPort`.

```text
lookup({ guildId, channelId, messageId }) -> LookupResult
```

The future port must not return or accept Discord `Message`, `Channel`, or
`Error` objects. `findTrackedMessage()` is rejected because it leaks lookup
implementation language instead of the branch-decision contract. This document
does not add a production port, adapter, fake, or composition wiring.
