# Server Governance Production Rollout

This procedure is blocked while the legacy collision audit is
`PHASE_4_REWORK_REQUIRED`. It does not authorize deployment.

1. Add and validate the legacy mutation collision guard with execution disabled.
2. Run production preview and dry-run.
3. Review projected tree, permissions, and safe deletes.
4. Adjust GitHub desired state if needed.
5. Only after separate approval, enable execution, confirm the fresh plan and
   delete count, execute, smoke-test, and observe.

This document is a future procedure; it does not authorize deployment.
