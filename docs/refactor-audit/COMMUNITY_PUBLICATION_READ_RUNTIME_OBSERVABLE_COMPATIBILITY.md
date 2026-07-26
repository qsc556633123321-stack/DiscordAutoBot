# Community Publication Read Runtime Observable Compatibility

| Observable | Status |
| --- | --- |
| JSON path/read/write/parse/serialization | Identical |
| Discord fetch/edit/send/channel/permission calls | Identical |
| saveOnboarding calls, payloads, ordering, return shape, errors | Identical |
| Guide valid-ID branch | Identical; source is mapped state |
| malformed truthy-ID branch | Identical; explicit compatibility fallback |
| Roadmap/native/unknown/other-guild state | Not Applicable to read mapping; unchanged |
| persistence/duplicate/stale-write risks | Identical legacy risks |

No observable behavior is intentionally changed. The new mapper call has no
filesystem, Discord, write, or serialization side effect.
