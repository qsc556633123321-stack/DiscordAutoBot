# Guide Lookup Adapter No Channel Resolution

`guildId` and `channelId` remain request context only. The adapter must not
resolve or verify guild/channel identity, use a client/cache, or fetch another
channel because the session already owns the exact ensured channel.
