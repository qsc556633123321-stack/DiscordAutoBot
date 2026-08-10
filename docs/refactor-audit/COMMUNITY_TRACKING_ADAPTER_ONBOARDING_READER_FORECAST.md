# Community Tracking Adapter Onboarding Reader Forecast

The next migration preparation will change adapter dependencies from a function
to an explicit Infrastructure reader object:

```js
createCommunityPublicationTrackingReadCompatibilityAdapter({ onboardingStateReader });
createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ onboardingStateReader });
```

Each adapter will call `onboardingStateReader.readOnboardingState()` exactly
once per query. This is a forecast only: adapters and runtime construction are
unchanged in the current slice.
