# Community Guide Message Lookup Adapter Dependency Decision

| Candidate dependency | Decision |
| --- | --- |
| Discord client | Rejected now: adds client/channel lookup behavior absent from legacy path |
| Guild resolver | Rejected now: adds guild resolution and failure surface |
| Channel resolver | Needs further characterization |
| Pre-resolved Discord channel | Rejected: leaks Discord object into Application request |
| Multiple callbacks | Rejected: over-abstracts one bounded operation |
| Minimal Discord resource gateway | Future candidate after channel-resource baseline |

No dependency choice is implemented. The unresolved channel-resolution risk
means the next safe slice is additional resource-boundary preparation.
