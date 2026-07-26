# Community Roadmap Read Runtime Branch Matrix

| Branch | Input | Result |
| --- | --- | --- |
| RM-B01-RM-B06 | missing, empty, undefined, null, empty ID | send new |
| RM-B07 | valid string ID | fetch existing |
| RM-B08-RM-B12 | numeric, boolean true, object, array truthy ID | legacy fetch attempt via fallback |
| RM-B13-RM-B15 | fetch success/missing/rejection | existing edit or send branch unchanged |
| RM-B16-RM-B21 | update/send/persistence success/failure | unchanged runtime behavior |
| RM-B22-RM-B30 | repeated, Guide/native/unknown/other guild | mapper is read-only; ownership unchanged |
