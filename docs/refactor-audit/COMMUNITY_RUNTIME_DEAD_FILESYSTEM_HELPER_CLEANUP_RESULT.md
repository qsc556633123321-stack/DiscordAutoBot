# Community Runtime Dead Filesystem Helper Cleanup Result

- Removed `ensureFile` from `src/systems/communityConcierge.js`.
- Removed `readJson` from the same runtime module.
- Removed its now-unused `node:fs` import.
- Retained `node:path`, `DATA_DIR`, and `ONBOARDING_FILE`.

The retained constants still feed three `CommunityOnboardingJsonReader`
constructions and two Guide/Roadmap publication persistence feature
constructions. JsonReader, StateReader, tracking adapters, and persistence
sources were not modified.

Filesystem ownership is partially migrated: runtime direct filesystem helper
ownership is gone, but runtime path ownership remains active.
