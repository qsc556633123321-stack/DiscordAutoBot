# Guide Discord Mutation Adapter Preparation Blockers

Base: `4b1ef67`.

The Application Port is implemented but not wired. A production Discord adapter
is still prohibited in this slice.

## Primary Blocker

Legacy fetches a truthy tracked message ID **before** the Plan. A fetch rejection
or null becomes `existingMessageAvailable: false`, so the Plan selects Send.
By contrast, a future `edit(request)` receives a completed Edit decision. If it
then fails to look up the message, it cannot silently change the already-made
Edit decision to Send without a new caller contract. This is the pre-Plan lookup
semantic mismatch that blocks runtime redirect.

## Other Blockers

- Channel ensure and destination selection remain legacy-owned.
- Legacy edit/send rejection propagates; Port failure-result mapping has no
  runtime caller yet.
- Persistence and Roadmap remain ordered outer workflow steps.
