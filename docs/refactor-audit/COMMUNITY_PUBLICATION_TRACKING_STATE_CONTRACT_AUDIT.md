# Community Publication Tracking State Contract Audit

`fromLegacyPublicationRecord` is an Application-layer mapper from one guild's legacy onboarding record to `CommunityPublicationState`. It accepts object-like data, returns an Application-safe immutable state, and has no Discord or filesystem dependency.

It is reusable as part of a future read adapter, but the current Guide/ Roadmap runtime also retains the raw `data.*MessageId` fallback. A future read query must preserve that exact fallback before it can replace runtime behavior. A normalized `CommunityPublicationState` alone is insufficient for falsy or truthy malformed legacy values.

No duplicate mapper is approved. The future adapter/query must call `fromLegacyPublicationRecord` and apply the frozen existing fallback rule once.
