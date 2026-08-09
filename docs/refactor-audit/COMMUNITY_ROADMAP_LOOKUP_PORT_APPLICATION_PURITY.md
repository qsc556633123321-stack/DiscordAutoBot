# Community Roadmap Lookup Port Application Purity

The future application-facing request and result use only primitives and plain
objects. They cannot expose a Discord `Message`, `Channel`, `Guild`, client,
`Error`, or resource session. Exact Discord message identity remains private to
the per-invocation Roadmap Resource Session and is available only through its
retained-message accessor for a future runtime handoff.

This slice contains test fakes only; it adds no production application port.
