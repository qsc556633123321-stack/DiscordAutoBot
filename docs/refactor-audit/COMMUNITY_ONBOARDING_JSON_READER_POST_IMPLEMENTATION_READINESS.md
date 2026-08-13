# Community Onboarding JSON Reader Post-Implementation Readiness

`CommunityOnboardingJsonReader` is implemented as a read-only Infrastructure boundary and is deliberately not runtime-used.

| Candidate | Result |
| --- | --- |
| A: StateReader Dependency Migration Preparation | Recommended next. Freeze the changed `CommunityOnboardingStateReader` contract and its three construction sites. |
| B: StateReader + Runtime Atomic Migration | Not ready until A is complete. |
| C: Runtime Filesystem Cleanup | Not ready; ownership remains in runtime. |
| D: Composition Extraction | Rejected; no composition is required. |
| E: Repository | Rejected; read ownership must remain separate from persistence. |
| F: Keep Current | Not recommended after the safe next preparation. |

The following atomic future change is approved only after preparation: StateReader consumes `onboardingJsonReader`, while Guide, Roadmap, and Welcome construct the JSON reader and StateReader together. No dual-mode StateReader is approved.
