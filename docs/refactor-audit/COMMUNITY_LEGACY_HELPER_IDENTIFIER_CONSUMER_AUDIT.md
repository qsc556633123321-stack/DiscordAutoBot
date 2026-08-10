# Community Legacy Helper Identifier Consumer Audit

| Helper | Definition | Direct runtime invocation | Runtime injection | Export | Alias | Production identifier references | Status |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `readOnboardingData` | 1 | 0 | 3 | 0 | 0 | 4 | Retained compatibility dependency |
| `saveOnboarding` | 1 | 0 | 0 | 0 | 0 | 1 | Direct deletion candidate |

The three `readOnboardingData` references are per-invocation dependency
injections in `setupCommunityGuide`, `setupRoadmapPanel`, and
`sendConciergeWelcome`. They are not direct business reads, but the adapters
still call the injected function once each. Tests and historical documents may
mention these helpers; those references do not establish runtime ownership.
