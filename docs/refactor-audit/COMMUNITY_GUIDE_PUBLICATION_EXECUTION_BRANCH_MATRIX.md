# Community Guide Publication Execution Branch Matrix

| Branches | Execution / persistence | Observable result |
| --- | --- | --- |
| GE-B01, B04, B14, B20-B22 | tracked fetch -> edit -> write | same message ID persisted; repeat edits |
| GE-B02-B03, B07-B08, B11, B19 | fetch unusable or absent/force -> send -> message.id -> write | new message ID persisted |
| GE-B05, B09 | edit/send rejects | function rejects; no Guide write |
| GE-B06, B10 | synchronous throw | Not Applicable to Discord.js promise contract; would reject before persistence |
| GE-B12-B13 | malformed send result | `message.id` access throws; no write |
| GE-B15, B17, B24 | writer catches failure after publish | function resolves; published message untracked and retry can duplicate |
| GE-B16, B18, B27 | Guide and Roadmap are sequential command operations | Guide effects remain if Roadmap fails |
| GE-B23, B28 | repeated/other guild state | no lock; full-root writer preserves other records on successful write |
| GE-B25-B26 | unknown/native fields | shallow guild patch preserves them |
| GE-B29 | interaction response | Not Applicable to direct Guide execution |
| GE-B30 | caller completion | direct function returns `{ channel, message }` unless pre-write execution rejects |

All GE-B01 through GE-B30 are represented as plain frozen data in the execution fixture.
