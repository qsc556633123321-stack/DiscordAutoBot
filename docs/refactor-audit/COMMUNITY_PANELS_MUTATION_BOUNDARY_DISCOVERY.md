# Community Panels Mutation Boundary Discovery

`setupChannelPanels` is active through `/setup-channel-panels` and indirectly through rebuild/proposal flows. The legacy runtime owns payload construction, message send/edit/delete, `channel-panels.json` persistence, target selection, and button contract registration in one unit.

The force path only deletes the recorded bot panel message, but message and JSON-record consistency remains a partial-failure risk. Panels depend on role selection, Ticket, Temp Voice, game proposal, and Guide navigation custom IDs. Treat Panels as a separate bounded context; do not fold it into Guide Publish merely because both send embeds.
