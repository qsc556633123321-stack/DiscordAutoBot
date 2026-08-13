# Community Welcome Final Ownership Matrix

| Responsibility | Owner | Closure impact |
| --- | --- | --- |
| Tracked guide channel | Channel tracking Port + compatibility adapter | Migrated |
| Channel resolution | `CommunityWelcomeChannelResolver` | Migrated |
| Semantic request mapping | Application `mapLegacyWelcomeDeliveryRequest` | Isolated |
| Payload construction | Application `buildCommunityWelcomeMessage` | Isolated |
| DM delivery | `CommunityWelcomeDmDeliveryAdapter` | Migrated |
| Onboarding reader | `CommunityOnboardingStateReader` | Boundary-owned |
| Filesystem helpers | Global Community runtime composition | Excluded |
| Role quick actions | `maybeAddRole` | Unrelated |
| Button dispatch | `handleConciergeButton` | Unrelated |
| AI text generation | `generateConciergeText` | Unrelated |
| Channel setup/mutation | Guide/Roadmap setup flows | Unrelated |

The excluded global owners are not hidden Welcome-specific legacy owners. They
therefore do not block closure of the Welcome delivery flow.
