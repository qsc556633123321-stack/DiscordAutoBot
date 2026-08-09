# Roadmap Runtime Lookup Redirect Preparation Blockers

There is no blocker for a narrowly scoped lookup-only redirect. The following
are explicit exclusions and remain blockers for larger work:

1. Legacy Edit/Send mutation ownership and failure behavior.
2. Legacy persistence ordering and writer ownership.
3. Any generic publication abstraction or cross-feature rewrite.
4. Identity validation or normalization of truthy malformed message IDs.

The approved next implementation must retain these boundaries unchanged.
