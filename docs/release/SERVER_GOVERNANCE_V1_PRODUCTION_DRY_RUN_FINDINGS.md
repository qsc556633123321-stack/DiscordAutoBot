# Server Governance v1.1 Production Dry-run Findings

The read-only production finding was not permission or deletion safety failure:
it was identity reconciliation. Literal role-name matching incorrectly treated
the guild owner and valid Administrator roles as absent. Flat channel-name
matching also treated `聊天` beneath different game categories as duplicate.

v1.1 resolves logical owner/admin/mod principals, resolves categories before
children, and keys game children by their canonical parent. It does not
auto-approve UNKNOWN resources or review actions. Existing compact split and
voice-only legacy text layouts remain manual review/delete candidates.

Expected production-shaped dry-run outcome: no missing logical owner/admin,
no false ambiguous duplicate identities, zero Discord writes, zero archive
actions, zero protected deletes, and zero unknown automatic deletes. Legitimate
manual reviews can still block execution. Execution remains disabled.
