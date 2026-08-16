# Game Role Access Matrix

This is the future access-policy target, not a live Discord permission change.
Entry, lobby, interests, and events retain their existing matrix semantics.
Game Center is a candidate to require game; a specific game role logically
implies it.

| Logical roles | Entry | Lobby | Game Center | VALORANT category | APEX category | Minecraft category |
| --- | --- | --- | --- | --- | --- | --- |
| everyone | allow | deny | deny | deny | deny | deny |
| member | allow | allow | deny | deny | deny | deny |
| game | allow through member | allow through member | allow | deny | deny | deny |
| game:valorant | allow through inheritance | allow through inheritance | allow | allow | deny | deny |
| game:apex | allow through inheritance | allow through inheritance | allow | deny | allow | deny |
| game:valorant + game:apex | allow | allow | allow | allow | allow | deny |
| admin | existing administrator override | existing administrator override | allow | allow | allow | allow |

The immediate implementation provides pure roleCanAccessGameCenter and
roleCanAccessGame decisions. It does not mutate permissionMatrix or any Discord
overwrite.
