# Community Concierge Presentation Shared Boundary Decision

There are two deliberately separate presentation builders:

1. completed non-role builder for `night`, `bot`, and `roadmap`;
2. prepared role builder for `games`, `invest`, and `dev`.

They share the payload-only Module pattern but are not merged. Non-role Roadmap
depends on a shared roadmap embed builder, while role actions consume `added`
and preserve role-specific conditional wording. A combined builder would add
branching without reducing an active dependency or a repeated rule.

Runtime retains all Dynamic Discord concerns: semantic dispatch invocation,
role-workflow execution, `quickLinks`, interaction replies, return values, and
the error wrapper.
