# Community Guide Persistence Reuse Feature: Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Production Guide Persistence Reuse Feature | Ready next |
| B. Guide Runtime Persistence Redirect Preparation | Not next; requires the feature first |
| C. Guide Runtime Persistence Redirect Implementation | Not approved |
| D. Split native persistence writes | Rejected |
| E. New Guide repository | Rejected |
| F. Keep legacy indefinitely | Not selected |

The implementation may add only a synchronous Composition factory:
`createCommunityGuidePersistenceFeature({ communityPublicationStateFeature })`.
It returns `{ persist }` and delegates once through the implemented Guide
mapper. Runtime integration, `saveOnboarding` retirement, and a persistence
Port remain explicitly out of scope.
