# Community Publication Channel Lookup Characterization Coverage

| Coverage | Evidence | Status |
| --- | --- | --- |
| Search, consumer inventory, call graph, target selection | audit documents | Covered |
| Missing/valid/malformed identity; cache hit/miss; fetch success/failure | frozen CL-F01-F17 fixture and baseline/failure tests | Covered |
| Non-text channel; DM success/failure; missing permission | CL-F18-F21 and tests | Covered |
| Unknown, Roadmap, Native Onboarding, other guild preservation | CL-F22-F25; zero-write assertions | Covered as read-only |
| Malformed records and repeated invocation | CL-F26-F28 and tests | Covered |
| Bootstrap/Rebuild indirect relationship | CL-F29-F30 and source inventory | Partial: no direct invocation exists |
| Persistence success/failure | zero-write observable contract | Not Applicable to target |
| Call count, coupling, architecture boundary, diff guard, readiness | focused tests and documents | Covered |
