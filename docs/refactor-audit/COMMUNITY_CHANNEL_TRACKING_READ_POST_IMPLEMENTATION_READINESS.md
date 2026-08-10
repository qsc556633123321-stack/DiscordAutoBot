# Community Channel Tracking Read Post-Implementation Readiness

The shared Channel Tracking Read Port and compatibility Adapter are implemented
and intentionally not runtime-used. They preserve the direct legacy
`guideChannelId` expression with one compatibility read and do not own Discord
lookup, welcome delivery, persistence, or writes.

| Candidate | Decision |
| --- | --- |
| A. Welcome Runtime Redirect Preparation | **Ready and recommended next.** |
| B. Welcome Runtime Redirect Implementation | Deferred until redirect ordering/failure preparation. |
| C. Composition Feature Preparation | Rejected; no composition is needed. |
| D. `readOnboardingData` Cleanup Preparation | Deferred; Welcome still owns the runtime call. |
| E. `saveOnboarding` Cleanup Preparation | Deferred; separate zero-consumer helper work. |
| F. Keep Legacy | Deferred while the runtime redirect preparation is ready. |
