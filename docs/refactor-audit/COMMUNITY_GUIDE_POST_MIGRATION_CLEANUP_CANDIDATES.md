# Community Guide Post-Migration Cleanup Candidates

| Candidate | Classification | Decision |
| --- | --- | --- |
| `saveOnboarding` | Needs Preparation | Zero production runtime consumers, but do not remove during a closure audit. |
| `readOnboardingData` | Still Required | Shared tracked-publication compatibility read for Guide, Roadmap, and welcome paths. |
| Legacy write compatibility helpers | Do Not Remove | No evidence that all non-Guide consumers are absent. |
| Unused Guide imports | Safe-looking | None identified by the final runtime source audit. |
| Test-only migration compatibility | Do Not Remove | Required to preserve regression evidence until a separately approved cleanup plan. |
