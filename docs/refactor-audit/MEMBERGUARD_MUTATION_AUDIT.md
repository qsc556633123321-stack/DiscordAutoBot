# MemberGuard Mutation Audit

## `/memberguard-settings`

The legacy command parses nine optional settings, validates guild and `ManageGuild`, persists a guild-scoped patch, optionally applies guest visibility overwrites to every channel, and renders an ephemeral summary. The new path separates this into an application settings use case, a permission action plan, and a Discord permission gateway.

## `/memberguard-release`

The legacy command validates guild and `ManageGuild`, resolves a target user, removes the guest role when present, adds the formal-member role when present, and replies ephemerally. The new path separates the ID-only release plan from the Discord member-role gateway.

## Runtime routing

`src/modules/commands/aliasRegistry.js` now replaces only these two names with presentation commands after loading legacy aliases. The interaction dispatcher still resolves commands through `interaction.client.commands`; therefore Discord receives the new path without changing command names, deploy metadata, options, permissions, or aliases.

## Compatibility and risks

- Legacy command sources are deliberately not edited because this phase protects `src/legacy/**`; they remain rollback sources rather than literal rewritten thin wrappers.
- The active path no longer calls `src/systems/memberGuard.js` for these commands.
- Permission and role gateways continue after individual failures and return summaries; no compensating rollback is attempted because the old implementation also had non-transactional Discord side effects.
