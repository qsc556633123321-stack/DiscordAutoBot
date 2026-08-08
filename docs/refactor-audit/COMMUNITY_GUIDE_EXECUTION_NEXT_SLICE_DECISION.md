# Guide Execution Next Slice Decision

## Candidates

| Candidate | Decision |
| --- | --- |
| A. Integrate Execution Request into runtime | Rejected |
| B. Keep Request prepared; prepare Guide-specific Discord Mutation Port | Recommended |
| C. Keep inline Discord execution | Current compatibility state |
| D. Prepare a generic Discord Message Port | Rejected |
| E. Stop Guide Discord migration | Rejected for now |

## Rationale

Candidate B adds no runtime diff yet and can characterize the missing resource
identity/lookup/destination contract before any migration. Candidate A adds an
extra layer but does not reduce coupling. Candidate D broadens an unproven
boundary. The next approved work is **Guide-specific Discord Mutation Port
Preparation**, not an Execution Request runtime redirect.
