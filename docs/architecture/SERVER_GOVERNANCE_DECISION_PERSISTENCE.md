# Server Governance Decision Persistence

`GovernanceReviewDecisionStore` is an Application port. The production
adapter, `jsonGovernanceReviewDecisionStore`, uses the approved atomic JSON
store and persists records under `src/data/server-governance-review-decisions.json`
only when an administrator records or resets a review decision.

Each record includes `guildId`, `resourceId`, `resourceFingerprint`,
`resourceNameAtDecision`, `parentIdAtDecision`, `decision`, optional
`canonicalTargetKey`, `reasonAtDecision`, `decidedBy`, `decidedAt`, and
`schemaVersion: 1`. The root is guild-isolated. Every save/reset appends a
local audit record with guild/resource, old/new decision, actor, and timestamp.

This persistence is not Discord state and has no channel, role, category,
message, overwrite, archive, or execution side effect.
