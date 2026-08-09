# Community Guide Persistence Current Flow

`setupCommunityGuide(guild, options)` has one persistence call, after the final successful Discord mutation and before returning `{ channel, message }`.

`saveOnboarding(guild.id, { guideChannelId: channel.id, guideMessageId: message.id, nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS, nativeTaskExcludedChannels: [...] })`

The call is synchronous. Its return value is unused. `saveOnboarding` creates the generic Community publication feature and returns `.record`; runtime therefore ignores both successful records and writer-failure `{ persisted:false, record }` results. The exact order is:

- Edit: ensure channel → permission overwrite → lookup → edit retained Message → one write → return.
- Send: ensure channel → permission overwrite → send Message → one write → return.

There is no native-task operation or second persistence write. Writer failure creates partial success: Discord mutation remains complete, persistence failure is logged and the runtime resolves with the Discord Message.
