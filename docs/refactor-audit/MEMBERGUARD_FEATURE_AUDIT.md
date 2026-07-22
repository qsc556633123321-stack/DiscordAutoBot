# MemberGuard Feature Audit

## Active entry points

| Path | Current responsibility |
| --- | --- |
| `src/events/messageCreate.js` | invokes MemberGuard before AutoMod and announcement handling |
| `src/events/guildMemberAdd.js` | invokes MemberGuard join handling before welcome flows |
| `src/presentation/commands/memberGuardStatusCommand.js` | preserves `/memberguard-status` interaction payload and reply order |
| `src/services/security/memberGuardService.js` | active compatibility facade used by event handlers |

## Legacy and compatibility paths

- `src/legacy/commands/memberguard-status.js` is an alias-loaded thin wrapper and must remain.
- `src/systems/memberGuard.js` is retained unchanged as rollback source and is still used by unrelated pre-existing consumers. It is not used by the migrated active service facade.
- Legacy interaction and command paths remain out of scope. They are not modified by this migration.

## Data and semantics discovered

- Settings are guild-scoped in `member-guard-settings.json`.
- Member identity and role exemptions are ID-based; new policy normalizes numeric Discord IDs.
- Existing settings support enabled state, guest lockdown, safe mode, new-account age, timeout, join-burst limits, and whitelisted roles.
- Runtime behavior includes message guard enforcement, join guest-role assignment, join-burst safe mode, temporary warnings, audit logging, manual release, and guest visibility permissions.

## Migration boundary

This phase migrates policy evaluation, settings reads/writes, status querying, composition, and the two active event enforcement paths. It does not migrate unrelated moderation, bulk role work, guild permission repair, voice lifecycle, layout, community rebuild, channel deletion, or legacy interaction dispatch.

## Risks retained deliberately

- The JSON shape is preserved; no data migration occurs.
- Discord mutations remain in the runtime adapter so application/domain code stays pure.
- Existing legacy consumers may still call `src/systems/memberGuard.js`; removing them is a later, separately tested migration.
