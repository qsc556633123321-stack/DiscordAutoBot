# Community JsonReader Default-Path Runtime Redirect Result

`CommunityOnboardingJsonReaderFactory` now owns the default onboarding data
directory and file path. `setupCommunityGuide`, `setupRoadmapPanel`, and
`sendConciergeWelcome` each construct one default reader per invocation and
continue to construct one StateReader and perform one read through their
existing tracking boundaries.

The redirect changes construction ownership only. The JsonReader, StateReader,
tracking adapters, persistence features, and all Guide, Roadmap, and Welcome
observable behavior remain unchanged. Runtime no longer imports `node:path` or
declares `DATA_DIR` / `ONBOARDING_FILE`.

Validation covers default path identity, dependency overrides, deferred
filesystem I/O, closed-flow construction counts, and the existing closure
regressions.
