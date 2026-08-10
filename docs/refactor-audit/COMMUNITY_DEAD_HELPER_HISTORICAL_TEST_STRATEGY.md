# Community Dead Helper Historical Test Strategy

Update historical source-string and deadness guards to the post-cleanup
contract. Preserve test-only legacy fakes where they document prior behavior,
but do not let them require production helper definitions. No test must be
retired before cleanup implementation.
