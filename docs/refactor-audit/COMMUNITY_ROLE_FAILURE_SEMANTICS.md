# Community Role Failure Semantics

`maybeAddRole` returns `false` for a missing member/guild/bot permission,
missing role, non-editable role, or insufficient bot hierarchy. It does not
throw for those conditions.

`member.roles.add` is awaited with reason `Community concierge quick role`, but
its rejection is swallowed and the function then returns `true`. Therefore the
current UI can report success after a Discord mutation rejection. This is a
frozen compatibility behavior, not a behavior to improve in the first slice.

Unexpected errors escaping `handleConciergeButton` are caught by the legacy
dispatcher, logged with `console.error`, and receive its generic ephemeral
reply only when no reply/defer has occurred.
