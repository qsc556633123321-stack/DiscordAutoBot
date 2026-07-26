# Community Publication Channel Lookup Observable Contract

| Observable | Status | Baseline |
| --- | --- | --- |
| Onboarding JSON read | Confirmed | one read per invocation in normal cases. |
| `guideChannelId` read | Confirmed | after root read; truthiness selects identity vs name path. |
| Cache / fetch | Confirmed | cache once for truthy identity; fetch once only on cache miss. |
| Channel creation / channel send | Not Applicable | zero in this function. |
| Member DM | Confirmed | one attempt after a resolved channel; payload URL includes guild and channel ID. |
| Persistence / saveOnboarding | Not Applicable | zero calls. |
| Mapper invocation | Confirmed absent | zero calls. |
| Return value | Confirmed | resolves `undefined`. |
| Errors | Confirmed | fetch and DM errors are swallowed; onboarding read error is logged by legacy `readJson` then follows fallback. |
| Retry / duplicate risk | Confirmed | no retry/dedupe; repeated calls can send repeated DMs. |
| Stale cache risk | Confirmed | a cached object is trusted without validation. |
| Write-after-send risk | Not Applicable | no write occurs. |

This records current behavior, not desired behavior or an implementation proposal.
