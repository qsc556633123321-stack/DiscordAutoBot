# Guide Discord Mutation Port Reassessment

| Candidate | Assessment |
| --- | --- |
| Integrate Execution Request into runtime | Rejected: wraps existing locals and leaves all Discord resource coupling intact. |
| Guide-specific Discord Message Mutation Port | Recommended next preparation: narrow enough to characterize exact Guide edit/send semantics. |
| Generic Discord Message Mutation Port | Rejected: would generalize before Guide-specific inputs/failures are understood. |
| Keep inline execution indefinitely | Acceptable temporary compatibility state, but not the preferred next preparation. |
| Thin legacy helper | Rejected: relocates coupling without creating a usable contract. |

A Guide-specific port must first characterize, not implement, resource identity,
existing-message lookup, send destination, payload reference behavior, generated
message IDs, failure semantics, persistence handoff, and Roadmap coupling.
