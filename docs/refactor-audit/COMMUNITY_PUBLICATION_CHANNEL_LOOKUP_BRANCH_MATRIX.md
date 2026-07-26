# Community Publication Channel Lookup Branch Matrix

| Cases | Input / branch | Observable baseline |
| --- | --- | --- |
| CL-F01-F06, F09 | missing, empty, null, empty-string, or false identity | name lookup; no fetch; DM only when name lookup finds a channel; no write/create. |
| CL-F07, F13 | valid cached string | one cache get; no fetch; one DM; no write/create. |
| CL-F08, F10-F12 | truthy malformed identity | passed unchanged to cache and then fetch if cache misses; no validation. |
| CL-F14-F15 | cache miss / fetch success | one fetch with original ID; one DM; no write/create. |
| CL-F16-F17 | fetch null or rejection | lookup becomes null; return undefined; no DM; rejection swallowed. |
| CL-F18 | non-text channel | accepted because only `.id` is used; one DM. |
| CL-F19 | member DM success | one DM; return undefined. |
| CL-F20-F21 | DM rejection / missing permission | one attempted DM; rejection swallowed; return undefined. |
| CL-F22-F25 | unrelated fields and other guilds | read-only; fields and other guild data are not mutated. |
| CL-F26-F27 | primitive/array record | property read resolves falsy; legacy name fallback. |
| CL-F28 | repeated invocation | repeats read, lookup, and possible DM; duplicate risk is present. |
| CL-F29-F30 | Bootstrap/Rebuild labels | no direct path to welcome lookup; retained as indirect-path fixture evidence only. |

All cases have `saveOnboarding`, JSON serialization/write, channel creation, channel send, and mapper calls equal to zero for this runtime function.
