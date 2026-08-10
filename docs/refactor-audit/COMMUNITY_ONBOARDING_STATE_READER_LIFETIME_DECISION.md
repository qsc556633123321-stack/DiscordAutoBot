# Community Onboarding State Reader Lifetime Decision

Use **per invocation** construction. Each Guide, Roadmap, or Welcome path will
construct a stateless reader with its current `ONBOARDING_FILE` and compatible
`readJson` dependency, then construct the existing tracking adapter. This keeps
the existing one-query/one-read lifecycle and avoids module-level caching,
singleton state, Composition, or a higher runtime root.
