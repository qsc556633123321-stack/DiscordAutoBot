# Guide Runtime Pair Legacy Lookup Coexistence

Pair creation alone leaves the legacy
`channel.messages.fetch(guideMessageId).catch(() => null)` path unchanged.
`lookupPort.lookup()` is not called, so the new Pair Session has no retained
message in this candidate.
