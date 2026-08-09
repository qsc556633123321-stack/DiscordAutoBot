# Guide Post-Persistence-Redirect Legacy Search

| Search target | Classification | Result |
| --- | --- | --- |
| `messages.fetch` | Allowed infrastructure | Not called directly by Guide runtime; lookup port owns it. |
| `message.edit` | Allowed infrastructure | Not called directly; mutation port owns it. |
| `channel.send` | Allowed infrastructure | Not called directly; mutation port owns it. |
| `saveOnboarding` | Shared helper | Definition remains; Guide runtime caller removed. |
| Direct filesystem | Legacy/shared read helper | `readOnboardingData` remains for Guide tracked publication state. |
| Direct repository | None | No Guide runtime repository use. |
| Generic execute | None | Runtime only calls `communityGuidePersistenceFeature.persist`. |

The next closure audit must distinguish the remaining shared read/helper
responsibilities from actual legacy-owned Guide mutation or persistence paths.
