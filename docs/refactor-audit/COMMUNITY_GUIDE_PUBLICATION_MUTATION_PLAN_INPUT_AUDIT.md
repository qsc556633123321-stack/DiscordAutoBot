# Community Guide Publication Mutation Plan Input Audit

Legacy decision owner: `src/systems/communityConcierge.js#setupCommunityGuide`. The function receives `guild` and `options.mode`; it reads `guideMessageId`, attempts `channel.messages.fetch` only when the ID is truthy and mode is not `force`, then chooses edit when a message object exists or send otherwise.

The pure input is deliberately limited to `guildId`, `mode`, `trackedMessageId`, `existingMessageAvailable`, and `existingMessageLookupAttempted`. It retains omitted, null, empty, numeric, object, and array IDs without normalizing legacy values. It excludes Discord objects/errors, payload builders, filesystem/JSON data, callbacks, and functions.

Force always selects send. Normal and refresh select edit only when an existing fetched message is available. Fetch null/rejection leads to send in the legacy decision. A later edit/send/persistence failure is excluded downstream behavior; the plan does not model retry, duplicate detection, rollback, or result status.
