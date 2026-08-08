# Community Guide Channel Opaque Handle Analysis

`{ guildId, channelId }` is not sufficient to preserve legacy resource
continuity: an adapter must resolve the channel again. A raw Discord Channel
cannot be disguised as an Application handle without leaking infrastructure.
An infrastructure-only token is possible only with explicit lifetime and
composition ownership, so no handle contract is created now.
