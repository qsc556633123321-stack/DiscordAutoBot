# Community Roadmap Mutation Port Implementation Blockers

The Application contract is implemented, but the runtime remains legacy-owned.
Do not add an Adapter, mutate the Resource Session, expose `mutationPort` on
the Pair, or redirect `setupRoadmapPanel()` in this slice.

Future work must first characterize exact raw rejection handoff, including a
distinct `undefined` rejection, while preserving retained Edit `M`, exact Send
`S`, and the writer-swallowed persistence partial-success contract.
