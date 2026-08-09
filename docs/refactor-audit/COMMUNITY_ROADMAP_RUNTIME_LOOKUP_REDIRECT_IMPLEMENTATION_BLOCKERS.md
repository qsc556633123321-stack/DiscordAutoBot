# Community Roadmap Runtime Lookup Redirect: Implementation Blockers

This slice is limited to the tracked-message lookup. It does not authorize a
Roadmap mutation port, mutation adapter, mutation plan, persistence rewrite,
or generic publication runtime.

The remaining boundary is legacy-owned:

1. `message.edit(payload)` and `channel.send(payload)` mutation behavior.
2. `saveOnboarding` ordering, merge behavior, and write failure behavior.
3. Any retry, partial-success, or recovery semantics around those mutations.

The redirect itself is complete: falsy IDs skip lookup, truthy IDs call the
existing Pair Lookup Port once, `Available` consumes the retained message,
`Unavailable` keeps the legacy Send branch, and unknown results fail loudly.
