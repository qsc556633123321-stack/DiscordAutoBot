# Community Publication Read Integration Target Decision

Selected: **Guide Existing Message Identity Read** in
`src/systems/communityConcierge.js#setupCommunityGuide`.

It reads the existing Guide message ID to choose the fetch-existing versus
send-new branch. The runtime now creates `publicationState` with the pure mapper
and uses `publicationState.guide.messageId` for valid IDs. A narrow raw fallback
preserves legacy truthy malformed-ID behavior; identity validation is not part
of this slice.

Rejected this slice: Roadmap read (second production path), shared Guide/Roadmap
read (broader behavior), Bootstrap and Rebuild (indirect full workflows), and
full setupCommunityGuide integration (mutation/persistence coupled).
