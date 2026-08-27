# Server Governance Production Rollout

This document is a future procedure; it does not authorize deployment.

1. Deploy with `SERVER_GOVERNANCE_ENABLED=true` and
   `SERVER_GOVERNANCE_EXECUTION_ENABLED=false`.
2. Run production preview and dry-run.
3. Review projected tree, permissions, and safe deletes.
4. Adjust GitHub desired state if needed.
5. Only after separate approval, enable execution, confirm the fresh plan and
   delete count, execute, smoke-test, and observe.

This document is a future procedure; it does not authorize deployment.
