# Lookup Application Purity Decision

`GuidePublicationMessageLookupRequest`, Result, Status, and Port remain pure: `{ status, messageId }`. They must not contain Discord `Message`, Channel, Guild, Client, or Session references. The identity handoff cannot be added to the Application result without violating this boundary.
