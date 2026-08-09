# Community Roadmap Mutation Boundary Preparation: Blockers

No production mutation migration is approved in this slice. The current
legacy-owned behavior includes direct `message.edit`, `channel.send`, and
runtime persistence sequencing.

The baseline established one important partial-success contract: a Discord
Edit/Send can succeed while `saveOnboarding` logs and swallows a persistence
write failure; `setupRoadmapPanel` still resolves with the Discord message.
No retry, rollback, resend, delete, or compensating write occurs.

An implementation must not proceed until a Roadmap-specific mutation Port
shape and retained Discord message handoff are separately approved.
