# Community Guide Pair Handoff Fresh Pair Invariant

Each Pair owns a fresh Resource Session. Before its first successful lookup, `getRetainedMessage()` must return `null`, even if another Pair for the same guild, channel, or message id has retained a message.
