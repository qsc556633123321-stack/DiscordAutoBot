# Guide Resource Session Implementation Lifetime

The production session is per invocation by caller ownership. It is not cached,
registered, global, singleton, or shared by guild/channel. It has no dispose
registry, TTL, timer, or cleanup daemon. Its references become unreachable when
the caller's invocation finishes. This module does not create the invocation;
runtime remains unwired in this slice.
