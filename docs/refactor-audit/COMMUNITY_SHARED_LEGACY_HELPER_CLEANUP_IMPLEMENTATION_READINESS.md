# Community Shared Legacy Helper Cleanup Implementation Readiness

- `saveOnboarding` direct deletion: **Ready**, subject to a narrow deletion
  slice preserving generic persistence and existing regression baselines.
- `readOnboardingData` direct deletion: **Not ready**; a replacement reader is
  required for adapter injection.
- Recommended replacement: `CommunityOnboardingStateReader` in Infrastructure,
  returning the raw onboarding root object through `readOnboardingState()`.
- Failure compatibility: missing file, malformed JSON, and read error must
  retain legacy create-or-fallback `{}` behavior; adapters must retain one read.
- Runtime import cleanup: not approved until adapter dependencies use the new
  reader and all three runtime constructions remain equivalent.

Next recommended slice: **Infrastructure Onboarding State Reader Preparation**.
Expected future production scope is the new reader plus the two tracking
adapters; `communityConcierge.js` changes only after that boundary is ready.
