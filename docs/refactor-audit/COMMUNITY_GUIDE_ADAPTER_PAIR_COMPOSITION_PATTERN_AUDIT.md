# Guide Adapter Pair Composition Pattern Audit

Existing composition factories build stateless dependencies. A Resource Session captures a Discord Channel and retained Message, so it cannot be a composition singleton, cache entry, or per-guild shared dependency.
