# Community Publication Persistence Concurrency Semantics

Legacy persistence has no locking or compare-and-swap. Two writers from a
stale root can overwrite each other's publication fields; the last root wins.
The preparation preserves this limitation. No transaction, retry, rollback,
compensation, or cross-Guide/Roadmap atomicity is promised.
