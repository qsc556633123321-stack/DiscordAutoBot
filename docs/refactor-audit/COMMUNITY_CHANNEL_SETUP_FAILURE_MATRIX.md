# Community Channel Setup Failure Matrix

| Failure point | Current behavior | Partial resource / next effect |
| --- | --- | --- |
| cache lookup | no throw contract; cache result is used | missing is treated as create |
| category create | reject propagates | no channel/publication/persistence work |
| channel create | reject propagates after possible category creation | category remains; no rollback |
| Guide parent move | reject propagates | channel/category remain; no overwrite/publication |
| Guide overwrite set | rejection swallowed to `null` | channel continues into publication flow |
| Roadmap setup | no permission step | normal publication begins after ensure |
| later message/persistence | owned by already-closed Guide/Roadmap flows | setup resource remains; their own failure contracts apply |

There is no retry, rollback, compensating delete, log, Result wrapper, or
generic error translation in Concierge channel setup.
