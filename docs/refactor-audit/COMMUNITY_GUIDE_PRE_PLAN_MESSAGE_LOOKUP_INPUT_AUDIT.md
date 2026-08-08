# Community Guide Pre-Plan Message Lookup Input Audit

| Item | Legacy behavior |
| --- | --- |
| Tracked ID source | `publicationState.guide.messageId || data.guideMessageId` |
| Exact variable | `guideMessageId` in `src/systems/communityConcierge.js` |
| Mode source | `options.mode` |
| Force gate | Lookup only when `guideMessageId && options.mode !== 'force'` |
| Exact expression | `channel.messages.fetch(guideMessageId).catch(() => null)` |
| Timing | After `getOrCreateGuideChannel(guild)`; before mutation input and Plan |
| Count | One fetch at most per Guide setup invocation; zero when skipped/force |
| Arguments | The opaque `guideMessageId` is passed unchanged |
| Success | A truthy message makes `existingMessageAvailable = true` |
| Null | Null makes `existingMessageAvailable = false` |
| Rejection | Caught and represented as `null`, then false |
| Truthy malformed ID | Still passed to fetch; a failure is caught and selects Send |
| Plan input | `existingMessageAvailable: Boolean(message)` and attempted flag |
| Decision | Available selects Edit; unavailable/skipped selects Send |
| Persistence | `saveOnboarding()` runs only after successful Edit or Send |
| Blocker | A post-Plan adapter cannot change an already selected Edit into Send |
