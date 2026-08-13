# Community Filesystem Dependency Graph

```text
communityConcierge runtime
  -> DATA_DIR / ONBOARDING_FILE
  -> readJson -> ensureFile -> node:fs / node:path
  -> CommunityOnboardingStateReader({ filePath, readJson })
      -> readOnboardingState()
          -> Tracking Message Adapter -> Guide / Roadmap
          -> Tracking Channel Adapter -> Welcome
```

Current construction is per invocation: Guide, Roadmap, and Welcome create a reader once and each reads state once. `CommunityOnboardingStateReader` is dependency-injected and runtime-active.

Future direction:

```text
CommunityOnboardingStateReader -> CommunityOnboardingJsonReader (Infrastructure)
Tracking adapters -> CommunityOnboardingStateReader
Guide / Roadmap / Welcome runtime -> tracking adapters
```

No Application, Domain, Composition, Discord object, or persistence writer is required for this narrow read boundary.
