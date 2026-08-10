# Community Tracking Adapter Runtime Construction Audit

`setupCommunityGuide` constructs one message tracking adapter per invocation
with `readOnboardingData`, then issues one guide query. `setupRoadmapPanel`
does the same for one roadmap query. `sendConciergeWelcome` constructs one
channel tracking adapter per invocation and issues one guide-channel query.

All three constructions are per invocation. The compatibility reader can be
constructed at the same call sites in a future atomic redirect with the existing
`ONBOARDING_FILE` and `readJson` dependencies. This remains runtime-owned
filesystem construction; this preparation adds no Composition feature.
