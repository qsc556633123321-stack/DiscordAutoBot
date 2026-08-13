# Existing DM Delivery Boundary Audit

## Result: None

No active Community Application, Infrastructure, or Composition component owns a
generic direct-message delivery operation with the Welcome contract. Existing
message mutation adapters are channel-publication specific and cannot be reused.

A future Welcome DM adapter must remain Infrastructure-facing and preserve exact
Member identity plus swallowed rejection behavior. It must not create a generic
Application Port carrying a Discord Member.
