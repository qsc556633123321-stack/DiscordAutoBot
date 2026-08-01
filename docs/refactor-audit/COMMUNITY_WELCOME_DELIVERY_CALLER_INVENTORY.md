# Community Welcome Delivery Caller Inventory

| Caller ID | Exact file / function | Trigger | Relation | Await / catch | Return or error use | Status / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| WD-C01 | `src/events/guildMemberAdd.js#execute` | `Events.GuildMemberAdd` | Direct | `await`; local `try/catch` | Return ignored; rejection logged then event continues | Active Runtime; imports and awaits `sendConciergeWelcome(member)` |
| WD-C02 | `src/systems/communityConcierge.js#sendConciergeWelcome` | WD-C01 | Direct delivery owner | awaits `member.send(...).catch(() => null)` | No outward result; DM rejection becomes `undefined` | Active Runtime |
| WD-C03 | characterization tests | node test scripts | Test-only | varied | asserts resolved/rejected behavior | Test-only |

No production `.then`, `Promise.all`, fire-and-forget, or alternate Welcome Delivery caller was found. Bootstrap, Guide setup, Roadmap, and dashboard do not call this function.
