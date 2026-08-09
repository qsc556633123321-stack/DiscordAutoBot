# Community Roadmap Runtime Mutation Redirect Approved Diff

The later implementation may modify only the Roadmap mutation portion of
`src/systems/communityConcierge.js`:

1. Destructure the already-provided `mutationPort` from the existing Pair.
2. Replace `await message.edit(payload)` with
   `await mutationPort.edit({ messageId: message.id, payload })`, retaining
   local raw `M`.
3. Replace `message = await channel.send(payload)` with
   `mutationPort.send({ payload })`, recover raw `S` once, and validate its ID.

Lookup, payload creation, persistence sequencing, writer error swallowing,
return shape, Pair, Composition, Adapter, Session, and Port stay unchanged.
