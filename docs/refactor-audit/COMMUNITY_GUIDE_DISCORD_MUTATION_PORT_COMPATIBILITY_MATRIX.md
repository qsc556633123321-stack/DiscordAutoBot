# Guide Discord Mutation Port Compatibility Matrix

| Group | Cases | Legacy observation | Future port expectation | Blocker |
| --- | --- | --- | --- | --- |
| Edit identity | GP-01..GP-05 | tracked ID fetched unless force | scalar Edit request needs IDs | fetch timing/malformed compatibility |
| Edit execution | GP-06..GP-08 | edit succeeds or throws | success/failure result with message ID | runtime mapping uncharacterized |
| Send identity | GP-09..GP-12 | ensured channel is destination | scalar Send request needs IDs | channel ensure remains legacy |
| Send execution | GP-13..GP-16 | send succeeds or throws | success/failure result with generated ID | runtime mapping uncharacterized |
| Shared mode/payload | GP-17..GP-21 | force sends; payload reference unchanged | no clone/normalization | preserve Plan boundary |
| Persistence/Roadmap | GP-22..GP-25 | mutation succeeds before persistence; Roadmap continues outside Guide result | excluded | outer workflow coupling |
| Legacy data/failure | GP-26..GP-30 | unknown fields persist; malformed legacy record retains fetch behavior | adapter must not repair | data/identity policy deferred |

All 30 frozen cases are represented in
`tests/fixtures/community/community-guide-discord-mutation-port-cases.json`.
