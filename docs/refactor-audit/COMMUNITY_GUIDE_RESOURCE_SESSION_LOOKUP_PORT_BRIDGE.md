# Guide Resource Session Lookup Port Bridge

A future infrastructure lookup adapter may close over the current invocation's
session and delegate `lookupTrackedMessage(messageId)`. It maps the opaque
result to the existing pure Lookup Port result. Application passes only scalar
IDs and receives pure data; it never passes a session, channel, or message.
Constructor injection, factory closures, and per-invocation adapters are
candidates. Registries, mutable singletons, and AsyncLocalStorage are rejected.
