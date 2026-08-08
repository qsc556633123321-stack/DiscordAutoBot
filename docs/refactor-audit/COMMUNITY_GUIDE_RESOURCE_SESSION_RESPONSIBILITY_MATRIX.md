# Guide Resource Session Responsibility Matrix

| Responsibility | Session ownership |
| --- | --- |
| Ensured channel reference, fetched message reference | Must own |
| Guild ID, channel ID, tracked message ID, lookup operation/result mapping, edit/send execution | May own internally |
| Plan creation, payload building, persistence, Roadmap, interaction, channel ensure/create, retry, logging, cleanup | Must not own |

The session is infrastructure-local. Application receives scalar request/result
data only; it never receives a session, channel, message, Discord client, or
other infrastructure handle.
