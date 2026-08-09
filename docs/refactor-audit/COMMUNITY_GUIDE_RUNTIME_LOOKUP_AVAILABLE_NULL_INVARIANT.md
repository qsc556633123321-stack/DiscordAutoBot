# Available and Null Invariant

`MessageAvailable` with a null getter is an infrastructure invariant violation, not a condition for a fallback fetch. This preparation slice defines no runtime failure behavior for that impossible state.
