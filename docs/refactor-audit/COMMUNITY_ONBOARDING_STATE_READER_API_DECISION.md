# Community Onboarding State Reader API Decision

- Factory: `createCommunityOnboardingStateReader({ filePath, readJson })`
- Method: `readOnboardingState()`
- Result: the raw root object returned by the injected `readJson(filePath, {})`.
- Result handling: no freeze, clone, cache, normalization, logging, or write API.
- Lifetime: per runtime invocation alongside the stateless tracking adapter.
- No Application Port or Composition feature is required.

The reader delegates missing-file creation, malformed JSON, non-object roots,
read errors, and logging to the injected legacy-compatible `readJson` function.
