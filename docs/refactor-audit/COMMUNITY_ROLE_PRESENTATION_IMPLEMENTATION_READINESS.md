# Community Role Presentation Implementation Readiness

## Decision

**READY: Community Role Presentation Implementation** is the next smallest
slice.

Preparation has characterized all three payloads, actual workflow result use,
quick-link ownership, error propagation, unknown behavior, and runtime ordering.
The candidate equivalence test uses the real runtime with a fake role feature
and compares exact embeds plus reply/return behavior.

## Required implementation guards

- preserve the existing `added` value verbatim, including swallowed mutation
  rejection behavior;
- preserve `quickLinks` patterns, ordering, limit, and empty fallbacks;
- preserve one reply and `true` for each known role action;
- let builder failures reach the existing outer prefix-handler catch unchanged;
- do not modify the non-role builder, resolver, dispatcher, UseCase, Gateway,
  Composition, Guide, Roadmap, Welcome, filesystem, JSON, or persistence.

This preparation slice moves no runtime ownership. Overall local progress stays
at 94%.
