# Community Guide Message Lookup Guild ID Semantics

`guildId` is Application identity, not authorization for a new guild lookup.
Legacy obtains the channel from `getOrCreateGuideChannel(guild)` and calls
`channel.messages.fetch(messageId)` directly. Resolving guild then channel from
scalar IDs would add calls and guild/channel consistency behavior not present in
the legacy path. No guild resolver is approved.
