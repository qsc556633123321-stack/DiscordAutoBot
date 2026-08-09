# Community Guide Runtime Persistence Redirect: Current Flow

`setupCommunityGuide(guild, options)` currently runs:

```text
getOrCreateGuideChannel
-> create Guide adapter pair
-> build payload
-> read onboarding state and derive tracked ID
-> optional lookup
-> build mutation input and plan
-> Edit existing Message or Send new Message
-> retained-Message identity invariant
-> saveOnboarding(one four-field patch)
-> return { channel, message }
```

Persistence occurs after final successful Discord mutation and retained-message
invariant, immediately before return. Its result is ignored. It writes exact
`guild.id`, `channel.id`, and final retained `message.id`. Recommendations are
the module constant `NATIVE_ONBOARDING_RECOMMENDATIONS`; excluded channels are
the literal `['🎮｜目前語音房', '🎮｜遊戲中心']` at the call site. Neither is
calculated, cloned, filtered, sorted, or derived from runtime state.

There is no onboarding-state read after this write in the same invocation.
Writer failure logs and returns `{ persisted: false, record }`, so successful
Edit or Send still resolves. There is no retry, rollback, second mutation, or
second persistence call.
