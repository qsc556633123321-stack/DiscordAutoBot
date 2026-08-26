# Server Governance Destructive Safety

There is no archive path, archive category, soft delete, or move-to-archive
action. Ambiguous resources remain `REVIEW`; destructive execution accepts only
approved `SAFE_DELETE` actions.

Before deletion, preflight requires exact expected state and rejects protected,
runtime, ticket, unknown, and user-managed resources. Non-destructive actions
must finish without failure before deletion begins. Categories are deleted only
when empty; recursive deletion is prohibited.

The result contract records `operationId`, plan fingerprint, timestamps, mode,
per-action status, and a summary. Future production audit logs must contain
operator, guild, fingerprint, actions, and failures, but never credentials.
