# Community Mutation Slice Candidates

## Candidate: Guide Publish and Refresh Workflow

- **Active entries:** `/setup-community-guide`, `/refresh-community-guide`, plus indirect bootstrap/V3 refresh.
- **Current path:** legacy commands -> `communityConcierge.setupCommunityGuide` / `setupRoadmapPanel` -> Discord channel/message operations and onboarding JSON.
- **Required ports:** Guide channel resolver/creator, permission writer, message publisher, onboarding-state repository, logger.
- **Compatibility strategy:** retain commands and `communityConcierge` facade; compare exact outgoing payload and persisted record against a frozen baseline.
- **Excluded:** role selection, Concierge buttons, onboarding events, Panels, Bootstrap orchestration, Layout, Voice.
- **Blockers:** Guide and Roadmap are currently coupled; channel creation and permission repair are embedded; no partial-failure/resume fixture exists.
- **Risk:** High. This is the first plausible mutation slice, but not approved for implementation yet.

No candidate is promoted from a dead capability. Guide Status is explicitly excluded because no runtime consumer exists.

## Baseline Update (2026-07-25)

The Guide mutation baseline now freezes command delegation, channel ensure,
message publication/edit, persistence, failure, retry, and partial-success
behavior. That evidence is characterization only: no candidate is promoted and
no mutation runtime has been migrated.

The later Shared Persistence Contract documents why no persistence preparation
slice is promoted: unknown-field preservation and concurrency semantics remain
blocking compatibility concerns.
