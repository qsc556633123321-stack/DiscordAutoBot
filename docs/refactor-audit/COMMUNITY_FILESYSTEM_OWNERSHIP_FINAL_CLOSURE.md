# Community Filesystem Ownership Final Closure

Status: **MIGRATED**

The Community runtime no longer owns onboarding filesystem paths or direct
JsonReader construction. The default path and reader construction now belong to
`src/infrastructure/community/CommunityOnboardingJsonReaderFactory.js`.

Final runtime counts:

- Direct `node:fs` / `node:path` ownership: 0
- Runtime onboarding path constants: 0
- Explicit JsonReader path construction: 0
- Default JsonReader factory construction: 3 (Guide, Roadmap, Welcome)
- Explicit publication persistence paths: 0
- Zero-argument publication persistence construction: 2 (Guide, Roadmap)

The existing JsonReader remains responsible for directory/file creation,
parsing, fallback identity, error logging, and fresh reads. No stored JSON
schema or Discord-facing behavior changed.
