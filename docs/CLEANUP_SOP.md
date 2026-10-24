# KU HUB Cleanup SOP

1. Capture a read-only Discord snapshot and hash normalized content.
2. Normalize aliases and resolve only unambiguous channel/role bindings.
3. Compare against the explicit rule version; compile an immutable plan.
4. Require administrator approval for deletes and bulk permission operations, preserving approval/rejection reasons.
5. Immediately before each mutation, verify the target ID and expected state again.
6. Execute each action independently, record its outcome, and stop or compensate according to the transaction policy.
7. Re-read affected Discord state and verify the requested result.
8. Append a redacted audit log with correlation ID, actor, outcome, and failure reason when applicable.

## Recovery

- Create/rename/move/permission actions may have compensating actions if their pre-state is known.
- A deleted channel cannot be fully restored; recovery can only recreate structure/content where separate backups exist.
- Any fresh-state mismatch, missing approval, or unexpected child resource blocks execution.
