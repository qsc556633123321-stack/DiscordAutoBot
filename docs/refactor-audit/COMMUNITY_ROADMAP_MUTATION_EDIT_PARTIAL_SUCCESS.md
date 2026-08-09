# Roadmap Edit Partial Success

When tracked-message Edit succeeds and `saveOnboarding` cannot write, Discord
has already edited the Message exactly once. The existing writer logs and
swallows the write failure, so `setupRoadmapPanel` resolves with the original
retained Message. There is no second edit, fallback send, rollback, retry, or
compensating persistence attempt.
