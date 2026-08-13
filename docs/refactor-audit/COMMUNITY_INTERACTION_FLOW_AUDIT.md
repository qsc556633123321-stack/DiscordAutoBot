# Community Interaction Flow Audit

## Flow present

`legacyInteractionRuntime` forwards custom IDs starting with `concierge_` to
`handleConciergeButton`. The handler selects five known paths, may resolve
channels or assign a role, and sends an ephemeral reply. The legacy dispatcher
catches handler failure and replies only when the interaction is not already
acknowledged.

The interaction owner remains legacy/runtime combined. This audit freezes the
custom IDs and reply behavior; it does not approve dispatcher or button changes.
