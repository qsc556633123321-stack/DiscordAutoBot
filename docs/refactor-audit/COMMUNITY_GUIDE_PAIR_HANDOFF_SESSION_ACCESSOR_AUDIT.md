# Community Guide Pair Handoff Session Accessor Audit

The existing `GuidePublicationResourceSession` already retains the exact successful lookup result per invocation. `getRetainedMessage()` is synchronous, returns `null` for a fresh session, returns the exact non-null fetched `Message` after availability, and performs no Discord fetch, edit, send, or persistence write. Missing/unavailable results and rejected fetches clear the retained value. A later successful lookup replaces it. Sessions do not share retained state.

The exact retained identity remains compatible with the legacy `message.edit(...)`
receiver. The accessor is a read-only observation; it neither changes mutation
ownership nor changes the existing mutation adapter behavior.

The accessor is currently infrastructure-local and is not exposed through the Pair, Composition, Application, or runtime.
