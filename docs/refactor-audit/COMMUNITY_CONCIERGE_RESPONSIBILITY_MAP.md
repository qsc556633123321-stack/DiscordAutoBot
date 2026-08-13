# Community Concierge Responsibility Map

Source audited: `src/systems/communityConcierge.js` at `288874b`.

| Area | Current owner | Status | Notes |
| --- | --- | --- | --- |
| Filesystem path/read/create | Runtime | Active | `DATA_DIR`, `ONBOARDING_FILE`, `ensureFile`, and `readJson` feed reader construction. |
| Onboarding state reads | Infrastructure reader | Runtime-active | Guide, Roadmap, and Welcome each construct `CommunityOnboardingStateReader` per invocation. |
| Tracked message/channel identity | Compatibility adapters | Runtime-active | Message adapter serves Guide/Roadmap; channel adapter serves Welcome. |
| Guide publication lookup/mutation/persistence | Existing boundaries | Closed | Runtime orchestrates approved pair and persistence feature. |
| Roadmap publication lookup/mutation/persistence | Existing boundaries | Closed | Runtime orchestrates approved pair and persistence feature. |
| Guide/Roadmap channel ensure and permissions | Runtime | Active | Direct category/channel creation, parent movement, and overwrite application remain. |
| Welcome delivery | Runtime plus application payload builder | Partially migrated | Tracking and payload builder are bounded; channel resolution and member DM remain runtime-owned. |
| Role quick actions | Runtime | Active | Button path performs role lookup and `member.roles.add`. |
| Button routing and replies | Runtime | Active | `handleConciergeButton` owns custom IDs and ephemeral replies. |
| AI concierge text | Runtime | Active | Dynamic OpenAI client, prompt, fallback, and swallow behavior remain local. |
| Event registration | External event module | Active caller | `guildMemberAdd` invokes `sendConciergeWelcome`; Concierge exports callable functions only. |

No raw onboarding record fields are read directly by the active Guide, Roadmap,
or Welcome paths. No direct runtime persistence bypass is present.
