# Community Roadmap E2E Runtime Closure

`setupRoadmapPanel(guild)` is closed as a Roadmap runtime boundary:

- It ensures the channel, creates one Composition Pair, reads publication state, then delegates lookup and mutation through Ports.
- A truthy tracked ID makes one lookup; falsy IDs make zero lookup calls. Lookup rejection is swallowed by the Session and selects Send.
- Available lookup results use the exact retained Message for Edit. Unavailable results use Send and recover the exact retained sent Message without a post-send fetch.
- After exactly one successful mutation, runtime creates a semantic persistence request and calls the Roadmap persistence feature once.
- Writer failures retain the legacy partial-success behavior: the successful Message is returned, with no retry and no rollback. Invariant failures retain exact thrown value identity, including `undefined` where supplied by the test double.

The closure suite verifies happy paths, failure paths, raw Message identity, same Session continuity, schema preservation, and source ownership guards.
