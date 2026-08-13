# Community StateReader JSON Dependency Decision

Future factory contract, frozen for the atomic implementation slice:

```js
createCommunityOnboardingStateReader({ onboardingJsonReader })
```

It validates `onboardingJsonReader.readRoot` and throws exactly:

```text
CommunityOnboardingStateReader requires onboardingJsonReader.readRoot
```

Its frozen public surface remains `{ readOnboardingState }`; the method synchronously returns `onboardingJsonReader.readRoot({})`. The fresh `{}` is created for each invocation. It must preserve root identity and thrown values exactly. Dual mode is rejected.
