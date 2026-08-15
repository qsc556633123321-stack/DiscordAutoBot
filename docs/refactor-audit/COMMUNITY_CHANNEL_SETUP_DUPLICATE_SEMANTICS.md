# Community Channel Setup Duplicate Semantics

Category reuse is `guild.channels.cache.find` with exact `GuildCategory` type
and exact name. Guide/Roadmap channel reuse is `cache.find` with exact
`GuildText` type and exact name. There is no ID lookup, fetch, topic match,
case normalization, fuzzy duplicate detection, or retry.

| Case | Guide | Roadmap |
| --- | --- | --- |
| category exists | reuse | reuse |
| category missing | create | create |
| channel exists under target category | reuse then overwrite repair | reuse |
| channel exists under another parent | `setParent(..., lockPermissions:false)` then overwrite repair | reuse without moving |
| channel missing | create under category | create under category |

This asymmetry is a compatibility contract. A future common boundary cannot
silently normalize parent, topic, permission, or duplicate behavior.
