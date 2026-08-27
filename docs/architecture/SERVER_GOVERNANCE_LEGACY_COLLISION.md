# Server Governance Legacy Collision Audit

## Release Gate: `PHASE_4_REWORK_REQUIRED`

`auto-organize`, `deep-cleanup`, `rebuild-server`, `factory-reset-server`,
`ai-reorganize-server`, `restore-active-channels`, and
`apply-role-permissions` are still active legacy mutation paths. Their mutation
and/or archive semantics can conflict with the governance desired state.
`cleanup-empty-categories` also remains legacy-owned.

This is a blocking collision, not a completed disablement. Before a major
governance release, these commands require an explicit disablement or a shared
hard guard that prevents them from mutating governed resources. No startup hook
invokes the listed commands: ready startup restores TempVoice/LFG operational
state only and does not rebuild categories or rewrite permissions.
