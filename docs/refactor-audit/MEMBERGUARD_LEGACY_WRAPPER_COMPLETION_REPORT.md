# MemberGuard Legacy Wrapper Completion

## Completed

`memberguard-settings` and `memberguard-release` now retain their legacy file paths as direct thin wrappers over their Phase 7.1 presentation commands.

## Ownership

- Presentation: `src/presentation/commands/memberguardSettingsCommand.js` and `memberguardReleaseCommand.js`
- Application: update-settings and release-member use cases
- Infrastructure: MemberGuard permission and role gateways
- Composition: `src/composition/memberGuardFeature.js`

The wrappers do not perform option parsing, permission checks, Discord mutations, replies, logging, or business-rule evaluation.

## Compatibility

- Slash command name, description, options, defaults, aliases, registry registration, and deploy payload are unchanged.
- `data.toJSON()` and `execute` references match the presentation commands.
- The active registry resolves both aliases to the same presentation exports without duplicate command registration.
- `src/systems/memberGuard.js`, MemberGuard JSON data, and all non-MemberGuard features remain unchanged.

## Verification

The migration regression test checks export identity, payload equality, active alias resolution, ephemeral defer behavior, success replies, and partial-failure handling. Legacy-boundary tests reject wrapper imports or logic beyond a direct presentation re-export.

## Rollback

Revert this commit to restore the previous legacy command bodies. There is no data migration and no forced deployment.

## Remaining Work

MemberGuard is `Migrated / Wrapper Remaining`. Its unrelated message and member-join compatibility paths remain outside this phase; no additional legacy feature is migrated here.
