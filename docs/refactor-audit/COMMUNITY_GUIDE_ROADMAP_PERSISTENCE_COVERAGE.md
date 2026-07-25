# Community Guide/Roadmap Persistence Coverage

| Contract | Fixture / test | Status | Blocker |
| --- | --- | --- | --- |
| path, root, guild, Guide/Roadmap fields | `...SchemaBaseline` | Covered | none |
| native and unknown field preservation, other guilds | `...PreservationBaseline` | Covered | actual runtime regression remains in Guide suite |
| missing/empty/malformed/non-object/read error | `...ReadFailureBaseline` | Covered | permission-specific I/O is modeled only |
| write failure, formatting, retry state | `...WriteFailureBaseline` | Covered | no real disk partial-write behavior |
| sequential Guide then Roadmap writes | `...SequentialWriteBaseline` | Covered | command interaction timing remains Guide baseline |
| stale same-guild snapshots | `...ConcurrentWriteRiskBaseline` | Partial | no production locking behavior exists |
| duplicate publication | duplicate publication contract + mutation baseline | Covered | no repair mechanism |
| first write succeeds / second fails | mutation partial-failure baseline | Covered | shared command coupling |

Every row is characterization only; no persistence implementation is approved.
