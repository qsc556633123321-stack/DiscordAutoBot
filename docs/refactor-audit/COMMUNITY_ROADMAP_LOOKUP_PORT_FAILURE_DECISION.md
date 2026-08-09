# Community Roadmap Lookup Port Failure Decision

Discord fetch rejections are legacy-compatible lookup misses: the Roadmap
Resource Session swallows every rejection and returns `{ kind: 'Unavailable' }`.
The application contract therefore has no `Failure` result for normal fetch
errors.

Invalid session construction remains an infrastructure invariant failure and
throws before lookup. Future adapter programming defects are not converted into
an application result by this preparation slice. This keeps the future port
small while preserving the observable legacy send path for lookup rejection.
