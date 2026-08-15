# Community Role Button Dispatch Coupling Audit

Risk: **MEDIUM**.

The role actions are reached only through the legacy `concierge_*` dispatcher.
Moving role business logic without changing that branch is feasible, but moving
the interaction presentation or routing at the same time would alter its
catch-and-reply behavior. The current `roleButtons` module does not own these
custom IDs.

Recommended sequence: isolate the role quick-action use case and its Discord
mutation adapter first; retain `handleConciergeButton` as the presentation and
dispatcher-facing wrapper for the first migration.
