# Community Welcome Guide Channel Legacy Field Audit

| Field | Source | Mapper | Fallback | Normalization | Consumer |
| --- | --- | --- | --- | --- | --- |
| `guideChannelId` | `readOnboardingData()[guildId] || {}` | None | Falsy values use channel-name search; cache miss uses `channels.fetch(...).catch(() => null)` | None | `sendConciergeWelcome` |

Valid strings are used as-is. `undefined`, `null`, `''`, `false`, and `0` take
the name-search fallback. Truthy malformed values (`123`, `true`, objects,
arrays, whitespace) are preserved as raw IDs and passed to cache/fetch exactly
as legacy runtime does. A missing guild or reader failure yields no tracked ID
and follows the same name-search fallback.
