# Guide Resource Session Creation Boundary

The future runtime, immediately after `getOrCreateGuideChannel(guild)`, is the
only candidate creator. Composition cannot own per-invocation Discord objects;
lookup/mutation adapters cannot independently create a session without
duplicating ensure behavior. A session must never ensure or create a channel.
This is a decision record only: no runtime creation has been implemented.
