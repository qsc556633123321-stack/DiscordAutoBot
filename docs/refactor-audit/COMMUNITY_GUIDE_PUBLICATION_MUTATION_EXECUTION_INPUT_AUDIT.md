# Community Guide Publication Mutation Execution Input Audit

Base: `24a4b06`. Legacy execution is `src/systems/communityConcierge.js#setupCommunityGuide(guild, options)`. It builds the Guide payload, reads `guideMessageId`, conditionally fetches it, then executes either `await message.edit(payload)` or `message = await channel.send(payload)`. In both successful branches it calls `saveOnboarding(guild.id, { guideChannelId, guideMessageId: message.id, nativeTaskRecommendations, nativeTaskExcludedChannels })`.

Fetch null/rejection selects send; force bypasses fetch and selects send. Edit/send rejections propagate and prevent Guide persistence. `writeJson` catches write errors, so send/edit can succeed while the record remains unpersisted. The Guide setup function does not execute Roadmap; command-level callers invoke Roadmap afterwards. No retry, lock, dedupe, rollback, or recovery exists.
