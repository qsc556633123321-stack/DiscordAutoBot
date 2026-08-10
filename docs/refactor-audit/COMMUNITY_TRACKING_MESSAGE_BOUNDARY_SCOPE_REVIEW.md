# Community Tracking Message Boundary Scope Review

The active `CommunityPublicationTrackingReadPort` owns tracked **message** IDs
only. Extending it with `readTrackedChannel` would mix two distinct resource
identities and enlarge a proven message contract without a runtime need for
Roadmap channel tracking.

Decision for this preparation: **Do Not Extend** the message tracking port.
Do not replace it. A separate shared channel-identity boundary preserves
semantic cohesion while keeping the current message boundary unchanged.
