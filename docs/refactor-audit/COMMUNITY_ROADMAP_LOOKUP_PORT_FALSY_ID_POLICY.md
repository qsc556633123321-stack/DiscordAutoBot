# Community Roadmap Lookup Port Falsy ID Policy

Legacy runtime owns the current truthiness rule. `undefined`, `null`, `''`,
`0`, and `false` skip fetch and take the send path. Truthy malformed values are
still passed through to `messages.fetch` and any rejection is swallowed.

A future port must receive the exact `messageId` value in
`lookupTrackedMessage({ messageId })`; it must not normalize, stringify, or
validate it. The session preserves the legacy truthiness branch and reports
`Unavailable` for every falsy value. Runtime branch ownership remains unchanged
until a separately approved runtime redirect.
