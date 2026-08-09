# Community Roadmap Mutation Adapter Failure Handoff Necessity

The Roadmap Application Mutation Port contains only `EditSuccess` and
`SendSuccess`. It must not gain a failure variant in this preparation slice.

A future adapter therefore propagates the exact rejection from the Resource
Session, including strings, primitives, objects, `null`, and `undefined`. The
Session's `getRetainedMutationFailure()` remains session-owned diagnostic state;
the candidate validates that capability exists but does not call it.
