# Community Welcome Channel Resolution Audit

| Input/branch | Current behavior | Identity and calls |
| --- | --- | --- |
| Truthy ID + cache hit | Return cached channel | Exact cached object; fetch 0; name fallback 0 |
| Truthy ID + cache miss + fetch success | Return fetched channel | Fetch receives exact raw ID; exact fetched object; name fallback 0 |
| Truthy ID + fetch reject | Return `null` | Rejection swallowed; no retry; no name fallback |
| Falsy ID (`undefined`, `null`, `''`, `false`, `0`) | Name lookup | Exact one `findChannelByName` call; fetch 0 |
| Truthy malformed (`123`, `true`, object, array, whitespace) | Treat as truthy ID | Cache/fetch receives exact raw value; no normalization or validation |
| No resolved channel | Caller returns `undefined` | DM send 0 |

The future resolver must accept a Guild only at an Infrastructure-facing
boundary. It may not coerce tracked IDs, wrap channels, retry, log, or silently
fall back from a truthy fetch failure to name lookup.
