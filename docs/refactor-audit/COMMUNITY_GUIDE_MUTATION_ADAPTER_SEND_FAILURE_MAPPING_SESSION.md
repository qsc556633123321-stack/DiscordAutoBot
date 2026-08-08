# Guide Mutation Adapter Send Failure Mapping

An `Error` rejected by `session.sendMessage` maps to `Failure(SendRejected)`.
A non-Error rejection maps to `Failure(Unknown)`. A successful send without a
usable generated message ID maps to `Failure(MissingResource)`.
