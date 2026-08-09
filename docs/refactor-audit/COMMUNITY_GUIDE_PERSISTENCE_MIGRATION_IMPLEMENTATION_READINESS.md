# Community Guide Persistence Migration Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Guide Persistence Request Preparation | Complete in this slice as a test-only candidate. |
| B. Guide Persistence Request Implementation | **Recommended next slice.** Add only pure Application request/mapper with matching tests. |
| C. Guide Reuse Feature Preparation | Deferred until the request implementation exists. |
| D. Guide Runtime Persistence Redirect Preparation | Deferred; must follow request and reuse-feature work. |
| E. Direct Guide Runtime Redirect | Rejected; skips the required boundary work. |
| F. Keep Legacy | Not preferred; behavior is sufficiently characterized. |

No schema change, duplicate writer, Guide repository, or Guide-specific persistence Port is required. Runtime remains legacy-owned until a later explicitly approved redirect.
