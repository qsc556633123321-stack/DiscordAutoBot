# Community Guide Message Lookup Adapter Preparation Blockers

No production adapter is approved. Legacy already has a guide channel object
after channel ensure, while the Application request contains only scalar guild
and channel IDs. Resolving a channel inside a future adapter adds a new lookup,
failure surface, and ordering concern. This slice documents that risk only.
