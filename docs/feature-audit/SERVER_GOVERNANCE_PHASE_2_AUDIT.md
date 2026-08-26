# Server Governance Phase 2 Audit

Phase 2 adds complete desired structure and a full preview, not execution. It eventually replaces preview/planning responsibilities from `auto-organize`, `deep-cleanup`, `rebuild-server`, `cleanup-empty-categories`, `factory-reset-server`, `ai-reorganize-server`, `restore-active-channels`, and `apply-role-permissions`; those legacy commands remain unchanged.

The preview path is inventory read -> pure desired state -> pure planner -> renderer. No mutation gateway is reachable. Runtime voice, tickets, user-managed, and unknown resources remain protected or review-only.
