# Community Guide/Roadmap Duplicate Publication Contract

The only observed identity mechanism is the persisted `guideMessageId` or
`roadmapMessageId`. There is no message scan, marker, custom ID, title search,
channel-history repair, or idempotency key.

- If an ID exists and `messages.fetch()` resolves, the message is edited.
- If it is missing, fetch rejects, or persistence failed after a previous send,
  the next call sends a new message.
- A failed JSON write therefore has no rollback or compensation and produces a
  duplicate risk on retry for both Guide and Roadmap.
- The current runtime has no repair algorithm and no concurrency protection.

Do not add a marker or idempotency mechanism during a future slice without a
separate compatibility decision: it would alter the frozen legacy contract.
