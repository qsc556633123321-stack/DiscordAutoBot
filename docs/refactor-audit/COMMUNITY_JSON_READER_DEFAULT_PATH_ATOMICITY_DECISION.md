# Community JsonReader Default Path Atomicity Decision

## Recommended sequencing: Candidate C
Use one narrow implementation slice to add the Infrastructure default factory, redirect the three Guide/Roadmap/Welcome reader constructions, then remove `node:path`, `DATA_DIR`, and `ONBOARDING_FILE` from `communityConcierge.js`.

The candidate preserves path identity and behavior for all three flows. Splitting support from redirect would add a temporary unused factory without lowering risk.

Exact future production allowlist:

```text
src/infrastructure/community/CommunityOnboardingJsonReaderFactory.js
src/systems/communityConcierge.js
```
