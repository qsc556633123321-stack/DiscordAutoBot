# Community Legacy Writer Coexistence Coverage

| Contract | Fixture/test | Coverage | Status |
| --- | --- | --- | --- |
| whole-root read/write and stale loss | frozen root / whole-root test | read, write, read/write failures, other guild loss | Covered |
| Guide/Roadmap coexistence | mixed record / Guide-Roadmap test | sequential and stale overlap, send-before-write | Covered |
| publication/native coexistence | mixed record / publication-native test | sequential and stale overlap | Covered |
| bootstrap/rebuild indirect coexistence | mixed record / bootstrap-rebuild test | bootstrap indirect Guide overlap | Partial; rebuild shares same call path |
| different-guild coexistence | three-guild root / different-guild test | safe sequential and stale loss | Covered |
| parse, lock, atomicity, recovery | failure contract | documented only | Missing/Blocked |

No fixture imports production runtime. Tests model the frozen full-root,
read-modify-write contract and never assert a replacement implementation.
