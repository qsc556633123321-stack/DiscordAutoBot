# Guide Runtime Pair Lifetime

Each future `setupCommunityGuide` invocation must create a fresh Pair from the
exact ensured Channel. Same-guild, repeated, and concurrent invocations may
not share a Pair or Session.
