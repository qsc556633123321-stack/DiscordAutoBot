# Community Publication Persistence Port Semantics

`load` is a consumer-facing state read. `applyPatch` receives one semantic
operation and returns resulting state. Set requires non-empty guild, channel,
and message IDs. Clear removes only selected legacy publication keys while
preserving the other publication, native onboarding, unknown fields, and other
guilds.

There is no transaction, retry, lock, rollback, compensation, or idempotency
token. Atomic multi-operation behavior is not claimed.
