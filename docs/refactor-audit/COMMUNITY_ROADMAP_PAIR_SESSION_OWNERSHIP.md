# Community Roadmap Pair Session Ownership

Each future `RoadmapPublicationAdapterPair` creates one fresh
`RoadmapPublicationResourceSession` from the exact `ensuredChannel` input.
The pair then creates one Lookup Adapter using that exact Session.

The Session is private. The pair does not expose the Session, the channel, or
the Session lookup method. `getRetainedMessage()` is the only retained-message
handoff and delegates directly to the private Session without fetching,
cloning, normalizing, or clearing state.

Pairs are intentionally isolated even when they receive the same channel and
message identifier. There is no session cache, singleton, or cross-invocation
retained-message sharing.
