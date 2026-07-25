# Community Publication Identity Consumer Inventory

| Consumer | Source / trigger | Identity lookup | Result | Status |
| --- | --- | --- | --- | --- |
| Guide publication | `communityConcierge:setupCommunityGuide`; setup/refresh | exact channel name, then `guideMessageId` fetch | failed/missing ID sends and overwrites record | Active Runtime |
| Roadmap publication | `communityConcierge:setupRoadmapPanel`; setup/refresh | exact channel name, then `roadmapMessageId` fetch | failed/missing ID sends and overwrites record | Active Runtime |
| Welcome link | `sendConciergeWelcome`; member add | saved `guideChannelId`, then cache/fetch; otherwise name | returns if absent | Indirect Active Runtime |
| Bootstrap/V3 | legacy setup callers | indirect Guide refresh | best-effort caller behavior | Indirect Active Runtime |
| tests | `tests/**` | fixture IDs/names | no production mutation | Test-only |

No active consumer verifies author, content, embed title/footer, components, pins,
topic, message history, or a deterministic identity token. No identity-specific
repair or cleanup command exists.
