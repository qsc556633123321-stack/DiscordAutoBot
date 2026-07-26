# Community Publication Channel Identity Input Audit

Message identity is already integrated through `CommunityPublicationState` for
Guide and Roadmap reads. Channel identity remains legacy-only:
`guideChannelId` and `roadmapChannelId` are stored alongside message IDs.

This slice introduces no domain field, mapper change, runtime consumer,
persistence writer, mutation, adapter, repository, composition, JSON, or
Discord API behavior. It is documentation and characterization only.
