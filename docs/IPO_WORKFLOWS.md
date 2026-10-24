# KU HUB IPO Workflows

## Cleanup planning

| IPO stage | Contract |
| --- | --- |
| Input | Guild ID, immutable Discord snapshot, desired rule version, approved review decisions |
| Process | Normalize IDs and game aliases; compare canonical bindings; create deterministic plan fingerprint |
| Output | Ordered cleanup actions, required approvals, compensating-action data, audit events |

Identical snapshot content and rule version must yield the same plan fingerprint and ordered action list. A completed fingerprint cannot create another resource: execution first validates the current snapshot and prior action/receipt state.

## Permission change

| IPO stage | Contract |
| --- | --- |
| Input | Binding ID, before overwrite summary, requested canonical policy |
| Process | Verify manager approval and fresh channel identity, apply one operation, read back result |
| Output | completed/failed action and redacted audit entry |

Deletes and broad permission changes require administrator approval. A partial Discord API failure is recorded per action; it never marks the batch as successful. Rename/move/permission operations can carry compensation data. Deleted channels are irreversible and must be recorded as such.

## Example

`VALORANT`, `特戰`, and `特戰英豪` normalize to one canonical game ID. A second binding for the same guild/canonical key is rejected even if the incoming channel name differs.
