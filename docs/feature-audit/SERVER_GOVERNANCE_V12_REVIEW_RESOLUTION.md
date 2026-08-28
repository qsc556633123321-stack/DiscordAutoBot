# Server Governance v1.2 Review Resolution

## Scope

v1.2 upgrades the existing administrator-only preview with a read-only review
manifest. It resolves the previous opaque `REVIEW`/`REVIEW_DELETE` output into
resource-level evidence without changing the planner, permission matrix,
execution gateway, or Discord runtime.

## Ownership And Safety

The manifest is Domain-owned and is attached by the Application preview use
case. Presentation renders it. Approval states are model-only: no state is
persisted and no approval is executable. Existing preflight blocking,
runtime/ticket protection, collision handling, unknown-resource safeguards,
and execution-disabled deployment posture remain unchanged.

## Evidence

`test:server-governance-review-resolution` freezes the 132-current/59-desired
production-shaped snapshot and verifies the exact action totals, review reason
and type summaries, recommendation labels, runtime/ticket protection, and
unapproved-review preflight block. Renderer coverage verifies compact details
include parent identity and recommendation.

## Outcome

`SERVER_GOVERNANCE_V12_REVIEW_READY_NOT_DEPLOYED`. The feature is suitable for
human review only. It is not approved for governance execution or deployment.
