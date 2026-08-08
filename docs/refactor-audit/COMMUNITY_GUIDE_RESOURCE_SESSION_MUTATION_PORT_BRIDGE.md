# Guide Resource Session Mutation Port Bridge

A future mutation adapter must close over the same invocation session as the
lookup adapter. Edit delegates to the retained Message, so it must not call
`messages.fetch()` again. Send delegates to the ensured Channel, so it must
not re-resolve a channel. This remains a bridge model, not a production adapter.
