# Roadmap Lookup Message Identity Proof

For a successful tracked-message lookup, the Discord message returned by
`messages.fetch` is retained by the Resource Session. The Lookup Adapter only
returns its application-safe discriminator and message ID; the Pair getter
returns that same retained object. The test-only redirect candidate passes that
exact object to legacy `message.edit(payload)` and returns it as `message`.

There is no lookup fallback fetch and no second fetch in this branch.
