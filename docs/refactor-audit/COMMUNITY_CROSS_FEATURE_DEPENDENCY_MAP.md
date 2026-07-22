# Community Cross-feature Dependency Map

| Boundary | Direction / paths | Runtime/data exchange | Boundary assessment and migration action |
| --- | --- | --- | --- |
| Community -> Memory | No active direct Community service dependency found; `server-memory.json` appears in broader organizer/cleanup searches. | Channel-rule data is Organizer-owned. | Keep separate. Do not make Community read Memory storage directly. |
| Community -> Organizer | Legacy rebuild/maintenance commands may be invoked beside organizer tooling; `communityService` has no active Organizer import. | Shared Discord channel topology only. | Preserve separation; future integration accepts a plain maintenance request/result. |
| Community <-> MemberGuard | `guildMemberAdd` runs MemberGuard then welcome; `roleManagerRuntime` and guest gate share role/category expectations. | Guild member, role IDs, Guest/Member access facts. | High coupling. Community supplies policy facts; MemberGuard owns enforcement/mutation. No direct internal imports in target design. |
| Community -> Audit | `/dev` audit inventories Community commands through registries/docs. | Command metadata/report only. | Read-only observer. Audit stays independent. |
| Community -> Voice | V3/game suggestion paths create voice entry channels and call guide/panel integrations; Temp Voice reads game/create-entry metadata. | Channel IDs, game IDs/display names, Voice Hub/LFG placement. | Very high. Community must publish a narrow game-entry/channel-placement contract; it must not call Voice lifecycle internals. |
| Community <-> Layout | `communityRebuildService` delegates bootstrap/polish; layout rules call `communityPermissionService`. | Guild categories/channels, plans, normalized names, actions. | Very high and currently bidirectional at behavior level. Separate structural intent from layout decision/execution before migration. |
| Community -> Permission Repair | `communityPermissionService` imports legacy guestGate/rolePermissions; layout permission policy invokes it. | Category keys, role inheritance, overwrite plans. | Very high. Split policy facts, plan creation, and Discord overwrite application later. |
| Community -> Dashboard | Dashboard files expose servers/roles/announcements views but no proved Community feature composition root. | API/read models, likely mock/placeholder data. | Unknown / low current runtime evidence. Keep out of Community first slice. |
| Community -> Registry | command registry/alias registry dynamically loads legacy commands; `index.js` dynamically loads events. | Discord command definitions and event modules. | Presentation infrastructure. Preserve existing registry behavior until every alias has a replacement. |
| Community -> Discord runtime | Legacy commands and systems receive `interaction`, `guild`, `channel`, `member` directly. | Discord.js objects, replies, mutations, embeds. | Architecture violation for eventual application layer. Presentation/adapters must translate to IDs/plain facts. |

## Required target direction

```text
Presentation (command/event adapter)
  -> Community application use case
  -> Community domain policy
  -> port
  -> infrastructure Discord/JSON gateway

Community -> Voice, MemberGuard, Layout, Permission Repair
  only through a narrow request/result contract; never through runtime-module imports.
```

Current allowed legacy imports are documented in `src/config/legacyBoundaryAllowlist.js`; discovery does not add or remove any entry.
