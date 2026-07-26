# Community Publication Channel Lookup Search Scope

Production search terms: `guideChannelId`, `roadmapChannelId`, `sendConciergeWelcome`, `setupCommunityGuide`, `setupRoadmapPanel`, `guild.channels.cache.get`, `guild.channels.fetch`, `channels.cache`, `channels.fetch`, `channel.send`, `isTextBased`, `channel.type`, `saveOnboarding`, `channels.create`, `bootstrap`, `rebuild-community-v3`, and `refresh`.

Searched areas: `src/`, commands, events, systems, services, application, infrastructure, legacy compatibility paths, and scripts. Findings are classified as Active Runtime, Indirect Runtime, Compatibility-only, Test-only, Documentation-only, or Unknown.

Result: `sendConciergeWelcome()` is the only confirmed active Guide channel lookup consumer. `setupCommunityGuide()` and `setupRoadmapPanel()` write IDs while publishing. Bootstrap and V3 rebuild are indirect calls to Guide setup/refresh, not consumers of the welcome lookup. No active Roadmap channel lookup reader was found.
