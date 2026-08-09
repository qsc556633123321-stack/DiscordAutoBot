# Community Roadmap Resource Session Mutation Implementation Blockers

`RoadmapPublicationResourceSession` now owns only the per-invocation resource
semantics required for a future mutation adapter: retained message identity,
single Edit/Send calls, and a presence-aware retained mutation failure.

This slice does not add a Roadmap mutation adapter, expose a mutation port from
the Adapter Pair, change composition, redirect runtime mutation, or move
persistence sequencing. Those responsibilities remain deliberately blocked
from this implementation.

The next approved boundary is Roadmap Mutation Adapter preparation. It must map
the existing Application mutation port to this Session without exposing raw
Discord Message objects or changing the legacy runtime's Edit/Send/persistence
ordering.
