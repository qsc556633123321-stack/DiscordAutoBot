# Community Roadmap Persistence Migration: Readiness

| Candidate | Decision | Reason |
| --- | --- | --- |
| Application request/Port reuse preparation | Approved next | Pure scalar contract can decide reuse safely. |
| New Roadmap repository | Rejected | Duplicates generic publication persistence. |
| Existing writer adapter preparation | Deferred | `ensureFile` and failure ownership need more characterization. |
| Runtime redirect preparation | Deferred | Must preserve ordering and partial success. |
| Direct migration | Not approved | High-risk persistence boundary remains legacy-owned. |

Recommended next slice: prepare a pure Roadmap persistence request contract and
reuse decision for the existing generic publication persistence feature. Do
not wire runtime or alter schema.
