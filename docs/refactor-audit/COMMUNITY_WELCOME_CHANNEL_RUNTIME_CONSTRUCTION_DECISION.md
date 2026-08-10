# Community Welcome Channel Runtime Construction Decision

## Decision: Per Invocation

The future Welcome redirect should construct the stateless channel tracking
adapter once inside `sendConciergeWelcome`, construct one validated request,
and call `readTrackedChannel` once. This matches the Guide/Roadmap tracking-read
runtime convention without introducing a singleton, cache, composition feature,
DI parameter, or higher composition root.

The adapter has no mutable state, retained guild value, cache, Discord object,
write, or persistence capability.
