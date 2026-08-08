# Guide Adapter Pair Composition Feature Implementation Pattern

`createCommunityGuideAdapterPairFeature` follows the existing Composition
factory style: it accepts an injectable dependency, validates it, and returns
only the public capability. Its default dependency is
`createGuidePublicationAdapterPair`.

The feature owns no Channel, Message, Session, Pair, cache, registry, or
module state. Calling the factory performs no Discord I/O. Pair construction
is lazy and delegated unchanged to the injected factory.
