# Guide Resource Session Concurrency Analysis

Same-guild setup, different-guild setup, refresh, force, and rebuild may
overlap. Per-invocation sessions isolate references and avoid cross-call state.
The session must not be global, per-guild, per-channel, singleton, registry,
cache, lock, or mutex. Existing legacy concurrency behavior is unchanged.
