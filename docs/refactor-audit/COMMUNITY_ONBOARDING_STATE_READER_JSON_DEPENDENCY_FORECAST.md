# Community Onboarding State Reader JSON Dependency Forecast

Future concept only; not implemented in this slice:

```js
const onboardingStateReader = createCommunityOnboardingStateReader({
  onboardingJsonReader
});

onboardingStateReader.readOnboardingState();
// delegates to onboardingJsonReader.readRoot({})
```

The reader contract change requires all three current runtime construction sites to migrate atomically: Guide, Roadmap, and Welcome. The reader must not accept both `{ filePath, readJson }` and `{ onboardingJsonReader }` during transition.
