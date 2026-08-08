# Guide Ensured Channel Return Audit

`getOrCreateGuideChannel` finds a text channel by name or creates a
`GuildText` channel, moves an existing one to the entry category when needed,
sets onboarding-visible overwrites, then returns the local `channel` object.
Successful returns are non-null Discord-like text channels with `id`,
`messages.fetch`, and `send`. Create/move/overwrite failures reject rather
than produce a partial successful return.
