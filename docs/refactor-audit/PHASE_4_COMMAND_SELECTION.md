# Phase 4 Command Selection

## Selected Read-only Batch

| Legacy command | Alias/runtime evidence | Read path | Mutation review | Migration shape | Regression coverage | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| `src/legacy/commands/dev-audit-commands.js` | Dynamically loaded by the alias registry; no grouped alias replacement. | Local command audit report only. | No channel, role, member, guild, permission overwrite, voice, or community/layout operation. | presentation -> application -> project audit gateway. | Mock report and reply payload. | Restore its prior file body. |
| `src/legacy/commands/memory-list.js` | Dynamically loaded by the alias registry; deployed command name retained. | Server memory rule list only. | No write path; no Discord mutation. | presentation -> application -> read-only memory gateway. | Guild/permission/empty/error reply payloads. | Restore its prior file body. |
| `src/legacy/commands/memberguard-status.js` | Dynamically loaded by the alias registry; deployed command name retained. | Existing Member Guard status API only. | No guard setting update, timeout, role, member, or channel mutation. | presentation -> application -> existing read service. | Deferred status and no-guild payloads. | Restore its prior file body. |

## Deliberately Excluded

- Event, voice, interaction dispatcher, community, layout, permission, panel, game-category, and destructive commands are outside this batch.
- `analyze-server` is read-only but has a broad independent analysis body, so it is not a low-risk template candidate.
- Commands that can repair, create, modify, archive, delete, or update settings are excluded even if their previews are read-only.

## Contract Preservation

Each selected legacy file keeps the same exported `data` and `execute` surface, the same slash-command name, the same default member permission, and the same reply/defer behavior. The new presentation command owns the implementation; the legacy file remains a thin wrapper for rollback and deployed alias compatibility.
