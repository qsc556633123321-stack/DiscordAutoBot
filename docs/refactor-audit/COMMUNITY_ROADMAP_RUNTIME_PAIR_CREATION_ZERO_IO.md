# Community Roadmap Runtime Pair Creation Zero-I/O Contract

Feature construction, Pair creation, resource-session construction, lookup
adapter construction, and retained-message getter access all perform zero
Discord fetch, edit, send, or persistence I/O. In the approved next slice, the
only Roadmap lookup remains the legacy direct fetch: one fetch for a truthy id,
and zero fetches for `undefined`, `null`, `''`, `0`, or `false`.

Creating an unused Pair must therefore add no observable work before the
existing legacy lookup/edit/send path.
