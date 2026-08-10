# readOnboardingData Post-Tracking-Redirect Audit

## Production Consumers

| Location | Runtime calls | Responsibility |
| --- | ---: | --- |
| `setupCommunityGuide` | 0 | Migrated to shared tracked-message read boundary. |
| `setupRoadmapPanel` | 0 | Migrated to shared tracked-message read boundary. |
| `sendConciergeWelcome` | 1 | Legacy `guideChannelId` tracked-channel read. |
| Other runtime code | 0 | None found. |
| `readOnboardingData` definition | 1 | Retained for Welcome. |

`saveOnboarding` has one retained definition and zero runtime consumers. It is a
separate cleanup candidate; this audit neither removes it nor changes its
contract.
