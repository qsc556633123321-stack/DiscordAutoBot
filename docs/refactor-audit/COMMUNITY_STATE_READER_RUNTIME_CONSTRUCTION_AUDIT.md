# Community StateReader Runtime Construction Audit

| Flow | Current exact construction | Current order |
| --- | --- | --- |
| Guide | `createCommunityOnboardingStateReader({ filePath: ONBOARDING_FILE, readJson })` | ensure channel -> pair -> payload -> StateReader -> tracking read -> lookup -> mutation -> persistence -> return |
| Roadmap | same | ensure channel -> pair -> StateReader -> tracking read -> payload -> lookup -> mutation -> persistence -> return |
| Welcome | same | StateReader -> channel tracking read -> resolver -> no-channel return -> payload -> DM adapter -> delivery |

Each flow constructs one StateReader and causes one underlying read per invocation. No module-level reader/root cache exists.
