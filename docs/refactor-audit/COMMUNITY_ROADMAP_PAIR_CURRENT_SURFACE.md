# Community Roadmap Pair Current Surface

`createRoadmapPublicationAdapterPair({ ensuredChannel })` creates one
`RoadmapPublicationResourceSession` and one Lookup Adapter over that Session.
Its exact public keys are `lookupPort` and `getRetainedMessage`. It exposes no
raw Session, Message, mutation capability, or failure getter. Construction
failures propagate unchanged; the Pair has no persistence responsibility.
