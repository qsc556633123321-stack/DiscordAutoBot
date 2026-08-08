# Guide Resource Session Edit Continuity

After successful lookup, the session retains the exact fetched Message. The
future Edit path must call `edit(payload)` on that object. It must not fetch by
message ID, resolve a message, scan history, or add a second lookup. Compatible
Edit has one message fetch per invocation.
