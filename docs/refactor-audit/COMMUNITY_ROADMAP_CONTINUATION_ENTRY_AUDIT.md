# Roadmap Continuation Entry Audit

Public entry: `src/systems/communityConcierge.js#setupRoadmapPanel(guild)`.
It is exported and independently invoked; it is not called by
`setupCommunityGuide`. It has no mode or force parameter.

Execution order: ensure Roadmap channel, build payload, read the guild record,
lookup the stored message, edit or send, persist Roadmap IDs, then return
`{ channel, message }`. Channel, mutation, and persistence exceptions reject
the caller except lookup rejection, which becomes a send branch.
