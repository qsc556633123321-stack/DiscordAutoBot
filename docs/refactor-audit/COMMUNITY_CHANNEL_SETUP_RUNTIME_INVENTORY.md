# Community Channel Setup Runtime Inventory

## Active Concierge setup surface

| Site | Lookup | Discord mutation | Permission | Persistence handoff | Result |
| --- | --- | --- | --- | --- | --- |
| `getOrCreateCategory` | cache exact category name | create `GuildCategory` | none | none | category object |
| `getOrCreateGuideChannel` | category then exact text name | create text, or move parent | create overwrite plus best-effort `set` | consumed by Guide publication persistence after message mutation | channel object |
| `getOrCreateRoadmapChannel` | category then exact text name | create text only | none | consumed by Roadmap publication persistence after message mutation | channel object |

`setupCommunityGuide` and `setupRoadmapPanel` call these helpers before their
already-closed publication flows. `sendConciergeWelcome` does not create a
channel. The relevant setup helpers remain runtime-owned.

## Other mutation families intentionally excluded

Legacy Bootstrap, V3 builder, server rebuild/polish, game suggestion, temp
voice, and AI reorganization each have different planning, retry, permission,
archive, ordering, or deletion contracts. This slice inventories them as
separate mutation families; it does not select them for a shared migration.
