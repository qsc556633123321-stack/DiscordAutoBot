# Message Handoff Unavailable Contract

LookupSkipped, MessageUnavailable, and caught lookup rejection all leave retained/handoff Message as `null`. The plan selects Send. No stale Message from a prior lookup or invocation may be reused.
