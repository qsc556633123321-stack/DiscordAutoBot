# Community Publication Persistence Consumer Reassessment

Active consumers remain `setupCommunityGuide()` and the direct Guide/Roadmap
commands characterized in the mutation baseline. Bootstrap and V3 callers are
indirect consumers. None imports this prepared port, operation module, or
test-only in-memory store.

This is not a runtime consumer migration. Future wiring must preserve message
ordering, persistence failures, retry behavior, and shared-record ownership.
