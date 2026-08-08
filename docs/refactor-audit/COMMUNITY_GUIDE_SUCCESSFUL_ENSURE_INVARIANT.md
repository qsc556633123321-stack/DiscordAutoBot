# Guide Successful Ensure Invariant

The invariant is source-derived: a successful `getOrCreateGuideChannel` return
is the actual existing or newly-created Discord text-channel object after
required move/overwrite awaits. It is not a generic channel abstraction and
does not claim every mock shaped like a channel is production-valid.
