# Community Guide Lookup Port Result Contract

`GuidePublicationMessageLookupPort.lookup(request)` receives an immutable request containing `guildId`, `channelId`, and `messageId`. The production adapter calls the session exactly once and returns only:

- `MessageAvailable` with the original `messageId`; or
- `MessageUnavailable` with the original `messageId`.

It catches every session rejection and maps it to `MessageUnavailable`. There is no public `Failure` result variant and no `Message` field. The Session internally retains the exact fetched Message for its mutation API, but exposes no public retained-message accessor. This distinction is a blocker for a runtime redirect that must continue using legacy `message.edit(payload)`.
