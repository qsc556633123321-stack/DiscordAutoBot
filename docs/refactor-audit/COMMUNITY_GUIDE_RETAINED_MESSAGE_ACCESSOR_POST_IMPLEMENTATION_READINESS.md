# Retained Message Accessor Post-Implementation Readiness

| Candidate | Status |
| --- | --- |
| Pair exposes narrow retained-message handoff capability | Ready with explicit exclusions |
| Lookup Adapter exposes infrastructure-only handoff | Needs boundary design |
| Composition exposes handoff | Needs boundary design |
| Runtime directly owns Session | Rejected |
| Runtime lookup redirect | Blocked pending visibility decision |
| Mutation redirect | Rejected for this slice |
| Keep legacy runtime lookup | Active safe baseline |

Recommended next slice: **Pair Retained Message Handoff Capability Preparation**, without runtime redirect.
