# Community Guide Pre-Plan Lookup Preparation Blockers

## Baseline

At `b05c1b7`, `setupCommunityGuide()` remains the runtime owner of tracked
Guide-message lookup. It performs the lookup after guide-channel ensure and
before it creates the Guide mutation plan.

## Blocking Semantic Mismatch

The legacy branch is `tracked guideMessageId + non-force -> fetch ->
existingMessageAvailable -> Plan -> Edit/Send`. A post-Plan Edit adapter cannot
recover from a failed fetch: the legacy branch would have selected Send before
the adapter is called.

## Explicit Non-Changes

This preparation adds no production lookup port, infrastructure adapter,
composition feature, runtime redirect, retry, repair, normalization, or
persistence change. `setupCommunityGuide()`, Roadmap, Bootstrap, Rebuild,
Discord writes, and `onboarding-flows.json` remain unchanged.

## Readiness Decision

The next bounded implementation candidate is an **Application Lookup Port plus
test fake**, with no runtime wiring. A production lookup adapter, runtime
redirect, and mutation-adapter implementation remain blocked.
