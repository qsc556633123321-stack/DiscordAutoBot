# Guide Mutation Plan Skip Runtime Decision

`Skip` is not reachable from the current Plan builder for any legacy Guide
input. Runtime has explicit Edit and Send branches plus an impossible-state
error for an unknown operation. It does not silently return or add Skip
semantics, preserving all valid legacy behavior.
