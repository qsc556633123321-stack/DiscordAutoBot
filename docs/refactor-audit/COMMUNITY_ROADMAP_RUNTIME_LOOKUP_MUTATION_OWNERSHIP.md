# Roadmap Lookup Redirect Mutation Ownership

This slice changes no mutation ownership. The future lookup-only redirect must
leave these legacy statements and their observable behavior in place:

- `message.edit(payload)`
- `channel.send(payload)`
- `saveOnboarding(guild.id, ...)` after successful mutation
- `{ channel, message }` return shape

No Roadmap mutation port, mutation adapter, mutation plan, or persistence
rewrite is approved here.
