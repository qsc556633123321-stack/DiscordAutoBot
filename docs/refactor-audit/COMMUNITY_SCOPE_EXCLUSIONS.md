# Community Scope Exclusions

| Item | Why it looks like Community | Actual owner | Cross-feature relation | Future handling |
| --- | --- | --- | --- | --- |
| Voice channel lifecycle, dynamic rooms, `voiceStateUpdate` | Community exposes game/voice entry channels. | Voice / Temp Voice. | Game suggestions and V3 create-entry metadata consume it. | Deferred; high-risk Voice slice after Community boundaries are stable. |
| `src/legacy/events/channelDelete.js` | Channel removal can affect Community categories. | Voice/Layout cleanup event integration. | May observe Community-owned categories. | Explicitly excluded; migrate with event lifecycle work. |
| Voice cleanup, LFG, Voice Hub | Shared community-facing panels. | Voice. | Community only supplies channel placement/entry metadata. | Do not import Voice internals from Community. |
| General logger / `serverLogs` | Community maintenance emits logs. | Shared infrastructure. | Community should use a log gateway later. | Preserve as generic shared utility. |
| Audit feature | Community commands are audited. | Audit. | Audit reads command registry/docs only; it does not own Community data. | Already migrated; record boundary only. |
| MemberGuard enforcement | Guest role and visibility influence onboarding. | MemberGuard. | Community defines role/category facts; MemberGuard enforces join/message restrictions. | Keep a narrow role/permission API, never import its internals. |
| Organizer memory consumer | Organizer may use server/channel categories. | Organizer + Memory. | Community rebuild/maintenance can be a separate caller, but no current ownership transfer. | Already migrated consumer remains untouched. |
| Generic Discord utilities | Discord channel/permission operations appear in Community paths. | Infrastructure. | Community consumes repositories/writers. | Keep reusable and feature-neutral. |
| Generic permission writer | Permission repair uses it. | Infrastructure. | Community policy plans should call it through a port/gateway. | Do not duplicate permission mutation logic. |
| Dashboard generic infrastructure | Dashboard has guild/channel/role pages. | Dashboard. | No confirmed Community domain write contract exists. | Discover separately; no Dashboard migration in this phase. |
| Command registry / alias registry / deploy scripts | They expose Community commands. | Presentation/runtime infrastructure. | Dynamically loads aliases, making legacy files runtime-required. | Change only in a command-router migration. |
| Layout runtime and AI layout planner | They classify Community categories/channels. | Layout. | Community supplies semantic facts and receives plans. | Treat as high-coupling dependent, not Community Core. |

The exclusion does not mean "unrelated." It means a Community migration must integrate through a declared API rather than absorb the other feature's runtime.
