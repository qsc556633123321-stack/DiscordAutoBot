# Community Guide Lookup Adapter Failure Matrix

| Discord/session outcome | Legacy lookup | Adapter result | Candidate runtime mapping |
| --- | --- | --- | --- |
| resolves Message | exact Message | `MessageAvailable` | requires exact retained Message |
| resolves null-like | null-like | `MessageUnavailable` | `null` |
| Unknown Message | `null` | `MessageUnavailable` | `null` |
| Missing Access/Permissions | `null` | `MessageUnavailable` | `null` |
| generic/network Error | `null` | `MessageUnavailable` | `null` |
| string/null/undefined rejection | `null` | `MessageUnavailable` | `null` |

The adapter intentionally does not throw. A redirect must not reintroduce throws, retries, fallback fetches, or channel re-resolution.
