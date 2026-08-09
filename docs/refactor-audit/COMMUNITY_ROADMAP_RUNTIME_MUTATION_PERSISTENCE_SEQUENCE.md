# Community Roadmap Runtime Mutation Persistence Sequence

| Branch | Discord mutation | Persistence | Result |
| --- | --- | --- | --- |
| Lookup available | Edit M | Save M ID | Return M; write failure is swallowed |
| Lookup unavailable | Send S | Save S ID | Return S; write failure is swallowed |
| Edit rejects | Reject raw failure | None | Reject |
| Send rejects | Reject raw failure | None | Reject |

Persistence remains legacy-runtime-owned in this slice.
