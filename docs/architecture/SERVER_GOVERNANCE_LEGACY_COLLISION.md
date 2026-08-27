# Server Governance Legacy Collision Audit

## Release Gate: `PASS`

`SERVER_GOVERNANCE_ENABLED=false` keeps legacy behavior compatible. When it is
`true`, one centralized policy blocks every conflicting legacy structural path
before it can create a plan or call the legacy implementation. The same policy
also blocks saved confirmation buttons, so a plan created before enablement
cannot later mutate governed resources.

`BLOCK_WHEN_GOVERNANCE_ENABLED`: `auto-organize`, `deep-cleanup`,
`rebuild-server`, `cleanup-empty-categories`, `factory-reset-server`,
`ai-reorganize-server`, `restore-active-channels`, `apply-role-permissions`,
`ai-layout-repair`, `archive-inactive-games`, `bootstrap-community`,
`community-architect`, `dedupe-layout`, `fix-game-category`,
`game-registry-doctor`, `move-channel`, `plan-cleanup`,
`polish-server-design`, `rebuild-community-layout`, `rebuild-community-v3`,
`rename-channel`, `repair-channel-permissions`, `setup-community-guide`,
`setup-game`, `setup-roles`, `setup-server`, and `suggest-game`.

`SAFE_OPERATIONAL`: TempVoice creation/cleanup, ticket lifecycle, LFG
restoration, game-role selection, member onboarding, and normal moderation.
These paths do not own governed persistent structure and remain available.

Critical legacy collisions: 0 in governance mode. Startup collisions: 0.
Archive-reachable structural paths: 0. Ready startup restores TempVoice/LFG
operational state only; it does not rebuild canonical structure or permissions.
