# Community Guide Pair Handoff Available Invariant

After a successful lookup, `getRetainedMessage()` returns the non-null exact `Message` instance fetched by that same Pair's Session. Repeated reads return the same identity until another lookup changes it.
