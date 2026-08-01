# Community Welcome Delivery Result Compatibility Contract

Legacy outward behavior is void/`undefined` on success, early return, and swallowed DM rejection; selected pre-send errors reject. `guildMemberAdd.execute` awaits the function, catches rejection, logs, and ignores the resolved value.

A direct Result object would change the function return shape and could affect unseen consumers. Dual-mode, internal-only, wrapper, shadow, and Result+Reason integration all need an explicit later approval. A failed Result must not silently replace a legacy throw, and a skipped Result must not alter the early-return branch.
