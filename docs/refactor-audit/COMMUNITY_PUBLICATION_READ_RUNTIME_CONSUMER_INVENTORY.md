# Community Publication Read Runtime Consumer Inventory

| Consumer | Source/function | Field/read | Side effects | Suitability |
| --- | --- | --- | --- | --- |
| C01 Guide existing message | `communityConcierge.setupCommunityGuide` | `guideMessageId`; fetch branch | fetch/edit/send then legacy save | Preferred: narrow read mapping |
| C02 Roadmap existing message | `communityConcierge.setupRoadmapPanel` | `roadmapMessageId`; fetch branch | fetch/edit/send then save | Acceptable but not selected |
| C03 Welcome link | `communityConcierge.sendConciergeWelcome` | `guideChannelId` | channel fetch/DM | Too broad for this slice |
| C04 Bootstrap | legacy bootstrap -> Guide setup | indirect C01 | broad setup | Blocked |
| C05 V3 rebuild | V3 builder -> Guide setup | indirect C01 | broad rebuild | Blocked |

C01 remains the only read expression selected. It has mapper compatibility and
the smallest runtime blast radius; its mutation/persistence remains legacy.
