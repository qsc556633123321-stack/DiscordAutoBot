# Community Filesystem Ownership Implementation Readiness

## Recommended Next Slice

**Candidate A: Filesystem Boundary Implementation**. Add only `CommunityOnboardingJsonReader` in Infrastructure with exact characterized behavior and no runtime wiring.

| Candidate | Result |
| --- | --- |
| A: Filesystem Boundary Implementation | Approved next: small, testable, no runtime ownership movement. |
| B: Reader Dependency Migration Preparation | Required after A. |
| C: Atomic Reader + Runtime Migration | Not yet: follow B and cover Guide/Roadmap/Welcome together. |
| D: Runtime Composition Extraction | Not required; adds an unnecessary layer. |
| E: Repository Implementation | Rejected; couples read migration to persistence. |
| F: Keep Current | Not recommended beyond staged migration. |

Future Candidate A allowlist: `src/infrastructure/community/CommunityOnboardingJsonReader.js` and focused tests only. Runtime, tracking adapters, persistence, JSON data, roles, buttons, and AI remain unchanged.

Progress remains **85%**: no production ownership moved. Guide, Roadmap, and Welcome remain closed and must retain one state read each.
