# Community Publication Channel Lookup Publish Coupling Matrix

| Concern | Exact source | Same function / branch | Separable now | Blocker |
| --- | --- | --- | --- | --- |
| Identity read | `sendConciergeWelcome` | yes | Unknown | direct DM behavior is observable. |
| Cache/fetch lookup | `sendConciergeWelcome` | yes | No | no adapter/port contract is approved. |
| Member DM publish | `sendConciergeWelcome` | yes | No | lookup result immediately determines DM URL. |
| Channel creation | `setupCommunityGuide` | different function | Yes with exclusions | outside target; Guide setup mutation remains legacy. |
| Message construction/edit/send | Guide/Roadmap setup | different functions | No | publication/persistence coupling. |
| `saveOnboarding` / JSON write | Guide/Roadmap setup | different functions | Yes with exclusions | explicitly out of scope. |
| Bootstrap/Rebuild | legacy callers | indirect | No | broad orchestration. |
| Retry/failure recovery | welcome function | catch branches | Unknown | only swallowed error behavior is observed. |

Lookup is read-only with respect to onboarding persistence, but mutation-coupled to a member DM. This prevents approval of a read-only runtime integration in this slice.
