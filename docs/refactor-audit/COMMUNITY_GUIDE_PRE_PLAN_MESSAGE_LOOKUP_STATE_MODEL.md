# Community Guide Pre-Plan Message Lookup State Model

The preparation model preserves the branch information that matters before Plan
creation:

| State | Meaning | Plan availability |
| --- | --- | --- |
| `LookupSkipped` | Missing/falsy ID or `mode === 'force'`; no fetch | false |
| `MessageAvailable` | Fetch returned a message | true |
| `MessageUnavailable` | Fetch returned null or rejected and was caught | false |

`LookupFailed` is deliberately rejected as a separate state. Legacy converts a
rejection with `.catch(() => null)`, so null and rejection are intentionally
indistinguishable to the runtime branch decision. Adding a failure state would
over-model behavior without changing the Plan input.
