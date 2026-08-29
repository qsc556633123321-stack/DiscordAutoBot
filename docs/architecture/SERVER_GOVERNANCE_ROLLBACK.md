# Server Governance Rollback

Completed reversible work is rolled back in reverse execution order. Rename restores the recorded name, move restores the recorded parent, permission changes use the captured overwrite snapshot, and transaction-created resources are deleted only after identity verification. Deletes are irreversible and are never recreated. Any failed or unsafe rollback produces `PARTIAL_ROLLBACK`; no archive fallback exists.
