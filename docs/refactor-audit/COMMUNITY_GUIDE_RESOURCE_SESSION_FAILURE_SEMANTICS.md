# Guide Resource Session Failure Semantics

Lookup rejection and null are characterized separately from edit/send
rejections, missing retained messages, and invalid conceptual transitions.
Legacy observable behavior remains the authority; the session only establishes
an internal resource-continuity invariant. This slice adds no retry, repair,
normalization, or error mapping to runtime.
