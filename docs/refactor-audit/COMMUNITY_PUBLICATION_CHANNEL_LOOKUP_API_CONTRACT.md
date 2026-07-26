# Community Publication Channel Lookup API Contract

- Cache API: `member.guild.channels.cache.get(data.guideChannelId)`, synchronous, called only for truthy values.
- Fetch API: `await member.guild.channels.fetch(data.guideChannelId).catch(() => null)`, called after a cache miss with the original value and no normalization.
- Fallback API: `findChannelByName(...)` for falsy identity values only.
- Observed return handling: null/undefined lookup returns from the function; fetch rejection is mapped to null.
- Channel assumption: the result only needs an `id`; `isTextBased`, `type`, and `send` are not checked or used.
- Permission assumption: no member/guild permission preflight is made. A DM rejection, including permission-like errors, is swallowed.
- Timing: cache first, fetch second only after miss; every invocation performs a fresh onboarding read and lookup.
- Required doubles: collection with `get/find`, async `fetch`, member `send`, and onboarding filesystem read/write counters.
