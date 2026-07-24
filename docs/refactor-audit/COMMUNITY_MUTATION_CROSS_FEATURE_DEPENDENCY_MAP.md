# Community Mutation Cross-feature Dependency Map

## Dependency direction

```text
Interaction/event entry
  -> legacy compatibility dispatcher or command handler
  -> Community runtime helper
  -> Discord object and JSON record mutation
  -> optional server-log / panel / guide / Voice refresh
```

The map identifies runtime dependencies, not desired future architecture.

| Owner boundary | Directly owns | Hard runtime dependencies | Downstream / best-effort dependencies | Must not absorb during first migration | Boundary risk |
| --- | --- | --- | --- | --- | --- |
| Guide mutation | guide/roadmap channel and tracked messages | guide/roadmap read composition, onboarding JSON, permission template | bootstrap/V3 callers, member-add DM guide link | role selection, native onboarding, panels | medium |
| Panels | tracked channel panel messages and records | panel record JSON, channel resolver, payload builder | ticket/voice/roles button consumers; game approval/rebuild refresh | Ticket creation, voice lifecycle, game creation | high fan-out |
| Bootstrap | canonical Community layout creation/reconciliation | architecture config, registry, channels, roles, permission sync | Guide/panel refresh, game entry metadata, logs | destructive maintenance policy, Ticket/Voice behavior | critical |
| Roles | configured Community roles and assignments | hierarchy, role config, member role cache | Guest Gate visibility sync, onboarding, concierge, Night Crew | general moderator role admin | high shared state |
| Onboarding | member-add guest/welcome/reminder flow | MemberGuard evaluation, welcome settings, role helper, Guide record | concierge DM, guest gate, logs | Guide publication and role select UI | medium |
| Proposals | suggestion state/card and accepted dynamic game setup | game identity, suggestion/category JSON, structure helper | create-entry metadata, panels, Voice Hub/LFG, logs | full Community rebuild and Voice implementation | critical |
| Permission maintenance | planned overwrite synchronization | permission matrix/template, roles, channels, plan store | bootstrap/rebuild flows, Guest Gate | role creation/assignment and architecture policy design | high |
| Destructive maintenance | confirmed rename/move/delete action execution | plan records, protected-resource metadata, channels, logs | registry cleanup, panels/guide may later refresh | Voice/Ticket business rules; AI planning | critical |
| Voice (excluded) | temp room lifecycle and recovery | channelDelete/ready, voice metadata | Hub/LFG/activity | all Community slice migrations | protected external |

## Cross-feature call sites requiring preservation

| Caller | Callee | Current intent | Migration implication |
| --- | --- | --- | --- |
| bootstrap/V3 builder | `setupCommunityGuide`, `setupRoadmapPanel` | refresh persistent entry messages after structure work | retain as best-effort adapter until Guide mutation port exists |
| bootstrap/V3 builder | `setupChannelPanels` | refresh panels after channels exist | panel publisher must preserve callable compatibility facade |
| proposal approval | `setupChannelPanels` | publish game panel after category build | approval slice must not recreate panel behavior |
| proposal approval | create-entry registration / Voice Hub schedule | make dynamic game Voice-compatible | keep these as external ports, not copied logic |
| guildMemberAdd | `sendConciergeWelcome` | DM guide link after welcome flow | Onboarding slice needs a Guide-link port |
| role selection/concierge | permission/Guest Gate semantics | role grants affect visibility | role slice must expose outcome without duplicating permission rules |
| maintenance executor | server logs | audit destructive actions | logging remains cross-cutting infrastructure |

## Isolation notes

- Guide Status has no runtime node because it has no active mutation consumer.
- Dashboard is represented as `Unknown` until a route is proven to call a
  Discord/data mutator; current Discovery does not infer one from a UI label.
- Voice, Ticket and security dependencies are boundary constraints. They are not
  candidates to migrate as part of the six Community mutation boundaries.
