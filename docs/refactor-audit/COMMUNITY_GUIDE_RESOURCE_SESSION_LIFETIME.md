# Guide Resource Session Lifetime

The only compatible candidate lifetime is one `setupCommunityGuide` invocation.
Per-guild caches, global singletons, per-message sessions, and composition
singletons risk stale Discord objects, cross-invocation contamination, memory
retention, and behavior drift. References are disposed by becoming unreachable
when the invocation completes; this preparation adds no cleanup API.
