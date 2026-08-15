# Community Button Dispatch Implementation Readiness

Status: READY for a narrow semantic-resolver implementation preparation.

Frozen facts: one legacy prefix owner, exact `startsWith('concierge_')`
semantics, ignored handler return, generic error payload, reply/defer guard,
and role workflow isolation. The first implementation must preserve all of
these facts and must not redirect the legacy prefix branch.

Recommended next slice: **Community Concierge Semantic Button Resolver
Implementation Preparation**. It should characterize only exact-ID to semantic
action mapping and leave interaction handling, non-role presentation, and the
legacy catch wrapper untouched.
