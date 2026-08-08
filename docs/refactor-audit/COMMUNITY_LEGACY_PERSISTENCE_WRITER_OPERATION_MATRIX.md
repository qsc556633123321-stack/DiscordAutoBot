# Community Legacy Persistence Writer Operation Matrix

| Operation | Writer | Scope | Failure/overlap result | Baseline |
| --- | --- | --- | --- | --- |
| O01 read complete root | filesystem adapter | full root | fallback on read/parse failure | whole-root |
| O02 shallow patch guild record | filesystem adapter | one guild record | preserves current snapshot fields only | Guide/Roadmap, native |
| O03 write complete root | filesystem adapter | all guilds | stale snapshot is last-write-wins | whole-root, different-guild |
| O04 set Guide IDs | W01 | Guide fields | Roadmap/native update may be lost on stale write | Guide/Roadmap |
| O05 set Roadmap IDs | W02 | Roadmap fields | Guide/native update may be lost on stale write | Guide/Roadmap |
| O06 set native onboarding fields | W03 | native fields | publication update may be lost on stale write | publication/native |
| O07 indirect bootstrap/rebuild Guide refresh | filesystem adapter | Guide fields | earlier Discord work may survive failed/stale JSON write | bootstrap/rebuild |
| O08 retry/rollback | none | none | no retry or rollback in confirmed writer | failure contract |
