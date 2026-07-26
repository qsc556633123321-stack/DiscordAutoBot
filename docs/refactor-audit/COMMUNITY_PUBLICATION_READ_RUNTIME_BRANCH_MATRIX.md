# Community Publication Read Runtime Branch Matrix

| Branch | Input | Expected read decision | Compatibility |
| --- | --- | --- | --- |
| R-B01-R-B06 | missing/empty/null/undefined/empty ID | send new | identical |
| R-B07 | valid string ID | fetch existing unless force | identical; mapped state used |
| R-B08-R-B11 | numeric/boolean/object/array truthy ID | legacy fetch attempt | identical via malformed-value fallback |
| R-B12-R-B14 | fetch success/missing/rejection | existing edit or send-new | unchanged runtime code |
| R-B15-R-B18 | edit/send success/failure | existing throw/catch behavior | unchanged runtime code |
| R-B19-R-B20 | persistence after publish | legacy `saveOnboarding` | unchanged |
| R-B21-R-B23 | refresh/force/repeat | existing mode logic | unchanged |
| R-B24-R-B29 | unknown/native/Roadmap/other guild/malformed records | mapper does not mutate them | unchanged legacy persistence |

Only the valid Guide ID read is mapped. No write call order or side-effect count
is changed by the local pure mapper invocation.
