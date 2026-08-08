# Lookup Message Identity Handoff Implementation Readiness

| Candidate | Status |
| --- | --- |
| A: Session retained-message accessor, not runtime wired | Ready with explicit exclusions |
| B: Runtime-local raw Message seam | Needs candidate-A contract first |
| C: Pair resource capability | Needs more preparation |
| D: mutation redirect | Rejected for this boundary |
| E: combined lookup/mutation redirect | Blocked |
| F: keep legacy lookup | Active safe baseline |

Recommended next slice: implement only the Infrastructure Session retained-message accessor with no runtime wiring, no Application change, and zero extra I/O.
