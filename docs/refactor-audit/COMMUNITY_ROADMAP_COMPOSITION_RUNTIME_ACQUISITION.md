# Community Roadmap Composition Runtime Acquisition

A future runtime may import only the composition feature and acquire a pair by
calling `feature.createAdapterPair({ ensuredChannel })`. It must not import the
Roadmap Resource Session, Lookup Adapter, or Pair Factory directly.

This is a forecast only. The current Concierge runtime continues its legacy
direct lookup behavior.
