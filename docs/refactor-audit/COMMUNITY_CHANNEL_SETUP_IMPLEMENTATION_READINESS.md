# Community Channel Setup Implementation Readiness

**READY for a narrow Infrastructure compatibility adapter preparation/implementation pair.**

The exact Concierge setup surface, asymmetries, failure behavior, identity, and
persistence handoff are characterized. It is independently migratable only if
the adapter receives the same Guild resource per invocation and does not add
retry, rollback, normalization, persistence, or a generic plan.

Recommended next slice: **Community Channel Setup Boundary Implementation**,
limited to a compatibility adapter plus runtime helper redirect. Do not migrate
V3/bootstrap/game/voice setup in the same slice.
