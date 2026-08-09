# Community Roadmap Runtime Mutation Current Flow

`setupRoadmapPanel` ensures the channel, creates one Composition Pair, performs
lookup and retained-message recovery, then directly edits `message` or sends a
new message. It persists the resulting legacy raw message ID and returns the
exact ensured channel and raw message. Persistence failures are swallowed after
the Discord mutation.
