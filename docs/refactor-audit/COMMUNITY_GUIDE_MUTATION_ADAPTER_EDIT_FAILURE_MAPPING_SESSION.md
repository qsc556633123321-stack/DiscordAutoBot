# Guide Mutation Adapter Edit Failure Mapping

An `Error` rejected by `session.editTrackedMessage` maps to
`Failure(EditRejected)`, including the session's no-retained-message error. A
non-Error rejection maps to `Failure(Unknown)`. The raw error remains inside
infrastructure and does not appear in the result.
