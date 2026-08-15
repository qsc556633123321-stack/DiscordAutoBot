# Community Button Handler Return Semantics

`handleConciergeButton(interaction)` returns `true` for the six known exact
IDs and `false` for an unrecognized ID. It may throw before any reply, after a
reply has occurred, or after a deferred interaction in future behavior.

The legacy prefix dispatcher does not branch on that value. It always returns
from the `concierge_*` branch with JavaScript `undefined`. Therefore an unknown
`concierge_unknown` is treated as handled at the prefix level, creates no reply,
and does not fall through to another legacy button family.
