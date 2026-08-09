# Community Roadmap Lookup Adapter Unknown Result Policy

Only Session `{ kind: 'Available', messageId }` and `{ kind: 'Unavailable' }`
are valid. `null`, `undefined`, missing `kind`, and an unknown kind are
programming/invariant failures and must throw. They must not be silently mapped
to Unavailable, because ordinary Discord fetch rejection is already swallowed
inside the Resource Session.
