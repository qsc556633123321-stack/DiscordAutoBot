# Community Publication Tracking Read Post-Implementation Readiness

## Implemented Boundary

The shared boundary now consists of:

- `src/application/community/ports/CommunityPublicationTrackingReadPort.js`
- `src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js`

It is deliberately not composed or runtime-used. The adapter receives its
legacy reader through dependency injection, performs one read per query, and
reuses `fromLegacyPublicationRecord` before applying the frozen raw fallback.

## Candidate Assessment

| Candidate | Decision |
| --- | --- |
| A. Composition Feature Preparation | Rejected for now. No composition is needed until a runtime redirect is approved. |
| B. Guide + Roadmap Runtime Redirect Preparation | **Recommended next.** Characterize construction, injection, ordering, and failure behavior before modifying either runtime path. |
| C. Guide Runtime Read Redirect Preparation only | Deferred. Guide and Roadmap share the same semantic contract and should be prepared together unless their runtime ordering proves incompatible. |
| D. Roadmap Runtime Read Redirect Preparation only | Deferred for the same reason. |
| E. Welcome Channel Read Boundary Preparation | Deferred. Welcome reads a tracked channel, not a tracked message. |
| F. Keep Legacy | Rejected as the long-term owner now that the isolated boundary exists. |

## Readiness Conditions

The boundary is ready for redirect preparation because it preserves:

- exact `guildId` passthrough;
- exact `guide` and `roadmap` discriminators;
- `state.messageId || rawLegacyMessageId` compatibility;
- falsy and truthy-malformed legacy values;
- missing-guild and absorbed reader-failure behavior; and
- one underlying compatibility read per query.

No redirect implementation is approved in this slice. Runtime ownership remains
legacy until a dedicated preparation slice proves construction and call ordering.
