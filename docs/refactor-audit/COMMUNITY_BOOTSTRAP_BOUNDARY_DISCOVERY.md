# Community Bootstrap and Rebuild Boundary Discovery

## Entry and owner map

| Entry / runtime | Structure planning | Layout mutation | Role / permission mutation | Panel / Guide publish | Metadata | Voice / games | Archive/delete | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/bootstrap-community` -> `communityBootstrapSystem` | yes | yes | yes | indirect | layout registry | indirect | dedupe/archive | Orchestration |
| `/rebuild-community-v3` -> V3 builder runtime | yes | yes | yes | yes | V3 plans / game metadata | create entries | archive legacy items | Orchestration |
| `/community-architect` -> planner/executor | yes | yes | permission sync | no direct guide publish | architect plans | game category placement | archive duplicate game category | Orchestration |
| `serverPolisher` | yes | yes | role creation/edit/overwrites | native setup notes | polish plans | indirect | no core delete path | Layout / roles orchestration |
| `serverRebuilder` | template plan | yes | partial | panels indirectly | rebuild plans | protects temp voice/tickets | archive or bounded delete | High-risk rebuild |
| `communityStructureManager` | limited ensure | create categories/channels/roles | special overwrites | no | none/direct | suggestion/archive categories | archive category ensure | Shared structural helper |
| `factoryResetRuntime` | reset plan | delete categories/channels | delete eligible roles | rebuild/panel/roles after reset | clears records | temp voice/panels | direct delete | Separate destructive orchestration |

## Boundary answers

1. **Layout-owned:** normalization, matching, ordering, category/channel placement, duplicate detection, rename/move, structural plan generation, and reconciler execution.
2. **Permission Repair-owned:** overwrite templates, Guest Gate access, category-child synchronization, onboarding visibility checks, and overwrite failure reporting.
3. **Voice-owned:** active Temp Voice protection, create-entry registration, Voice Hub/LFG integration, and any temporary-room lifecycle. Bootstrap only consumes a narrow placement/registration need today.
4. **Orchestration-owned:** command preview/confirm ownership, plan persistence, ordering cross-feature calls, summary aggregation, retry/delay policy, and partial-failure handling.
5. **Not fully idempotent:** stale metadata/message IDs, `force` panel behavior, old-channel archive/delete, manual Discord renames/moves, role hierarchy drift, and partial execution make repeat runs non-transactional.
6. **Can disturb manual adjustments:** canonical naming, ordering, parent changes, permission overwrite sets, role edits/order, dedupe/archive/delete, and template reconciliation.
7. **Preview/confirm:** V3 rebuild, Architect, rebuild server, factory reset, permission repair/dedupe and many cleanup commands use stored plans plus confirmation buttons; bootstrap itself can run preview/execute but has no transaction rollback.
8. **Rollback:** no full rollback. Some plans can be cancelled before execution; after mutation, manual Discord/JSON restoration is required.
9. **Partial-failure summaries:** bootstrap, V3 builder, polisher, rebuilder, Architect, factory reset, and proposal approval gather created/moved/failed/skipped summaries to differing degrees.
10. **Migration order:** Bootstrap execution must wait until Layout planning/mutation, Permission Repair overwrite ports, Game/Voice entry contract, and panel/guide publication boundaries are separately stabilized.

## Planning boundary

The future safe work is a plan-only diagnostic/preview query. Any execute path is blocked by Layout and Permission Repair, with Voice/Game integration as an additional blocker. No bootstrap execution slice is recommended now.
