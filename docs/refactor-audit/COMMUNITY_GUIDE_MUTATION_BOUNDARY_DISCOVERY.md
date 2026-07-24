# Community Guide Mutation Boundary Discovery

## Active entries

- `/setup-community-guide` calls `setupCommunityGuide(..., { mode: 'create' })` and `setupRoadmapPanel`.
- `/refresh-community-guide` calls `setupCommunityGuide(..., { mode: 'refresh' })` and `setupRoadmapPanel`.
- Bootstrap and V3 rebuild runtimes invoke Guide refresh indirectly.

## Responsibilities currently coupled in `communityConcierge`

1. discover or create entry category and Guide channel;
2. move the channel and set onboarding visibility overwrites;
3. compose the already-migrated Guide payload;
4. fetch/edit an existing message or send a new one;
5. persist Guide and Roadmap channel/message IDs in `onboarding-flows.json`;
6. publish the separate Roadmap panel.

The read/renderer slice is complete. Publish, refresh, setup, channel creation, message persistence, permission setup, and repair are not migrated.

## Failure and idempotency observations

- Existing message IDs prevent duplicate publish only when fetch succeeds.
- A missing message falls back to send, then writes a replacement ID.
- A channel can be created before message send fails.
- A message can be sent before JSON persistence fails, leaving an untracked message.
- No transactional rollback exists; this is a high-risk future mutation slice.

Guide Publish and Guide Refresh have active consumers, but they should not be migrated until their channel, persistence, Roadmap, and permission responsibilities are separated behind explicit ports.
