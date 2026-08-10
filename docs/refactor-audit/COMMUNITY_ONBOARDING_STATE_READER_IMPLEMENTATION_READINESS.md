# Community Onboarding State Reader Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Infrastructure Reader Implementation | **Recommended next.** Add only the reader and its tests. |
| B. Reader plus adapter dependency migration | Deferred; separate from reader creation. |
| C. Reader plus runtime injection redirect | Rejected; runtime must stay unchanged during reader implementation. |
| D. Reader plus `readOnboardingData` deletion | Rejected; adapters must migrate first. |
| E. `saveOnboarding` deletion | Deferred; independent cleanup slice. |
| F. Keep legacy | Deferred; boundary is sufficiently characterized. |

The next production allowlist should contain only
`src/infrastructure/community/CommunityOnboardingStateReader.js` and its
focused tests. No adapter, runtime, persistence, JSON, or Composition changes.
