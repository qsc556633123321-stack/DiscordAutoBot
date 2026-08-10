# Community Welcome Channel Runtime Redirect Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Welcome Runtime Redirect Implementation | **Recommended next.** Equivalence covers ID values, cache/fetch/name fallback, payload, DM failure, and one read. |
| B. Composition Implementation | Rejected; per-invocation construction is sufficient. |
| C. `readOnboardingData` Cleanup Preparation | Deferred until Welcome no longer calls it. |
| D. `saveOnboarding` Cleanup Preparation | Deferred; separate zero-consumer helper work. |
| E. Combined Redirect plus Cleanup | Rejected; keeps runtime migration and cleanup separate. |
| F. Keep Legacy | Deferred; the redirect is ready for its own implementation slice. |

Approved future production diff: `src/systems/communityConcierge.js` only,
limited to imports and the tracked-channel read replacement.
