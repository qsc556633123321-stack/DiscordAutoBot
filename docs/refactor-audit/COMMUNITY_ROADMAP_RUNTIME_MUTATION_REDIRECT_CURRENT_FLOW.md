# Community Roadmap Runtime Mutation Redirect Current Flow

## Frozen legacy path

`src/systems/communityConcierge.js#setupRoadmapPanel` first ensures the
Roadmap channel, creates a per-invocation Roadmap Pair, reads the legacy
publication record, and builds the Roadmap payload.

For a tracked message that lookup makes available, the runtime retains the raw
Discord message `M` and executes `await M.edit(payload)`. The resolved edit
value is ignored: persistence uses `M.id` and the method returns
`{ channel, message: M }`.

When lookup is unavailable, the runtime executes
`message = await channel.send(payload)`. The raw sent message `S` provides the
persisted ID and is returned as `{ channel, message: S }`.

In both branches Discord mutation completes before the legacy persistence
writer runs. Writer failures are logged and swallowed by legacy runtime; raw
Discord mutation failures propagate unchanged. The current runtime does not
retry, roll back, issue a fallback send, or perform a post-mutation fetch.

## Future redirect boundary

The next implementation may replace only the direct Edit/Send calls. Channel
ensure, lookup, payload construction, writer invocation, writer swallowing,
and return shape remain legacy-owned.
