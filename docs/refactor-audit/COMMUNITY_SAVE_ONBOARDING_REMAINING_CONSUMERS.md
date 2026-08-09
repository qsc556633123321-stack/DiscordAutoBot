# saveOnboarding Remaining Consumers

Production search at closure found the following consumers in `src/systems/communityConcierge.js`:

| Consumer | Classification | Reason |
| --- | --- | --- |
| `setupCommunityGuide` | Guide legacy runtime | Persists guide channel/message and native task recommendations. |
| `setupRoadmapPanel` | None | No Roadmap `saveOnboarding` call remains. |
| `saveOnboarding` function | Shared compatibility helper | Must remain until Guide persistence is migrated. |

No deletion is approved by this audit. The next safe line is Guide Persistence Migration Preparation.
