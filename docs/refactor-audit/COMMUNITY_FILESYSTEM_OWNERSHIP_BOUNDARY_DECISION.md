# Community Filesystem Ownership Boundary Decision

## Decision

Recommend **Candidate B**: a read-only Infrastructure component named `CommunityOnboardingJsonReader`, created by `createCommunityOnboardingJsonReader`.

It will receive `filePath`, `dataDirectory`, `filesystem`, `pathModule`, and `logger`; its responsibility is `readRoot(fallback = {})` with the frozen behavior in the read matrix.

| Candidate | Result |
| --- | --- |
| A: expand `CommunityOnboardingStateReader` | Rejected: it would own path and filesystem details. |
| B: narrow onboarding JSON reader | Recommended: exact, read-only Infrastructure ownership. |
| C: generic JSON state reader | Rejected: premature generalization. |
| D: repository | Rejected: implies persistence ownership beyond this read boundary. |
| E: runtime construction helper | Rejected: leaves filesystem ownership in runtime. |
| F: keep current | Deferred only until Candidate B implementation. |

No Application or Domain object is needed. The component must expose no Discord object, cache, raw persistence API, or write method.
