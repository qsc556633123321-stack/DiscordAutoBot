# Community Tracking Adapter Reader Dependency Contract

Future adapter factories receive exactly `{ onboardingStateReader }`. It must
be an object with `readOnboardingState` as a function. Validation happens at
factory construction and throws:

`TypeError('CommunityPublicationTrackingReadCompatibilityAdapter requires onboardingStateReader')`

or:

`TypeError('CommunityPublicationChannelTrackingReadCompatibilityAdapter requires onboardingStateReader')`.

Adapters must call `onboardingStateReader.readOnboardingState()` as an object
method exactly once per query. No dual `readOnboardingData` parameter, alias,
fallback, raw root exposure, mutation, clone, cache, mapper relocation, or
reader-side business logic is approved.
