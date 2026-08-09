# saveOnboarding Consumer Audit

Production search finds two occurrences in `src/systems/communityConcierge.js`:

| Occurrence | Classification | Status |
| --- | --- | --- |
| function definition | shared compatibility helper | Active support code |
| `setupCommunityGuide` call | Guide runtime consumer | Active legacy ownership |

Roadmap has no call. No other production consumer was found. Guide is therefore the final known runtime consumer, but the helper is not removable in this preparation slice.
