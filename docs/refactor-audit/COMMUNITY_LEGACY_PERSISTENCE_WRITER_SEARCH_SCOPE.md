# Community Legacy Persistence Writer Search Scope

Searched production and executable code under `src`, `apps/api`, `scripts`,
legacy commands, system runtimes, bootstrap/rebuild paths, and compatibility
wrappers. Terms included `onboarding-flows`, Guide/Roadmap IDs, fs reads/writes,
JSON parse/stringify, save/persist/update/merge, native onboarding, guild IDs,
and require-cache patterns.

Result: the only confirmed writer to `src/data/onboarding-flows.json` is
`src/systems/communityConcierge.js`: `saveOnboarding()` calls
`readOnboardingData()`, shallow-merges one guild record, adds `updatedAt`, then
uses `writeJson()` for a synchronous full-root write. Guide and Roadmap are
consumers of this same writer. Bootstrap and V3 are indirect consumers because
they call `setupCommunityGuide()`. No separate native-onboarding, dashboard,
scheduled-job, migration, or script-only writer to this target was found.
