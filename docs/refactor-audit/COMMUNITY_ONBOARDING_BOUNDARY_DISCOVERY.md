# Community Onboarding Boundary Discovery

## Actual member-entry path

```text
src/index.js dynamic event loader
  -> src/events/guildMemberAdd.js
  -> handleMemberGuardJoin(member)
  -> handleGuildMemberAdd(member)
  -> sendConciergeWelcome(member)
```

The three calls are sequential `await`s with independent `try/catch` blocks in the event handler. A MemberGuard failure is logged and does not prevent Welcome; a Welcome failure is logged and does not prevent the Concierge DM; Concierge failure is logged. This ordering is runtime behavior and must be preserved.

## Boundary facts

| Question | Evidence / answer |
| --- | --- |
| MemberGuard step | First. `handleMemberGuardJoin` is called before all Welcome and Concierge behavior. It owns newcomer risk/safe-mode enforcement, not Guide rendering. |
| Welcome step | Second. `handleGuildMemberAdd` reads welcome settings, deduplicates recent joins in memory, finds the welcome/rules channels, may ensure and assign guest role, posts welcome, attempts DM, and schedules one reminder. |
| Concierge step | Third. `sendConciergeWelcome` reads onboarding state, resolves recorded/fallback Guide channel, then attempts a DM with Guide link and `/help-me-start`. |
| Roles created | Welcome can create a guest role if no compatible guest role exists. Role Manager separately creates self-assignable roles. |
| Roles added/removed | Welcome adds guest role. Role Manager select handling adds/removes formal roles and can remove/restore guest role. MemberGuard may apply its own restriction behavior. |
| Visibility changes | `guildMemberAdd` itself does not write overwrites. Visibility is indirectly determined by guest/formal roles; Guide setup separately applies onboarding visibility overwrite. |
| JSON reads | `welcome-settings.json`, `onboarding-flows.json`; MemberGuard settings are read by its service. |
| JSON writes | Welcome settings command writes `welcome-settings.json`; Guide setup writes `onboarding-flows.json`; member-add path itself mainly uses in-memory duplicate/reminder state. |
| Onboarding state | Yes: onboarding flow stores Guide/Roadmap IDs and native task recommendations; welcome has per-guild settings plus reminder map. |
| Native Discord onboarding | Inspection/recommendation facts exist. This scan found no independent native Discord onboarding writer in the member-add path. |
| Verification | No single atomic completion state. Guest removal/formal-role selection is the practical verification transition. |
| Retry/reminder | Welcome has a ten-minute, once-per-member reminder using `setTimeout` and an in-memory reminder set. Role cleanup has retry for rate limits, but is separate. |
| Partial failure | Yes. Missing permissions, role hierarchy, disabled DMs, missing Guide channel, JSON errors, and member fetch failures can produce partial onboarding. |
| Swallowed errors | DM sends and several channel/message operations use `catch(() => null)`; event handler logs top-level errors and continues. |
| Idempotence | Not fully. Welcome has a ten-minute in-memory duplicate guard; process restart loses it. Guest add is mostly idempotent, messages/DMs are not. |
| Rollback | No transaction. Manual role/message/JSON correction is required. |
| Permission Repair dependency | Role meanings are interpreted by Permission Matrix/Guest Gate; onboarding does not directly repair permission overwrites. |
| Layout dependency | Only name-based channel lookup and Guide channel placement; no direct layout execution in member-add. |
| Read-only status candidate | Yes, member entry / Guide / role state can be queried without sending or assigning. |

## Minimal capabilities grounded in current behavior

| Capability | Current source | Kind | Notes |
| --- | --- | --- | --- |
| `GetOnboardingStatus` | onboarding JSON + guild channel facts | Read | Must not call `getOrCreate*`. |
| `GetMemberEntryState` | member roles + MemberGuard/welcome facts | Read | Needs an explicit cross-feature read contract. |
| `GetWelcomeSettings` | Welcome System | Read | Existing JSON contract. |
| `BuildWelcomePayload` | Welcome System | Renderer | Pure once member/channel URLs are supplied. |
| `AssignGuestRole` | `ensureGuestRole` | Mutation | Creates role when absent, then adds it. |
| `SendWelcomeMessage` | `handleGuildMemberAdd` | Mutation | Channel message lifecycle. |
| `SendWelcomeDm` | Welcome System | Mutation | DM failure is intentionally non-fatal. |
| `SendConciergeWelcome` | Concierge | Mutation | Separate DM step after Welcome. |
| `ScheduleRoleReminder` | Welcome System | Deferred mutation | In-memory timer; not durable. |
| `CompleteOnboarding` | Role Manager selection transition | Mutation | Existing behavior is role/guest lifecycle, not a separate stored completion flag. |
| `UpdateVisibility` | Permission Repair / Guide setup | Shared mutation | Not onboarding-owned. |
| `ReconcileMemberState` | MemberGuard + Role Manager inheritance | Deferred orchestration | Crosses MemberGuard, Roles, and Permission Repair. |

## Migration boundary

The safe future read slice is `GetOnboardingStatus` or `GetMemberEntryState`; it must consume facts from MemberGuard, Roles, and Guide without importing their mutation runtimes. Event sequencing, guest assignment, reminders, DMs, and reconciliation are mutation/event slices and remain deferred.
