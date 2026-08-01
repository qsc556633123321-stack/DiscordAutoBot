# Community Welcome Delivery Preparation Blockers

1. The active template requires `member.guild.name`, while the approved request contract deliberately has only `guildId` and `guideChannelId`.
2. Channel resolution and member-DM delivery are coupled in one legacy function.
3. The function has compatibility-specific fetch and DM error swallowing, no result object, and no dedupe.
4. No Discord delivery port, adapter, composition root, repository, or runtime wiring is approved.

Preparation Slice #2 is complete only as contracts/tests/docs. Community remains **Migration In Progress**.
