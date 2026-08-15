# Community JsonReader Construction and Read Side-Effect Audit

## Construction time
`createCommunityOnboardingJsonReader(...)` validates dependencies and returns a frozen `{ readRoot }` surface. It performs no filesystem calls.

## `readRoot` time
`readRoot(fallback)` ensures the directory and file, reads UTF-8 JSON, returns an object root, and returns the exact fallback identity for non-object and parse/read failures. It logs parse/read failures; mkdir/write initialization failures throw. Every call reads fresh state and has no cache.
