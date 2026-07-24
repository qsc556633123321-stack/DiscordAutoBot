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
