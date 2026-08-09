# Roadmap Available + Null Invariant

The implemented Resource Session cannot produce an `Available` lookup result
without retaining the fetched message. Therefore `Available` plus a `null`
Pair getter is unreachable in production under the current adapter contract.

The future lookup redirect must throw an invariant error in that impossible
state. It must not issue a second direct fetch, silently send a replacement,
or mask an adapter/session defect. The preparation candidate has explicit
coverage for this requirement.
