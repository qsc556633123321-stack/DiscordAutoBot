# Community Roadmap Mutation Port Style Audit

Guide's established Application convention uses separate `edit` and `send`
methods, immutable scalar request factories, `EditSuccess`/`SendSuccess`
results, CommonJS exports, and a narrow port assertion. Roadmap should mirror
the operation shape, not reuse Guide's Port: retained-message and failure
handoff semantics remain Roadmap-specific.

No Guide source was copied or changed in this preparation slice.
