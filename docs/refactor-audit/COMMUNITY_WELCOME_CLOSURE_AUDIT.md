# Community Welcome Closure Audit

## Status: NOT CLOSED

The channel tracking read is migrated and reader-backed. Remaining Runtime-owned
responsibilities are guide channel cache/fetch recovery, fallback name lookup,
welcome request construction, payload invocation, member DM delivery, and
swallowed DM failure. `guildMemberAdd` remains the active event caller.

The next Welcome slice should not be selected automatically: it must first
characterize the channel-resolution and DM failure contract as one bounded flow.
