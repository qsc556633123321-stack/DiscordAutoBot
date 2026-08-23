# Server Governance Model Audit

Legacy commands reviewed: `auto-organize`, `deep-cleanup`, `rebuild-server`, `cleanup-empty-categories`, `factory-reset-server`, `ai-reorganize-server`, `restore-active-channels`, and `apply-role-permissions`.

| Area | Status |
| --- | --- |
| `apply-role-permissions` | KEEP; current permission repair remains runtime-owned. |
| `auto-organize`, `deep-cleanup`, `rebuild-server`, `ai-reorganize-server`, `factory-reset-server` | DEPRECATE_LATER; legacy paths include mutation and archive behavior. |
| `cleanup-empty-categories`, `restore-active-channels` | REPLACED_BY_GOVERNANCE planning semantics in the future; no runtime replacement in Phase 1. |

Phase 1 owns only model, read-only inventory contract, and pure planning. It makes no Discord mutation and is not production deployment ready.
