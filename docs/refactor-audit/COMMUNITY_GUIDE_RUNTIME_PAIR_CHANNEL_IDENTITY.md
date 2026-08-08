# Guide Runtime Pair Channel Identity

Pair creation must pass `{ ensuredChannel: channel }`, where `channel` is the
exact object returned by `getOrCreateGuideChannel`. It must not clone, fetch,
resolve, or re-resolve the channel.
