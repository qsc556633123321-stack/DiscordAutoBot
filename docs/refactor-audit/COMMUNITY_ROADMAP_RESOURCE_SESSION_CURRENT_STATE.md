# Community Roadmap Resource Session Current State

Current production Session validates an ensured channel with `id` and
`messages.fetch`, owns `retainedMessage`, and exposes only `getChannelId`,
`getRetainedMessage`, and `lookupTrackedMessage`. Lookup clears retained state
on falsy ID, unavailable message, or rejected fetch, while swallowing fetch
rejection. It has no mutation or failure-handoff state.
