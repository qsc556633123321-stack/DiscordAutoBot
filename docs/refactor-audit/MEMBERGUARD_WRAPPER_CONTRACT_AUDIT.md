# MemberGuard Wrapper Contract Audit

## Commands

| Alias path | Presentation path | Export contract |
| --- | --- | --- |
| `src/legacy/commands/memberguard-settings.js` | `src/presentation/commands/memberguardSettingsCommand.js` | `data`, `execute`, `createMemberguardSettingsCommand` |
| `src/legacy/commands/memberguard-release.js` | `src/presentation/commands/memberguardReleaseCommand.js` | `data`, `execute`, `createMemberguardReleaseCommand` |

The wrappers use direct CommonJS re-exports. This preserves all enumerable presentation exports, including future optional `autocomplete`, aliases, cooldown, permissions, and metadata fields without recreating a partial command object.

## Compatibility Checks

- `data.toJSON()` is identical between each alias and presentation command.
- `execute` is the same function reference.
- `aliasRegistry` resolves the active alias to the presentation export.
- `commandRegistry` exposes the same deploy payload.
- Slash names, descriptions, options, default permissions, aliases, and ephemeral reply behavior remain presentation-owned and unchanged.

## Boundary

Each wrapper is one direct `require()` statement. It contains no Discord.js import, SlashCommandBuilder, interaction parsing, replies, business rules, service/system import, mutation, logging, or error handling. Runtime behavior is therefore owned by the existing presentation, application, infrastructure, and composition layers.

## Rollback

Reverting this commit restores the prior legacy implementations. No data migration, deployment payload change, or command rename is involved.
