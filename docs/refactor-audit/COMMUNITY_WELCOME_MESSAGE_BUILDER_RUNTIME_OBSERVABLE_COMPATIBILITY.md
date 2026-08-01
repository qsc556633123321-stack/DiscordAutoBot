# Community Welcome Message Builder Runtime Observable Compatibility

| Observable | Status |
| --- | --- |
| trigger, onboarding read, identity read, cache/fetch/name fallback | Identical |
| selected channel and URL path | Identical |
| guild name, exact DM content, Unicode, Markdown, newline, payload shape | Identical |
| `member.send` count and `.catch(() => null)` behavior | Identical |
| return value, logs, repeated invocation and duplicate risk | Identical |
| channel creation, persistence, saveOnboarding, JSON write | Not Applicable / zero before and after |
| Result/Failure contracts, ports, adapters, composition | Not Applicable / not integrated |

No observable is marked Changed.
