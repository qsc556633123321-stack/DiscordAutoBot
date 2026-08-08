# Community Guide Message Lookup Mutation Adapter Interaction

Lookup occurs before Plan selection. The mutation adapter executes the selected
Edit or Send and must not fetch a message defensively. Repeating selection
lookup after Plan could turn a legacy Send branch into an invalid Edit branch,
or add duplicate message/channel lookups.
