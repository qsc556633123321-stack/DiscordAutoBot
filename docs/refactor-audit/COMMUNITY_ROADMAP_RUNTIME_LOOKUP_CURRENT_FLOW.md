# Community Roadmap Runtime Lookup: Current Flow

`setupRoadmapPanel(guild)` currently ensures the Roadmap channel, creates one
Roadmap Adapter Pair and deliberately discards it, reads the legacy publication
record, resolves `publicationState.roadmap.messageId || data.roadmapMessageId`,
then performs `channel.messages.fetch(roadmapMessageId).catch(() => null)`.

- A falsy ID skips fetch and sends a new message.
- A truthy ID performs exactly one direct fetch. Truthy malformed values are
  passed through unchanged.
- A truthy message is edited; `null`, `undefined`, `false`, or any rejection
  results in a send.
- `saveOnboarding` runs only after edit/send succeeds, and the return value is
  always `{ channel, message }` on success.

Lookup, mutation, persistence ordering, retry behavior, and user-visible
failures remain legacy runtime contracts in this preparation slice.
