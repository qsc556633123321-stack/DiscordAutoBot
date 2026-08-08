# Guide Runtime Pair Creation Final Readiness

| Candidate | Status |
| --- | --- |
| A. Runtime Pair Creation only | Ready with explicit exclusions. |
| B. Relax Pair Constructor | Rejected. |
| C. Strengthen Ensure Contract | Not needed. |
| D. Runtime Lookup Redirect Preparation | Needs separate preparation. |
| E. Keep Legacy | Available rollback path. |

Candidate A may only create a Pair after successful ensure. It may not call
ports or replace legacy lookup/edit/send/persistence/Roadmap behavior.
