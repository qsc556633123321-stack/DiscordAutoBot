# Guide Mutation Adapter Send Success Mapping

The frozen candidate maps `session.sendMessage(payload)` to `SendSuccess` using
the returned Message's `id`. A missing, null, or empty generated ID maps to
`Failure(MissingResource)`. No raw Message is returned.
