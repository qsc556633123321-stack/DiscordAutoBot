# Guide Invalid Channel Reachability

Missing `messages`, `messages.fetch`, or `send` cases are constructor-invalid
but unreachable from a successful legacy ensure path. Partial mocks, wrong
types, stale cache shapes, and malformed IDs are test-only or unverified as
successful ensure outputs. Ensure rejection is reachable and already aborts
before publication.
