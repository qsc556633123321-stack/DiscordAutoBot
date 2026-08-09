# Community Roadmap Pair Mutation Failure Getter Decision

Decision: **Do Not Expose** `getRetainedMutationFailure` from the future
Roadmap Pair. The Resource Session keeps it for its own diagnostic state, but
the mutation adapter propagates the exact raw rejection, including
`undefined`. No runtime consumer, persistence writer, or approved migration
requires a Pair-level diagnostic getter.
