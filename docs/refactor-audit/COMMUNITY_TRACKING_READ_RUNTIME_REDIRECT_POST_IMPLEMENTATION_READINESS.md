# Community Tracking Read Runtime Redirect Post-Implementation Readiness

## Completed Runtime Ownership

Guide and Roadmap now obtain tracked message IDs through the shared Application
request contract and compatibility Adapter. Their runtime no longer reads raw
onboarding records or invokes `fromLegacyPublicationRecord` for tracked message
lookup. Welcome remains the final runtime reader for tracked `guideChannelId`.

## Candidate Assessment

| Candidate | Decision |
| --- | --- |
| A. Guide Closure Re-audit | **Recommended next.** The shared tracked-message dependency has been removed and Guide closure evidence should be reassessed. |
| B. Welcome Channel Read Boundary Preparation | Deferred; it is a separate semantic channel query. |
| C. `readOnboardingData` Cleanup Preparation | Deferred; Welcome still consumes it. |
| D. `saveOnboarding` Cleanup Preparation | Deferred; it is a separate retained-helper cleanup concern. |
| E. Deployment Readiness Preparation | Rejected for now; broader high-risk community flows remain legacy-owned. |
| F. Next Feature Migration | Deferred until Guide closure is re-audited. |

## Current Ownership

- Shared tracking Port: Runtime Active.
- Shared compatibility Adapter: Runtime Active.
- Guide tracked-message read: Migrated.
- Roadmap tracked-message read: Migrated.
- Welcome tracked-channel read: Legacy-owned.
- `readOnboardingData`: retained for Welcome only.
- `saveOnboarding`: retained definition with zero runtime consumers.
