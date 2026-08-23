# Server Governance Model

Server Governance v1 models a persistent resource by canonical key, display name, type, purpose, owner, parent identity, access profile, lifecycle, importance, and delete policy. Identity resolution is deterministic: known canonical mapping, exact identity, known legacy name, structural match, then unknown.

The planner is read-only. It emits only `KEEP`, `CREATE`, `MOVE`, `RENAME`, `PERMISSION_CHANGE`, `SAFE_DELETE`, `REVIEW_DELETE`, `REVIEW`, or `CONFLICT`; no archive action exists. Specific game categories require `game:<gameId>` and the parent `game` role alone does not grant access to all game categories.
