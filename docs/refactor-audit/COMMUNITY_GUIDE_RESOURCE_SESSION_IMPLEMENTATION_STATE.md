# Guide Resource Session Implementation State

The implementation has exactly two internal values: the ensured Channel and a
retained Message initially set to `null`. Lookup sets the retained reference to
the exact fetched Message or `null`; Edit requires a retained reference; Send
uses the ensured Channel. It deliberately does not enforce a broader business
state machine, retries, repair, or normalization beyond this resource invariant.
