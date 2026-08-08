# Guide Mutation Adapter No Channel Resolution

Send uses the session's exact ensured Channel. The adapter does not resolve a
guild or channel after ensure, so post-ensure channel-resolution count is zero.
Edit likewise uses the retained Message without a channel lookup.
