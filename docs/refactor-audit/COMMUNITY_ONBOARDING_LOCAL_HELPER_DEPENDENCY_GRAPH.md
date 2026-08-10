# Community Onboarding Local Helper Dependency Graph

```text
ensureFile -> readJson -> CommunityOnboardingStateReader construction
                         -> Guide / Roadmap / Welcome tracking queries

readOnboardingData -> no consumers (deletion candidate)
saveOnboarding -> generic persistence feature -> no consumers
Guide/Roadmap persistence -> dedicated publication persistence features
```

`ONBOARDING_FILE`, `readJson`, and `ensureFile` remain active because runtime
constructs `CommunityOnboardingStateReader` per invocation. `writeJson` is not
owned by this local-helper cleanup and is excluded.
