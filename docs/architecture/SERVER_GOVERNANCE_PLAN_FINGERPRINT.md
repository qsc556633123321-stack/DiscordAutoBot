# Server Governance Plan Fingerprints

The compiler uses stable sorted JSON fingerprints for mutation-relevant
inventory, canonical desired state, and logical review decisions. The plan
fingerprint combines those three fingerprints with normalized operations.

The pure verifier returns `VALID` only when all three inputs still match. It
returns `PLAN_STALE` after inventory drift, `PLAN_OBSOLETE` after desired-state
drift, and `PLAN_DECISIONS_CHANGED` after a review decision changes. A future
execution confirmation must be bound to the exact `planFingerprint`.
