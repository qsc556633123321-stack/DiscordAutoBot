# Guide Adapter Pair Session Encapsulation

The proposed pair exposes only `lookupPort` and `mutationPort`; it does not expose Session to Application. Debug-only and Application Session access are rejected to preserve infrastructure containment.
