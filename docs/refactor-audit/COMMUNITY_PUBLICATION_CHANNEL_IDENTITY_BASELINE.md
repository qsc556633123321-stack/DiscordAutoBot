# Community Publication Channel Identity Baseline

For both `guideChannelId` and `roadmapChannelId`, legacy records can be missing,
undefined, null, empty strings, valid strings, numeric primitives, booleans,
objects, or arrays. Existing `CommunityPublicationState` normalizes valid
non-empty strings and represents other values as `null`; runtime behavior for
truthy malformed values is legacy compatibility territory and is not changed.

Missing Guide channel identity causes welcome-link fallback by name. Roadmap
has no confirmed standalone read consumer. All channel writes remain coupled to
channel creation/publication and shared persistence.
