# Community Guide Runtime Lookup Redirect Preparation Blockers

1. The public Lookup Result has no exact Message object.
2. The Resource Session retains the Message privately and provides no lookup-safe handoff accessor.
3. Redirecting through Mutation Port is out of scope and would change mutation ownership.
4. A second legacy fetch would violate exact fetch count and failure timing.

Runtime lookup remains legacy-owned. No production runtime, infrastructure, composition, application, persistence, Roadmap, JSON, or environment file changed in this slice.
