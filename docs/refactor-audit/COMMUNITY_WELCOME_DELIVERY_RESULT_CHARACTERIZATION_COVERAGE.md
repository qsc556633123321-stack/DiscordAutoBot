# Community Welcome Delivery Result Characterization Coverage

| Coverage | Source / fixture / test | Status |
| --- | --- | --- |
| delivery, rejection, no destination, cache/fetch/fallback | WR-B01-B13; runtime return baseline | Covered |
| synchronous throw, Promise rejection, malformed runtime inputs | WR-B14-B20, B26-B29; thrown/swallowed baseline | Covered |
| resolved message-like and undefined values, repeated call | WR-B21-B23; runtime return baseline | Covered |
| caller await/catch/continuation | WR-B24-B26; caller behavior baseline | Covered |
| read/cache/fetch/mapper/builder/send/write counts | call-count baseline | Covered |
| Result/Reason mapping and compatibility | mapping, reason, observable docs | Characterized only |
| architecture/diff/protected-path boundary | architecture tests | Covered |
