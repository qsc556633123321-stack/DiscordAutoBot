# Community Publication Channel Lookup Runtime Integration Readiness

| Candidate | Status | Reason |
| --- | --- | --- |
| Guide identity mapping only | Needs more preparation | existing domain/mapper is unused by the active consumer; behavior includes fallback semantics. |
| Guide lookup wrapper | Blocked | would introduce runtime wiring and alter ownership without an approved port/adapter. |
| Guide lookup port / adapter | Rejected | explicitly prohibited in this characterization slice. |
| Guide lookup + publish | Rejected | DM side effect is coupled to lookup and failure swallowing. |
| Roadmap identity read | Rejected | no active lookup consumer. |
| No runtime integration | Ready | preserves the frozen consumer while evidence is collected. |

**Decision: No Channel Lookup Runtime Integration Slice Approved.** Future work must separately approve an adapter/port boundary, preserve cache/fetch/name-fallback behavior, and include a member-DM compatibility contract.
