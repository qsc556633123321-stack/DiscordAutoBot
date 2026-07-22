# Phase 7 Scope: MemberGuard Vertical Slice

## Included

1. Pure member eligibility and enforcement policy.
2. Guild-scoped JSON settings repository through `jsonStore`.
3. Status query and member evaluation use cases.
4. Composition root and active service facade.
5. Runtime adapters for `messageCreate` and `guildMemberAdd` paths.
6. `/memberguard-status` default wiring through composition.
7. Domain, application, repository, composition, runtime, and migration tests.

## Explicitly excluded

- Slash-command mutation flows such as settings and release.
- Legacy interaction dispatcher, Community, Voice, Layout, Permission repair, and channel deletion.
- Discord deployment metadata and aliases.
- `.env`, production JSON data, and any token or secret.

## Completion target

The active MemberGuard service has no direct import of `src/systems/memberGuard.js` or `src/legacy/**`. The legacy status command stays a thin wrapper. Feature status is `Migrated / Wrapper Remaining`, not `Fully Legacy Free` while unrelated consumers still use the retained system source.
