# Roadmap Lookup Channel Identity

Lookup uses the exact channel returned by `getOrCreateRoadmapChannel` in the
same invocation. It does not resolve globally, use the Guide channel, or use a
stored `roadmapChannelId` as the lookup receiver.
