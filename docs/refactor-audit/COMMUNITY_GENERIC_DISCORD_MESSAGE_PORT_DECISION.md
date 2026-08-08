# Community Generic Discord Message Port Decision

**Decision: Rejected.**

The first candidate has only one proven consumer: Guide publication. Roadmap
shares a superficially similar message lifecycle but has different channel
ensure, payload, failure, and persistence coupling. A generic port would add
unvalidated abstraction before a second consumer has compatible identity and
failure contracts. Use a Guide-specific contract first; reconsider generic
reuse only after independent Roadmap evidence exists.
