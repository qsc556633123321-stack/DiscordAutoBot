# Community Read Onboarding Runtime Injection Audit

`readOnboardingData` is injected into three stateless compatibility adapter
instances, all constructed per invocation in `communityConcierge.js`:

| Consumer | Adapter | Method | Underlying reads |
| --- | --- | --- | ---: |
| Guide | `CommunityPublicationTrackingReadCompatibilityAdapter` | `readTrackedMessage` | 1 |
| Roadmap | `CommunityPublicationTrackingReadCompatibilityAdapter` | `readTrackedMessage` | 1 |
| Welcome | `CommunityPublicationChannelTrackingReadCompatibilityAdapter` | `readTrackedChannel` | 1 |

This is active compatibility ownership, not direct runtime use. A future
Infrastructure-owned onboarding-state reader must preserve the legacy root
result and exactly-one-read behavior before these injections can change.
