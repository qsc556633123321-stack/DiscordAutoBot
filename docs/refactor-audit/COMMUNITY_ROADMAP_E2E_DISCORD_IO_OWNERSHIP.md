# Community Roadmap E2E Discord I/O Ownership

## Classification

- **A. Allowed infrastructure I/O:** `RoadmapPublicationResourceSession` owns `ensuredChannel.messages.fetch`, `retainedMessage.edit`, and `ensuredChannel.send`.
- **B. Forbidden runtime I/O:** `setupRoadmapPanel` has `fetch = 0`, `edit = 0`, and `send = 0` direct Discord calls. It invokes only `lookupPort` and `mutationPort`.
- **C. Other-feature I/O:** Guide and welcome operations in `communityConcierge.js` remain outside the Roadmap closure scope.

The closure guard test parses only `setupRoadmapPanel`, so Port method names cannot be mistaken for direct Discord calls.
