# Community Legacy Persistence Writer Inventory

| Writer | Exact source/function | Trigger/caller | Status | Target and scope | Read/merge/write | Risks |
| --- | --- | --- | --- | --- | --- | --- |
| W01 Guide publication | `src/systems/communityConcierge.js` / `setupCommunityGuide` -> `saveOnboarding` | `setup-community-guide`, refresh command | Active Runtime | onboarding-flows root / one guild | sync full-root read, shallow guild patch, full-root write | message send/edit can precede write; stale root loses updates |
| W02 Roadmap publication | same file / `setupRoadmapPanel` -> `saveOnboarding` | setup/refresh command | Active Runtime | same | same | same; writes Roadmap IDs |
| W03 Native onboarding recommendation patch | same file / `setupCommunityGuide` -> `saveOnboarding` | Guide setup/refresh | Active Runtime | same | same | owns recommendation/excluded-channel fields in same record |
| W04 Bootstrap indirect Guide patch | `src/legacy/community/communityBootstrapSystem.js` / bootstrap call | bootstrap command flow | Indirect Active Runtime | same via W01 | delegates to W01 | inherits W01 ordering and stale-read risk |
| W05 V3 indirect Guide patch | `src/legacy/systemRuntimes/communityV3BuilderRuntime.js` / rebuild call | rebuild-community-v3 flow | Indirect Active Runtime | same via W01 | delegates to W01; errors captured in summary | inherits W01 risk |

No confirmed compatibility-only, script-only, test-only, dead, or unknown
writer targets `onboarding-flows.json`. `sendConciergeWelcome` is a reader,
not a writer. All confirmed writers are synchronous at the filesystem boundary;
their surrounding Discord workflows are asynchronous.
