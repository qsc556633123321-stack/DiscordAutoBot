# Community Roadmap Composition Dependency Direction

The approved future direction is:

`runtime/system -> composition -> infrastructure Pair Factory -> application Port`

Composition owns dependency assembly only. It does not own Session state,
Discord I/O, lookup decisions, persistence, or mutation behavior.
